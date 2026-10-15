import { eq } from 'drizzle-orm';
import { getDb } from '../../lib/db';
import { users, tenantMemberships, temples, tenants } from '../../lib/db/schema';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../../lib/auth/password';
import { createSessionToken, revokeSessionToken, type SessionPayload } from '../../lib/auth/session';
import { verifyMfaToken, generateMfaSecret } from '../../lib/auth/mfa';
import { checkRateLimit } from '../../lib/auth/rate-limiter';
import { logAuditEvent } from '../../lib/audit/logger';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  platformRole?: 'none' | 'platform_super_admin' | 'platform_support' | 'platform_finance';
  requestId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  mfaCode?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export class AuthService {
  /**
   * Register a new user (Devotee or Staff)
   * FR-AUTH-001, FR-AUTH-005
   */
  static async register(input: RegisterInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;

    // 1. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input.email || !emailRegex.test(input.email)) {
      throw new Error('A valid email address is required');
    }

    // 2. Validate password strength
    const pwdCheck = validatePasswordStrength(input.password);
    if (!pwdCheck.valid) {
      throw new Error(pwdCheck.reason);
    }

    // 3. Check for existing user (generic error to avoid leaking details on public endpoints)
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Account with this email already exists');
    }

    // 4. Hash password with bcrypt
    const passwordHash = await hashPassword(input.password);

    // 5. Insert user record
    const [newUser] = await db
      .insert(users)
      .values({
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        phone: input.phone || null,
        platformRole: input.platformRole || 'none',
        isActive: true,
      })
      .returning();

    // 6. Record audit event (FR-AUD-001, FR-AUD-002)
    await logAuditEvent(db, {
      actorUserId: newUser.id,
      actorRole: newUser.platformRole,
      action: 'user.registered',
      resourceType: 'user',
      resourceId: newUser.id,
      requestId,
      changeSummary: { email: newUser.email, name: newUser.name },
    });

    // 7. Generate session token
    const token = createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      platformRole: newUser.platformRole,
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        platformRole: newUser.platformRole,
        mfaEnabled: newUser.mfaEnabled,
      },
      token,
    };
  }

  /**
   * Authenticate user, evaluate MFA for privileged platform accounts, rate limit (FR-AUTH-001, FR-AUTH-004, FR-AUTH-005)
   */
  static async login(input: LoginInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;
    const rateLimitKey = `auth_${input.email.toLowerCase()}_${input.ipAddress || 'unknown'}`;

    // 1. Rate-limiting check (FR-AUTH-005)
    const rateLimit = checkRateLimit(rateLimitKey, {
      windowMs: 15 * 60 * 1000,
      maxAttempts: 5,
    });
    if (!rateLimit.allowed) {
      throw new Error(
        `Too many login attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`
      );
    }

    // 2. Fetch user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()))
      .limit(1);

    if (!user || !user.isActive) {
      // Intentionally uniform error message to prevent enumeration (FR-AUTH-005)
      throw new Error('Invalid email or password');
    }

    // 3. Verify password
    const passwordValid = await verifyPassword(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new Error('Invalid email or password');
    }

    // 4. Strong auth / MFA validation for privileged platform accounts (FR-AUTH-004)
    const isPrivileged = user.platformRole !== 'none';
    if (isPrivileged || user.mfaEnabled) {
      if (!input.mfaCode) {
        return {
          requiresMfa: true,
          userId: user.id,
          message: 'Multi-factor authentication code required',
        };
      }
      if (!user.mfaSecret || !verifyMfaToken(user.mfaSecret, input.mfaCode)) {
        throw new Error('Invalid MFA authentication code');
      }
    }

    // 5. Fetch user's tenant memberships (FR-AUTH-003)
    const memberships = await db
      .select({
        id: tenantMemberships.id,
        tenantId: tenantMemberships.tenantId,
        tenantSlug: tenants.slug,
        tenantName: tenants.name,
        role: tenantMemberships.role,
        assignedTempleId: tenantMemberships.assignedTempleId,
      })
      .from(tenantMemberships)
      .innerJoin(tenants, eq(tenantMemberships.tenantId, tenants.id))
      .where(eq(tenantMemberships.userId, user.id));

    // 6. Generate Session Token (FR-AUTH-002)
    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      platformRole: user.platformRole,
    };
    const token = createSessionToken(sessionPayload);

    // 7. Audit Log
    await logAuditEvent(db, {
      actorUserId: user.id,
      actorRole: user.platformRole,
      action: 'user.login',
      resourceType: 'session',
      resourceId: user.id,
      requestId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        platformRole: user.platformRole,
        mfaEnabled: user.mfaEnabled,
      },
      memberships,
    };
  }

  /**
   * Setup TOTP MFA for account (FR-AUTH-004)
   */
  static async setupMfa(userId: string) {
    const { db } = await getDb();
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new Error('User not found');

    const mfa = generateMfaSecret(user.email);
    await db.update(users).set({ mfaSecret: mfa.secret }).where(eq(users.id, userId));

    return { secret: mfa.secret, uri: mfa.uri };
  }

  /**
   * Confirm and activate MFA with token
   */
  static async confirmMfa(userId: string, token: string, requestId = `req_${Date.now()}`) {
    const { db } = await getDb();
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || !user.mfaSecret) throw new Error('MFA setup has not been initiated');

    const valid = verifyMfaToken(user.mfaSecret, token);
    if (!valid) throw new Error('Invalid MFA token');

    await db.update(users).set({ mfaEnabled: true }).where(eq(users.id, userId));

    await logAuditEvent(db, {
      actorUserId: user.id,
      actorRole: user.platformRole,
      action: 'user.mfa_enabled',
      resourceType: 'user',
      resourceId: user.id,
      requestId,
    });

    return { success: true };
  }

  /**
   * Revoke session on logout (FR-AUTH-002)
   */
  static async logout(token: string) {
    revokeSessionToken(token);
    return { success: true };
  }
}
