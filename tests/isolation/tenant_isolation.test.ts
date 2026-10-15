import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { runMigrations } from '../../src/lib/db/migrate';
import { getDb, withTenantContext, closeDb } from '../../src/lib/db';
import { sql, eq } from 'drizzle-orm';
import { temples, auditLogs } from '../../src/lib/db/schema';
import { AuthService } from '../../src/modules/identity/auth.service';
import { TenantService } from '../../src/modules/tenants/tenant.service';
import { MembershipService } from '../../src/modules/tenants/membership.service';
import { hasPermission } from '../../src/lib/rbac/roles';
import { Permissions } from '../../src/lib/rbac/permissions';
import { verifySessionToken } from '../../src/lib/auth/session';
import * as OTPAuth from 'otpauth';

describe('Phase 0 & 1: Multi-Tenant Architecture, Auth, RBAC & Isolation Suite', () => {
  let platformAdmin: any;

  before(async () => {
    // 1. Run schema migrations and RLS initialization
    await runMigrations();

    // 2. Register initial platform super admin
    const adminReg = await AuthService.register({
      email: `initial_super_admin_${Date.now()}@shirimandir.org`,
      password: 'PlatformSuperPassword123!',
      name: 'Platform Operator',
      platformRole: 'platform_super_admin',
    });
    platformAdmin = adminReg.user;
  });

  after(async () => {
    await closeDb();
  });

  // --------------------------------------------------------------------------
  // AT-11: POOLED CONNECTION REUSE & RLS TENANT CONTEXT ISOLATION
  // --------------------------------------------------------------------------
  describe('AT-11: Connection Reuse & RLS State Isolation', () => {
    test('AT-11: Connection reused after tenant transaction does NOT leak tenant context', async () => {
      const { db } = await getDb();
      const testTenantId = '11111111-1111-4111-a111-111111111111';

      // 1. Execute a transaction with tenant context
      await withTenantContext(testTenantId, async (tx) => {
        const result = await tx.execute(
          sql`SELECT current_setting('app.current_tenant_id', true) AS current_tenant`
        );
        const rows = result.rows || result;
        assert.equal(rows[0].current_tenant, testTenantId);
      });

      // 2. Query again outside the transaction / on the connection
      // PostgreSQL SET LOCAL guarantees automatic reset upon transaction end.
      const freshResult = await db.execute(
        sql`SELECT current_setting('app.current_tenant_id', true) AS current_tenant`
      );
      const freshRows = freshResult.rows || freshResult;
      const currentSetting = freshRows[0]?.current_tenant;

      // Must be empty / null / unset
      assert.ok(
        !currentSetting || currentSetting === '',
        'Tenant context must not persist after tenant-scoped transaction completes'
      );
    });
  });

  // --------------------------------------------------------------------------
  // FR-AUTH-001 TO 005: IDENTITY, SESSIONS, MFA & RATE LIMITING
  // --------------------------------------------------------------------------
  describe('Identity, Auth, MFA & Rate Limiting (FR-AUTH-001..005)', () => {
    const devoteeEmail = `devotee_${Date.now()}@devotee.org`;
    const password = 'StrongPassword123!';
    let devoteeToken = '';
    let devoteeUserId = '';

    test('FR-AUTH-001: Register user with validation & secure password hashing', async () => {
      const res = await AuthService.register({
        email: devoteeEmail,
        password,
        name: 'Arjun Devotee',
      });

      assert.ok(res.user.id);
      assert.equal(res.user.email, devoteeEmail);
      assert.ok(res.token);
      devoteeToken = res.token;
      devoteeUserId = res.user.id;
    });

    test('FR-AUTH-005: Reject invalid email format and weak passwords', async () => {
      await assert.rejects(
        () =>
          AuthService.register({
            email: 'not-an-email',
            password: 'StrongPassword123!',
            name: 'Invalid',
          }),
        /valid email/i
      );

      await assert.rejects(
        () =>
          AuthService.register({
            email: `weak_${Date.now()}@test.org`,
            password: 'short',
            name: 'Weak',
          }),
        /at least 8 characters/i
      );
    });

    test('FR-AUTH-002: Verify session token and test logout revocation', async () => {
      const session = verifySessionToken(devoteeToken);
      assert.ok(session);
      assert.equal(session?.email, devoteeEmail);

      // Logout revokes token
      await AuthService.logout(devoteeToken);
      const revoked = verifySessionToken(devoteeToken);
      assert.equal(revoked, null, 'Revoked token must not be accepted');
    });

    test('FR-AUTH-004: Privileged platform account requires MFA challenge', async () => {
      const privilegedEmail = `mfa_admin_${Date.now()}@platform.org`;
      const adminReg = await AuthService.register({
        email: privilegedEmail,
        password,
        name: 'MFA Super Admin',
        platformRole: 'platform_super_admin',
      });
      const adminUserId = adminReg.user.id;

      // Setup TOTP secret
      const { secret } = await AuthService.setupMfa(adminUserId);
      const totp = new OTPAuth.TOTP({
        issuer: 'Shiri Mandir SaaS',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });
      const validCode = totp.generate();

      // Confirm MFA activation
      await AuthService.confirmMfa(adminUserId, validCode);

      // Attempt login without MFA code -> should request MFA
      const loginAttempt1 = await AuthService.login({
        email: privilegedEmail,
        password,
      });
      assert.equal(loginAttempt1.requiresMfa, true);

      // Attempt login with incorrect MFA code -> should reject
      await assert.rejects(
        () =>
          AuthService.login({
            email: privilegedEmail,
            password,
            mfaCode: '000000',
          }),
        /Invalid MFA/i
      );

      // Attempt login with valid MFA code -> should succeed
      const loginAttempt2 = await AuthService.login({
        email: privilegedEmail,
        password,
        mfaCode: totp.generate(),
      });
      assert.ok(loginAttempt2.token);
      assert.equal(loginAttempt2.user?.email, privilegedEmail);
    });

    test('FR-AUTH-005: Rate-limiting triggers on repeated failed login attempts', async () => {
      const testEmail = `brute_${Date.now()}@attack.com`;
      const testIp = '192.168.1.100';

      // 5 failed attempts
      for (let i = 0; i < 5; i++) {
        try {
          await AuthService.login({
            email: testEmail,
            password: 'WrongPassword',
            ipAddress: testIp,
          });
        } catch (err: any) {
          assert.match(err.message, /Invalid email or password/i);
        }
      }

      // 6th attempt should be blocked by rate limiter
      await assert.rejects(
        () =>
          AuthService.login({
            email: testEmail,
            password: 'WrongPassword',
            ipAddress: testIp,
          }),
        /Too many login attempts/i
      );
    });
  });

  // --------------------------------------------------------------------------
  // FR-TEN-001 TO 005: TENANTS & TEMPLES LIFECYCLE
  // --------------------------------------------------------------------------
  describe('Tenants & Temples Lifecycle (FR-TEN-001..005)', () => {
    let tenantA: any;
    let tenantB: any;

    test('FR-TEN-001: Platform super admin creates and approves tenant organizations', async () => {
      tenantA = await TenantService.createTenant({
        slug: `kashi-trust-${Date.now()}`,
        name: 'Kashi Vishwanath Trust',
        actorUserId: platformAdmin.id,
        actorRole: platformAdmin.platformRole,
      });
      assert.equal(tenantA.status, 'pending_approval');

      // Approve tenant
      const approved = await TenantService.updateTenantStatus({
        tenantId: tenantA.id,
        status: 'active',
        actorUserId: platformAdmin.id,
        actorRole: platformAdmin.platformRole,
      });
      assert.equal(approved.status, 'active');

      tenantB = await TenantService.createTenant({
        slug: `somnath-trust-${Date.now()}`,
        name: 'Shree Somnath Trust',
        actorUserId: platformAdmin.id,
        actorRole: platformAdmin.platformRole,
      });
      await TenantService.updateTenantStatus({
        tenantId: tenantB.id,
        status: 'active',
        actorUserId: platformAdmin.id,
        actorRole: platformAdmin.platformRole,
      });
    });

    test('FR-TEN-002 & FR-TEN-005: Tenant contains multiple temples with tenant-scoped slugs', async () => {
      // Create first temple in Tenant A
      const temple1 = await TenantService.createTemple({
        tenantId: tenantA.id,
        slug: 'main-shrine',
        name: 'Kashi Vishwanath Main Shrine',
        address: 'Varanasi, UP',
        contactEmail: 'contact@kashi.org',
        contactPhone: '9876543210',
        actorUserId: platformAdmin.id,
        actorRole: platformAdmin.platformRole,
      });
      assert.ok(temple1.id);

      // Duplicate slug in Tenant A must be rejected (FR-TEN-005)
      await assert.rejects(
        () =>
          TenantService.createTemple({
            tenantId: tenantA.id,
            slug: 'main-shrine',
            name: 'Duplicate Shrine',
            address: 'Varanasi, UP',
            contactEmail: 'contact@kashi.org',
            contactPhone: '9876543210',
            actorUserId: platformAdmin.id,
            actorRole: platformAdmin.platformRole,
          }),
        /already active in this tenant/i
      );

      // Same slug 'main-shrine' in Tenant B MUST succeed (tenant-scoped slug isolation)
      const templeB = await TenantService.createTemple({
        tenantId: tenantB.id,
        slug: 'main-shrine',
        name: 'Somnath Jyotirlinga Main Shrine',
        address: 'Prabhas Patan, Gujarat',
        contactEmail: 'contact@somnath.org',
        contactPhone: '9876543211',
        actorUserId: platformAdmin.id,
        actorRole: platformAdmin.platformRole,
      });
      assert.ok(templeB.id);
      assert.notEqual(temple1.id, templeB.id);
      assert.equal(templeB.slug, 'main-shrine');
    });

    test('FR-TEN-003: Update temple profile and timezone', async () => {
      const temple = await TenantService.getTemple(tenantA.id, 'main-shrine');
      assert.ok(temple);

      const updated = await TenantService.updateTemple(
        tenantA.id,
        temple.id,
        {
          description: 'The sacred golden spire temple of Lord Shiva.',
          timezone: 'Asia/Kolkata',
          branding: {
            logoUrl: 'https://cdn.shirimandir.org/kashi-logo.png',
            primaryColor: '#b91c1c',
          },
        },
        platformAdmin.id,
        platformAdmin.platformRole
      );

      assert.equal(updated.description, 'The sacred golden spire temple of Lord Shiva.');
      assert.equal((updated.branding as any).primaryColor, '#b91c1c');
    });

    // ------------------------------------------------------------------------
    // AT-01: CROSS-TENANT ISOLATION GUARANTEE
    // ------------------------------------------------------------------------
    test('AT-01: Tenant A cannot retrieve or mutate Tenant B temple by ID', async () => {
      const templeB = await TenantService.getTemple(tenantB.id, 'main-shrine');
      assert.ok(templeB);

      // 1. Tenant A queries Tenant B's temple ID -> Returns null (isolated)
      const crossFetch = await TenantService.getTemple(tenantA.id, templeB.id);
      assert.equal(crossFetch, null, 'Tenant A must not be able to find Tenant B resource');

      // 2. Tenant A attempts to update Tenant B's temple ID -> Throws error
      await assert.rejects(
        () =>
          TenantService.updateTemple(
            tenantA.id,
            templeB.id,
            { name: 'Hacked by Tenant A' },
            platformAdmin.id,
            'trust_admin'
          ),
        /not found or unauthorized/i
      );

      // Verify Tenant B resource remained unmutated
      const verifiedB = await TenantService.getTemple(tenantB.id, templeB.id);
      assert.equal(verifiedB?.name, 'Somnath Jyotirlinga Main Shrine');
    });
  });

  // --------------------------------------------------------------------------
  // FR-RBAC-001 TO 005: MEMBERSHIPS & GRANULAR PERMISSIONS
  // --------------------------------------------------------------------------
  describe('Memberships & Granular RBAC (FR-RBAC-001..005)', () => {
    let tenant: any;
    let staffUser: any;
    let membership: any;

    before(async () => {
      tenant = await TenantService.createTenant({
        slug: `rbac-trust-${Date.now()}`,
        name: 'RBAC Test Trust',
        actorUserId: platformAdmin.id,
        actorRole: platformAdmin.platformRole,
      });
      await TenantService.updateTenantStatus({
        tenantId: tenant.id,
        status: 'active',
        actorUserId: platformAdmin.id,
        actorRole: platformAdmin.platformRole,
      });

      const userRes = await AuthService.register({
        email: `manager_${Date.now()}@test.org`,
        password: 'Password123!',
        name: 'Puja Manager Raman',
      });
      staffUser = userRes.user;
    });

    test('FR-RBAC-001 & FR-RBAC-002: Invite user with server-validated role', async () => {
      membership = await MembershipService.inviteMember({
        tenantId: tenant.id,
        userEmail: staffUser.email,
        role: 'puja_manager',
        actorUserId: platformAdmin.id,
        actorRole: 'trust_admin',
      });

      assert.ok(membership.id);
      assert.equal(membership.role, 'puja_manager');
    });

    test('FR-RBAC-003: Granular permission evaluation for puja_manager', () => {
      // Puja manager has pujas.write, slots.write, bookings.check_in
      assert.equal(
        hasPermission(membership.role, null, Permissions.PUJAS_WRITE),
        true,
        'Puja manager must have pujas.write'
      );
      assert.equal(
        hasPermission(membership.role, null, Permissions.BOOKINGS_CHECK_IN),
        true,
        'Puja manager must have bookings.check_in'
      );

      // Puja manager MUST NOT have finance / refunds / member management permissions
      assert.equal(
        hasPermission(membership.role, null, Permissions.REPORTS_FINANCE_READ),
        false,
        'Puja manager must NOT have reports.finance.read'
      );
      assert.equal(
        hasPermission(membership.role, null, Permissions.PAYMENTS_REFUND),
        false,
        'Puja manager must NOT have payments.refund'
      );
      assert.equal(
        hasPermission(membership.role, null, Permissions.MEMBERS_INVITE),
        false,
        'Puja manager must NOT have members.invite'
      );
    });

    test('FR-RBAC-002 & FR-RBAC-005: Update member role to temple_accountant', async () => {
      const updated = await MembershipService.updateMemberRole({
        tenantId: tenant.id,
        membershipId: membership.id,
        newRole: 'temple_accountant',
        actorUserId: platformAdmin.id,
        actorRole: 'trust_admin',
      });

      assert.equal(updated.role, 'temple_accountant');

      // Now has finance permissions, but loses slot write
      assert.equal(
        hasPermission(updated.role, null, Permissions.REPORTS_FINANCE_READ),
        true
      );
      assert.equal(
        hasPermission(updated.role, null, Permissions.SLOTS_WRITE),
        false
      );
    });

    test('FR-RBAC-005: Audit logs verify records of membership and role modifications', async () => {
      const { db } = await getDb();
      const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.tenantId, tenant.id));

      const actions = logs.map((l) => l.action);
      assert.ok(
        actions.includes('membership.invited'),
        'Audit log must record membership invitation'
      );
      assert.ok(
        actions.includes('membership.role_updated'),
        'Audit log must record role changes'
      );
    });
  });

  // --------------------------------------------------------------------------
  // FR-AUD-001 TO 003: AUDIT EVENT SANITIZATION
  // --------------------------------------------------------------------------
  describe('Audit Trail & Sensitive Data Sanitization (FR-AUD-001..003)', () => {
    test('FR-AUD-003: Audit log strips passwords, secrets, and tokens from payloads', async () => {
      const { db } = await getDb();
      const userRes = await AuthService.register({
        email: `audit_check_${Date.now()}@test.org`,
        password: 'TopSecretPassword99!',
        name: 'Audit Test Devotee',
      });

      const [log] = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.resourceId, userRes.user.id))
        .limit(1);

      assert.ok(log);
      const summaryStr = JSON.stringify(log.changeSummary);
      assert.ok(
        !summaryStr.includes('TopSecretPassword99!'),
        'Raw passwords must never be stored in audit logs'
      );
    });
  });
});
