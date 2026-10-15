import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../../lib/db';
import { receipts, donations, temples, tenants } from '../../lib/db/schema';
import { logAuditEvent } from '../../lib/audit/logger';

export interface IssueReceiptInput {
  tenantId: string;
  templeId: string;
  donationId: string;
  issuingLegalEntity: string;
  amountMinor: number;
  currency: string;
  requestId?: string;
  tx?: any;
}

export class ReceiptService {
  /**
   * Generate sequential, tenant-scoped unique receipt number (FR-REC-003)
   * Format: RCP-{TENANT_SLUG}-{YYYY}-{000001}
   */
  static async generateReceiptNumber(tenantId: string, tx?: any): Promise<string> {
    const dbClient = tx || (await getDb()).db;
    const [tenant] = await dbClient.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    const tenantSlug = tenant?.slug.toUpperCase() || 'TENANT';
    const year = new Date().getFullYear();

    // Count existing receipts for tenant in current year
    const countResult = await dbClient.execute(
      sql`SELECT COUNT(*)::int AS total FROM receipts WHERE tenant_id = ${tenantId}`
    );
    const rows = countResult.rows || countResult;
    const nextSeq = ((rows[0]?.total || 0) + 1).toString().padStart(6, '0');

    return `RCP-${tenantSlug}-${year}-${nextSeq}`;
  }

  /**
   * Issue receipt after donation payment is verified (FR-REC-001, FR-REC-002, AT-10)
   */
  static async issueReceipt(input: IssueReceiptInput) {
    const dbClient = input.tx || (await getDb()).db;
    const requestId = input.requestId || `req_${Date.now()}`;
    const receiptNumber = await this.generateReceiptNumber(input.tenantId, dbClient);

    const [receipt] = await dbClient
      .insert(receipts)
      .values({
        tenantId: input.tenantId,
        templeId: input.templeId,
        donationId: input.donationId,
        receiptNumber,
        issuingLegalEntity: input.issuingLegalEntity,
        amountMinor: input.amountMinor,
        currency: input.currency,
        status: 'issued',
      })
      .returning();

    await logAuditEvent(dbClient, {
      tenantId: input.tenantId,
      actorRole: 'system',
      action: 'receipt.issued',
      resourceType: 'receipt',
      resourceId: receipt.id,
      requestId,
      changeSummary: {
        receiptNumber: receipt.receiptNumber,
        issuingLegalEntity: receipt.issuingLegalEntity,
        amountMinor: receipt.amountMinor,
      },
    });

    return receipt;
  }

  /**
   * Void or correct a receipt while preserving audit lineage (FR-REC-004, AT-12)
   */
  static async voidReceipt(params: {
    tenantId: string;
    receiptId: string;
    voidReason: string;
    actorUserId: string;
    actorRole: string;
    requestId?: string;
    tx?: any;
  }) {
    const dbClient = params.tx || (await getDb()).db;
    const requestId = params.requestId || `req_${Date.now()}`;

    const [receipt] = await dbClient
      .select()
      .from(receipts)
      .where(and(eq(receipts.tenantId, params.tenantId), eq(receipts.id, params.receiptId)))
      .limit(1);

    if (!receipt) {
      throw new Error('Receipt not found in this tenant');
    }
    if (receipt.status === 'voided') {
      throw new Error('Receipt is already voided');
    }

    // Update status to voided and preserve auditable reason (AT-12)
    const [voided] = await dbClient
      .update(receipts)
      .set({
        status: 'voided',
        voidReason: params.voidReason,
        updatedAt: new Date(),
      })
      .where(and(eq(receipts.tenantId, params.tenantId), eq(receipts.id, params.receiptId)))
      .returning();

    await logAuditEvent(dbClient, {
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      actorRole: params.actorRole,
      action: 'receipt.voided',
      resourceType: 'receipt',
      resourceId: voided.id,
      requestId,
      changeSummary: {
        receiptNumber: voided.receiptNumber,
        voidReason: params.voidReason,
        originalAmountMinor: voided.amountMinor,
      },
    });

    return voided;
  }

  /**
   * Fetch receipt by ID with devotee ownership enforcement (AT-07)
   */
  static async getDevoteeReceipt(devoteeUserId: string, receiptId: string) {
    const { db } = await getDb();

    // Query receipt joined with donation to verify user ownership
    const [record] = await db
      .select({
        receipt: receipts,
        donation: donations,
      })
      .from(receipts)
      .innerJoin(donations, eq(receipts.donationId, donations.id))
      .where(and(eq(receipts.id, receiptId), eq(donations.devoteeUserId, devoteeUserId)))
      .limit(1);

    if (!record) {
      return null;
    }

    return record.receipt;
  }
}
