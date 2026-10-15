import { eq, and } from 'drizzle-orm';
import { getDb } from '../../lib/db';
import { tenantMemberships, users, temples } from '../../lib/db/schema';
import { type TenantRole } from '../../lib/rbac/roles';
import { logAuditEvent } from '../../lib/audit/logger';

export interface InviteMemberInput {
  tenantId: string;
  userEmail: string;
  role: TenantRole;
  assignedTempleId?: string | null;
  actorUserId: string;
  actorRole: string;
  requestId?: string;
}

export interface UpdateMemberRoleInput {
  tenantId: string;
  membershipId: string;
  newRole: TenantRole;
  actorUserId: string;
  actorRole: string;
  requestId?: string;
}

export class MembershipService {
  /**
   * Invite or assign a user to a tenant organization (FR-RBAC-001, FR-RBAC-002, FR-RBAC-005)
   */
  static async inviteMember(input: InviteMemberInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;

    // 1. Find user by email
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.userEmail.toLowerCase()))
      .limit(1);

    if (!targetUser) {
      throw new Error('User not found. They must register first before receiving an invitation.');
    }

    // 2. If assigning to a specific temple, verify temple belongs to tenant (FR-RBAC-004)
    if (input.assignedTempleId) {
      const [temple] = await db
        .select()
        .from(temples)
        .where(
          and(
            eq(temples.tenantId, input.tenantId),
            eq(temples.id, input.assignedTempleId)
          )
        )
        .limit(1);

      if (!temple) {
        throw new Error('Assigned temple does not belong to this tenant');
      }
    }

    // 3. Check for existing membership
    const [existing] = await db
      .select()
      .from(tenantMemberships)
      .where(
        and(
          eq(tenantMemberships.tenantId, input.tenantId),
          eq(tenantMemberships.userId, targetUser.id)
        )
      )
      .limit(1);

    if (existing) {
      throw new Error('User is already a member of this tenant');
    }

    // 4. Create membership record (FR-RBAC-002)
    const [membership] = await db
      .insert(tenantMemberships)
      .values({
        tenantId: input.tenantId,
        userId: targetUser.id,
        role: input.role,
        assignedTempleId: input.assignedTempleId || null,
        isActive: true,
      })
      .returning();

    // 5. Audit log event (FR-RBAC-005)
    await logAuditEvent(db, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: 'membership.invited',
      resourceType: 'membership',
      resourceId: membership.id,
      requestId,
      changeSummary: {
        invitedUserId: targetUser.id,
        invitedUserEmail: targetUser.email,
        assignedRole: input.role,
        assignedTempleId: input.assignedTempleId || null,
      },
    });

    return membership;
  }

  /**
   * Update role for an existing membership (FR-RBAC-002, FR-RBAC-005)
   */
  static async updateMemberRole(input: UpdateMemberRoleInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;

    // Verify membership exists within tenant scope (FR-RBAC-004)
    const [membership] = await db
      .select()
      .from(tenantMemberships)
      .where(
        and(
          eq(tenantMemberships.tenantId, input.tenantId),
          eq(tenantMemberships.id, input.membershipId)
        )
      )
      .limit(1);

    if (!membership) {
      throw new Error('Membership record not found in this tenant');
    }

    const [updated] = await db
      .update(tenantMemberships)
      .set({ role: input.newRole, updatedAt: new Date() })
      .where(
        and(
          eq(tenantMemberships.tenantId, input.tenantId),
          eq(tenantMemberships.id, input.membershipId)
        )
      )
      .returning();

    // Audit log role change
    await logAuditEvent(db, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: 'membership.role_updated',
      resourceType: 'membership',
      resourceId: updated.id,
      requestId,
      changeSummary: {
        oldRole: membership.role,
        newRole: input.newRole,
      },
    });

    return updated;
  }

  /**
   * Revoke membership from a tenant (FR-RBAC-005)
   */
  static async revokeMembership(
    tenantId: string,
    membershipId: string,
    actorUserId: string,
    actorRole: string,
    requestId = `req_${Date.now()}`
  ) {
    const { db } = await getDb();

    const [membership] = await db
      .delete(tenantMemberships)
      .where(
        and(
          eq(tenantMemberships.tenantId, tenantId),
          eq(tenantMemberships.id, membershipId)
        )
      )
      .returning();

    if (!membership) {
      throw new Error('Membership not found in this tenant');
    }

    await logAuditEvent(db, {
      tenantId,
      actorUserId,
      actorRole,
      action: 'membership.revoked',
      resourceType: 'membership',
      resourceId: membership.id,
      requestId,
      changeSummary: { revokedRole: membership.role, userId: membership.userId },
    });

    return { success: true };
  }

  /**
   * Get validated membership for a user in a specific tenant (FR-RBAC-003, FR-RBAC-004)
   */
  static async getMembership(tenantId: string, userId: string) {
    const { db } = await getDb();
    const [membership] = await db
      .select()
      .from(tenantMemberships)
      .where(
        and(
          eq(tenantMemberships.tenantId, tenantId),
          eq(tenantMemberships.userId, userId),
          eq(tenantMemberships.isActive, true)
        )
      )
      .limit(1);

    return membership || null;
  }
}
