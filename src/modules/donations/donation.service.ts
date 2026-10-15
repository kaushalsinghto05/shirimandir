import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../../lib/db';
import { donationCampaigns, donations, temples } from '../../lib/db/schema';
import { logAuditEvent } from '../../lib/audit/logger';
import { ReceiptService } from '../receipts/receipt.service';

export interface CreateCampaignInput {
  tenantId: string;
  templeId: string;
  name: string;
  description?: string;
  legalEntityName: string;
  minAmountMinor?: number;
  maxAmountMinor?: number;
  targetAmountMinor?: number;
  startDate?: Date;
  endDate?: Date;
  currency?: string;
  taxExemptEligible?: boolean;
  taxExemptionRef?: string;
  actorUserId: string;
  actorRole: string;
  requestId?: string;
}

export interface CreateDonationInput {
  tenantId: string;
  templeId: string;
  campaignId: string;
  amountMinor: number;
  devoteeUserId?: string | null;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorPan?: string;
  currency?: string;
  requestId?: string;
}

export class DonationService {
  /**
   * Create donation campaign with legal entity identification (FR-DON-001, FR-DON-002, FR-REC-006)
   */
  static async createCampaign(input: CreateCampaignInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;

    // Verify temple belongs to tenant
    const [temple] = await db
      .select()
      .from(temples)
      .where(and(eq(temples.tenantId, input.tenantId), eq(temples.id, input.templeId)))
      .limit(1);

    if (!temple) {
      throw new Error('Temple not found or unauthorized');
    }

    if (!input.legalEntityName || input.legalEntityName.trim().length === 0) {
      throw new Error('Campaign must specify the verified legal entity name (FR-DON-002)');
    }

    const [campaign] = await db
      .insert(donationCampaigns)
      .values({
        tenantId: input.tenantId,
        templeId: input.templeId,
        name: input.name,
        description: input.description || '',
        legalEntityName: input.legalEntityName.trim(),
        minAmountMinor: input.minAmountMinor || 1000,
        maxAmountMinor: input.maxAmountMinor || null,
        targetAmountMinor: input.targetAmountMinor || null,
        collectedAmountMinor: 0,
        startDate: input.startDate || null,
        endDate: input.endDate || null,
        currency: input.currency || 'INR',
        taxExemptEligible: input.taxExemptEligible || false,
        taxExemptionRef: input.taxExemptionRef || null,
        status: 'draft',
      })
      .returning();

    await logAuditEvent(db, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: 'campaign.created',
      resourceType: 'campaign',
      resourceId: campaign.id,
      requestId,
      changeSummary: {
        campaignName: campaign.name,
        legalEntity: campaign.legalEntityName,
      },
    });

    return campaign;
  }

  /**
   * Publish or close donation campaign (FR-DON-001)
   */
  static async setCampaignStatus(
    tenantId: string,
    campaignId: string,
    status: 'draft' | 'published' | 'closed',
    actorUserId: string,
    actorRole: string,
    requestId = `req_${Date.now()}`
  ) {
    const { db } = await getDb();

    const [campaign] = await db
      .update(donationCampaigns)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(donationCampaigns.tenantId, tenantId),
          eq(donationCampaigns.id, campaignId)
        )
      )
      .returning();

    if (!campaign) {
      throw new Error('Campaign not found or unauthorized');
    }

    await logAuditEvent(db, {
      tenantId,
      actorUserId,
      actorRole,
      action: `campaign.${status}`,
      resourceType: 'campaign',
      resourceId: campaign.id,
      requestId,
      changeSummary: { status },
    });

    return campaign;
  }

  /**
   * Submit donation request with amount limit validation (FR-DON-003, FR-DON-004)
   */
  static async createDonation(input: CreateDonationInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;

    // 1. Validate campaign is active and published
    const [campaign] = await db
      .select()
      .from(donationCampaigns)
      .where(
        and(
          eq(donationCampaigns.tenantId, input.tenantId),
          eq(donationCampaigns.templeId, input.templeId),
          eq(donationCampaigns.id, input.campaignId),
          eq(donationCampaigns.status, 'published'),
          eq(donationCampaigns.isActive, true)
        )
      )
      .limit(1);

    if (!campaign) {
      throw new Error('Donation campaign is not published or active');
    }

    // 2. Validate amount limits (FR-DON-004)
    if (input.amountMinor < campaign.minAmountMinor) {
      throw new Error(
        `Donation amount must be at least ${campaign.minAmountMinor / 100} ${campaign.currency}`
      );
    }
    if (campaign.maxAmountMinor && input.amountMinor > campaign.maxAmountMinor) {
      throw new Error(
        `Donation amount cannot exceed ${campaign.maxAmountMinor / 100} ${campaign.currency}`
      );
    }

    const donationReference = `DON-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const [donation] = await db
      .insert(donations)
      .values({
        tenantId: input.tenantId,
        templeId: input.templeId,
        campaignId: input.campaignId,
        devoteeUserId: input.devoteeUserId || null,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        donorPhone: input.donorPhone || null,
        donorPan: input.donorPan || null,
        amountMinor: input.amountMinor,
        currency: campaign.currency,
        status: 'pending_payment',
        donationReference,
      })
      .returning();

    await logAuditEvent(db, {
      tenantId: input.tenantId,
      actorUserId: input.devoteeUserId || null,
      actorRole: 'devotee',
      action: 'donation.initiated',
      resourceType: 'donation',
      resourceId: donation.id,
      requestId,
      changeSummary: {
        donationReference: donation.donationReference,
        amountMinor: donation.amountMinor,
      },
    });

    return donation;
  }

  /**
   * Mark donation paid upon verified payment & generate receipt (FR-DON-005, AT-10)
   */
  static async markDonationPaid(
    donationId: string,
    paymentId: string,
    requestId = `req_${Date.now()}`
  ) {
    const { db } = await getDb();

    return await db.transaction(async (tx: any) => {
      const [donation] = await tx
        .select()
        .from(donations)
        .where(eq(donations.id, donationId))
        .limit(1);

      if (!donation) {
        throw new Error('Donation record not found');
      }

      // Mark donation as paid
      const [paidDonation] = await tx
        .update(donations)
        .set({ status: 'paid', paidAt: new Date(), updatedAt: new Date() })
        .where(and(eq(donations.id, donationId), eq(donations.status, 'pending_payment')))
        .returning();

      if (!paidDonation) {
        return donation; // Already paid
      }

      // Fetch campaign to retrieve verified legal entity
      const [campaign] = await tx
        .select()
        .from(donationCampaigns)
        .where(eq(donationCampaigns.id, donation.campaignId))
        .limit(1);

      // Issue receipt under correct issuing entity (FR-REC-001, AT-10)
      const receipt = await ReceiptService.issueReceipt({
        tenantId: donation.tenantId,
        templeId: donation.templeId,
        donationId: donation.id,
        issuingLegalEntity: campaign.legalEntityName,
        amountMinor: donation.amountMinor,
        currency: donation.currency,
        requestId,
        tx,
      });

      // Increment campaign collected amount (FR-DON-008)
      await tx
        .update(donationCampaigns)
        .set({
          collectedAmountMinor: sql`${donationCampaigns.collectedAmountMinor} + ${paidDonation.amountMinor}`,
          updatedAt: new Date(),
        })
        .where(eq(donationCampaigns.id, donation.campaignId));

      await logAuditEvent(tx, {
        tenantId: donation.tenantId,
        actorRole: 'system',
        action: 'donation.paid',
        resourceType: 'donation',
        resourceId: donation.id,
        requestId,
        changeSummary: { paymentId, receiptId: receipt.id },
      });

      return {
        donation: paidDonation,
        receipt,
      };
    });
  }

  /**
   * Get campaign progress, target, and completion status (FR-DON-008)
   */
  static async getCampaignProgress(tenantId: string, campaignId: string) {
    const { db } = await getDb();

    const [campaign] = await db
      .select()
      .from(donationCampaigns)
      .where(
        and(
          eq(donationCampaigns.tenantId, tenantId),
          eq(donationCampaigns.id, campaignId)
        )
      )
      .limit(1);

    if (!campaign) {
      throw new Error('Campaign not found or unauthorized');
    }

    const targetAmountMinor = campaign.targetAmountMinor ?? null;
    const collectedAmountMinor = campaign.collectedAmountMinor;
    const progressPercentage =
      targetAmountMinor && targetAmountMinor > 0
        ? Math.round((collectedAmountMinor / targetAmountMinor) * 100)
        : null;
    const isTargetMet = targetAmountMinor ? collectedAmountMinor >= targetAmountMinor : false;
    const isExpired = campaign.endDate ? new Date() > new Date(campaign.endDate) : false;

    return {
      campaignId: campaign.id,
      name: campaign.name,
      targetAmountMinor,
      collectedAmountMinor,
      progressPercentage,
      isTargetMet,
      isExpired,
      currency: campaign.currency,
      status: campaign.status,
    };
  }

  /**
   * Devotee donation history (FR-DON-007, AT-07 cross-devotee protection)
   */
  static async getDevoteeDonations(devoteeUserId: string) {
    const { db } = await getDb();

    return await db
      .select()
      .from(donations)
      .where(eq(donations.devoteeUserId, devoteeUserId));
  }
}
