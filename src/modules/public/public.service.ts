import { eq, and } from 'drizzle-orm';
import { getDb } from '../../lib/db';
import { tenants, temples, pujas, donationCampaigns } from '../../lib/db/schema';

export class PublicService {
  /**
   * Resolve public temple profile by tenant slug and temple slug (FR-WL-001, FR-WL-002, FR-WL-004)
   * Only returns the temple if both the tenant is active and the temple is published.
   */
  static async getPublicTemple(tenantSlug: string, templeSlug: string) {
    const { db } = await getDb();

    // 1. Resolve active tenant
    const [tenant] = await db
      .select({
        id: tenants.id,
        slug: tenants.slug,
        name: tenants.name,
        status: tenants.status,
      })
      .from(tenants)
      .where(and(eq(tenants.slug, tenantSlug.toLowerCase()), eq(tenants.status, 'active')))
      .limit(1);

    if (!tenant) {
      return null;
    }

    // 2. Resolve published temple (FR-WL-004: Draft or suspended content not publicly visible)
    const [temple] = await db
      .select({
        id: temples.id,
        tenantId: temples.tenantId,
        slug: temples.slug,
        name: temples.name,
        address: temples.address,
        timezone: temples.timezone,
        contactEmail: temples.contactEmail,
        contactPhone: temples.contactPhone,
        description: temples.description,
        branding: temples.branding,
        status: temples.status,
      })
      .from(temples)
      .where(
        and(
          eq(temples.tenantId, tenant.id),
          eq(temples.slug, templeSlug.toLowerCase()),
          eq(temples.status, 'published')
        )
      )
      .limit(1);

    if (!temple) {
      return null;
    }

    return {
      tenant,
      temple,
    };
  }

  /**
   * List publicly bookable pujas for a temple (FR-WL-003, FR-WL-004)
   * Returns only 'published' services.
   */
  static async listPublicPujas(tenantId: string, templeId: string) {
    const { db } = await getDb();

    return await db
      .select({
        id: pujas.id,
        name: pujas.name,
        description: pujas.description,
        durationMinutes: pujas.durationMinutes,
        priceMinor: pujas.priceMinor,
        currency: pujas.currency,
        status: pujas.status,
      })
      .from(pujas)
      .where(
        and(
          eq(pujas.tenantId, tenantId),
          eq(pujas.templeId, templeId),
          eq(pujas.status, 'published')
        )
      );
  }

  /**
   * List active public donation campaigns (FR-WL-003, FR-WL-004, FR-DON-002)
   */
  static async listPublicCampaigns(tenantId: string, templeId: string) {
    const { db } = await getDb();

    return await db
      .select({
        id: donationCampaigns.id,
        name: donationCampaigns.name,
        description: donationCampaigns.description,
        legalEntityName: donationCampaigns.legalEntityName,
        minAmountMinor: donationCampaigns.minAmountMinor,
        maxAmountMinor: donationCampaigns.maxAmountMinor,
        currency: donationCampaigns.currency,
        taxExemptEligible: donationCampaigns.taxExemptEligible,
        taxExemptionRef: donationCampaigns.taxExemptionRef,
      })
      .from(donationCampaigns)
      .where(
        and(
          eq(donationCampaigns.tenantId, tenantId),
          eq(donationCampaigns.templeId, templeId),
          eq(donationCampaigns.status, 'published'),
          eq(donationCampaigns.isActive, true)
        )
      );
  }
}
