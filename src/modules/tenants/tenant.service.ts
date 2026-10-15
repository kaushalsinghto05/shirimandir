import { eq, and } from 'drizzle-orm';
import { getDb, withTenantContext } from '../../lib/db';
import { tenants, temples, tenantMemberships } from '../../lib/db/schema';
import { logAuditEvent } from '../../lib/audit/logger';

export interface CreateTenantInput {
  slug: string;
  name: string;
  actorUserId: string;
  actorRole: string;
  requestId?: string;
}

export interface UpdateTenantStatusInput {
  tenantId: string;
  status: 'pending_approval' | 'active' | 'suspended';
  actorUserId: string;
  actorRole: string;
  requestId?: string;
}

export interface CreateTempleInput {
  tenantId: string;
  slug: string;
  name: string;
  address: string;
  timezone?: string;
  contactEmail: string;
  contactPhone: string;
  description?: string;
  branding?: {
    logoUrl?: string | null;
    primaryColor?: string;
    secondaryColor?: string;
    bannerUrl?: string | null;
  };
  actorUserId: string;
  actorRole: string;
  requestId?: string;
}

export class TenantService {
  /**
   * Create a new tenant organization (FR-TEN-001)
   */
  static async createTenant(input: CreateTenantInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;
    const slug = input.slug.toLowerCase().trim();

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('Tenant slug must contain only lowercase letters, numbers, and hyphens');
    }

    // Check slug uniqueness
    const [existing] = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
    if (existing) {
      throw new Error(`Tenant slug "${slug}" is already taken`);
    }

    const [tenant] = await db
      .insert(tenants)
      .values({
        slug,
        name: input.name,
        status: 'pending_approval',
      })
      .returning();

    await logAuditEvent(db, {
      tenantId: tenant.id,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: 'tenant.created',
      resourceType: 'tenant',
      resourceId: tenant.id,
      requestId,
      changeSummary: { slug: tenant.slug, name: tenant.name },
    });

    return tenant;
  }

  /**
   * Approve, suspend, or reactivate a tenant (FR-TEN-001)
   */
  static async updateTenantStatus(input: UpdateTenantStatusInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;

    const [tenant] = await db
      .update(tenants)
      .set({ status: input.status, updatedAt: new Date() })
      .where(eq(tenants.id, input.tenantId))
      .returning();

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    await logAuditEvent(db, {
      tenantId: tenant.id,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: `tenant.${input.status}`,
      resourceType: 'tenant',
      resourceId: tenant.id,
      requestId,
      changeSummary: { newStatus: input.status },
    });

    return tenant;
  }

  /**
   * Create a temple under a tenant (FR-TEN-002, FR-TEN-005)
   */
  static async createTemple(input: CreateTempleInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;
    const slug = input.slug.toLowerCase().trim();

    // Verify tenant exists and is not suspended
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, input.tenantId)).limit(1);
    if (!tenant) throw new Error('Tenant does not exist');
    if (tenant.status === 'suspended') throw new Error('Tenant organization is suspended');

    // Check slug uniqueness within tenant (FR-TEN-005)
    const [existing] = await db
      .select()
      .from(temples)
      .where(and(eq(temples.tenantId, input.tenantId), eq(temples.slug, slug)))
      .limit(1);

    if (existing) {
      throw new Error(`Temple slug "${slug}" is already active in this tenant`);
    }

    const [temple] = await db
      .insert(temples)
      .values({
        tenantId: input.tenantId,
        slug,
        name: input.name,
        address: input.address,
        timezone: input.timezone || 'Asia/Kolkata',
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        description: input.description || '',
        branding: input.branding || {
          logoUrl: null,
          primaryColor: '#e11d48',
          secondaryColor: '#f59e0b',
          bannerUrl: null,
        },
        status: 'draft',
      })
      .returning();

    await logAuditEvent(db, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: 'temple.created',
      resourceType: 'temple',
      resourceId: temple.id,
      requestId,
      changeSummary: { templeSlug: temple.slug, templeName: temple.name },
    });

    return temple;
  }

  /**
   * Update temple profile, timezone, contact info, branding (FR-TEN-003, FR-WL-002)
   */
  static async updateTemple(
    tenantId: string,
    templeId: string,
    data: Partial<{
      name: string;
      address: string;
      timezone: string;
      contactEmail: string;
      contactPhone: string;
      description: string;
      status: 'draft' | 'published' | 'suspended';
      branding: Record<string, unknown>;
    }>,
    actorUserId: string,
    actorRole: string,
    requestId = `req_${Date.now()}`
  ) {
    const { db } = await getDb();

    // Strict tenant boundary enforcement (FR-TEN-004)
    const [temple] = await db
      .update(temples)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(temples.tenantId, tenantId), eq(temples.id, templeId)))
      .returning();

    if (!temple) {
      throw new Error('Temple not found or unauthorized');
    }

    await logAuditEvent(db, {
      tenantId,
      actorUserId,
      actorRole,
      action: 'temple.updated',
      resourceType: 'temple',
      resourceId: temple.id,
      requestId,
      changeSummary: data,
    });

    return temple;
  }

  /**
   * Fetch temple by tenant and slug or ID
   */
  static async getTemple(tenantId: string, templeIdOrSlug: string) {
    const { db } = await getDb();
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        templeIdOrSlug
      );

    const condition = isUuid
      ? and(eq(temples.tenantId, tenantId), eq(temples.id, templeIdOrSlug))
      : and(eq(temples.tenantId, tenantId), eq(temples.slug, templeIdOrSlug));

    const [temple] = await db.select().from(temples).where(condition).limit(1);
    return temple || null;
  }
}
