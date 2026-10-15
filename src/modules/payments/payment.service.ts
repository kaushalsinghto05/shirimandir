import { eq, and } from 'drizzle-orm';
import { getDb } from '../../lib/db';
import {
  payments,
  paymentConfigs,
  webhookEvents,
  reconciliationExceptions,
  refunds,
} from '../../lib/db/schema';
import { getPaymentAdapter } from '../../lib/payments/factory';
import { logAuditEvent } from '../../lib/audit/logger';
import { BookingService } from '../bookings/booking.service';
import { hasPermission } from '../../lib/rbac/roles';
import { Permissions } from '../../lib/rbac/permissions';
import type { TenantRole, PlatformRole } from '../../lib/rbac/roles';

export interface CreatePaymentAttemptInput {
  tenantId: string;
  templeId: string;
  payableType: 'booking' | 'donation';
  payableId: string;
  amountMinor: number;
  currency: string;
  donorOrDevotee: {
    name: string;
    email: string;
    phone?: string;
  };
  returnUrl: string;
  requestId?: string;
}

export class PaymentService {
  /**
   * Create a payment attempt through server-side provider adapter (FR-PAY-001, FR-PAY-002, FR-PAY-007)
   */
  static async createPaymentAttempt(input: CreatePaymentAttemptInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;

    // 1. Resolve temple payment config (FR-PAY-001)
    const [config] = await db
      .select()
      .from(paymentConfigs)
      .where(
        and(
          eq(paymentConfigs.tenantId, input.tenantId),
          eq(paymentConfigs.templeId, input.templeId)
        )
      )
      .limit(1);

    const provider = config?.provider || 'mock';
    const merchantAccountId = config?.merchantAccountId || 'default_merchant';

    // 2. Instantiate provider adapter
    const adapter = getPaymentAdapter(provider);
    const attempt = await adapter.createPaymentAttempt({
      ...input,
      merchantAccountId,
    });

    // 3. Store payment record with pending status (FR-PAY-007)
    const [paymentRecord] = await db
      .insert(payments)
      .values({
        tenantId: input.tenantId,
        templeId: input.templeId,
        payableType: input.payableType,
        payableId: input.payableId,
        provider,
        providerOrderId: attempt.providerOrderId,
        providerPaymentId: attempt.providerPaymentId || null,
        amountMinor: input.amountMinor,
        currency: input.currency,
        status: 'pending',
        settlementStatus: 'unsettled',
      })
      .returning();

    await logAuditEvent(db, {
      tenantId: input.tenantId,
      actorRole: 'system',
      action: 'payment.attempt_created',
      resourceType: 'payment',
      resourceId: paymentRecord.id,
      requestId,
      changeSummary: {
        providerOrderId: attempt.providerOrderId,
        amountMinor: input.amountMinor,
      },
    });

    return {
      payment: paymentRecord,
      checkoutUrl: attempt.checkoutUrl,
    };
  }

  /**
   * Process incoming webhook idempotently with signature verification (FR-PAY-003, FR-PAY-004, AT-04, AT-05)
   */
  static async handleWebhook(params: {
    provider: string;
    rawBody: string;
    signature: string;
    webhookSecret: string;
    onPaymentSuccess?: (payment: any) => Promise<void>;
  }) {
    const { db } = await getDb();
    const adapter = getPaymentAdapter(params.provider);

    // 1. Verify Cryptographic Webhook Signature (FR-PAY-003)
    const validSignature = adapter.verifyWebhookSignature(
      params.rawBody,
      params.signature,
      params.webhookSecret
    );

    if (!validSignature) {
      throw new Error('Invalid webhook signature');
    }

    const event = adapter.parseWebhookPayload(params.rawBody);

    // 2. Deduplicate Webhook Deliveries (FR-PAY-004, AT-04)
    const [existingEvent] = await db
      .select()
      .from(webhookEvents)
      .where(
        and(
          eq(webhookEvents.provider, params.provider),
          eq(webhookEvents.eventId, event.eventId)
        )
      )
      .limit(1);

    if (existingEvent) {
      // Event already received & processed! Return early without duplicate business side-effects (AT-04)
      return { status: 'duplicate_ignored', eventId: event.eventId };
    }

    // Persist new webhook event
    await db.insert(webhookEvents).values({
      provider: params.provider,
      eventId: event.eventId,
      eventType: event.eventType,
      payload: event.rawPayload,
      status: 'processed',
      processedAt: new Date(),
    });

    // 3. Find associated payment record
    const [paymentRecord] = await db
      .select()
      .from(payments)
      .where(eq(payments.providerOrderId, event.providerOrderId))
      .limit(1);

    if (!paymentRecord) {
      return { status: 'unmatched_order', orderId: event.providerOrderId };
    }

    // 4. Amount & Currency Matching Validation (AT-05)
    if (
      paymentRecord.amountMinor !== event.amountMinor ||
      paymentRecord.currency !== event.currency
    ) {
      // Amount/currency mismatch! Quarantine in reconciliation exceptions (AT-05)
      await db.insert(reconciliationExceptions).values({
        tenantId: paymentRecord.tenantId,
        provider: params.provider,
        providerReference: event.providerPaymentId,
        internalReference: paymentRecord.id,
        payableType: paymentRecord.payableType,
        payableId: paymentRecord.payableId,
        exceptionType: 'amount_mismatch',
        details: {
          expectedAmount: paymentRecord.amountMinor,
          receivedAmount: event.amountMinor,
          expectedCurrency: paymentRecord.currency,
          receivedCurrency: event.currency,
        },
        resolved: false,
      });

      await db
        .update(payments)
        .set({ status: 'reconciliation_required', updatedAt: new Date() })
        .where(eq(payments.id, paymentRecord.id));

      return {
        status: 'quarantined',
        reason: 'Amount or currency mismatch with internal records',
      };
    }

    // 5. Update Payment Record to succeeded
    const [updatedPayment] = await db
      .update(payments)
      .set({
        providerPaymentId: event.providerPaymentId,
        status: 'succeeded',
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentRecord.id))
      .returning();

    // 6. Execute downstream business side effect (booking confirmation or donation completion)
    if (updatedPayment.payableType === 'booking') {
      await BookingService.confirmBooking(updatedPayment.payableId, updatedPayment.id);
    } else if (params.onPaymentSuccess) {
      await params.onPaymentSuccess(updatedPayment);
    }

    return {
      status: 'processed',
      paymentId: updatedPayment.id,
    };
  }

  /**
   * Browser return page check (FR-PAY-005, AT-03)
   * The browser return page alone is NEVER treated as proof of payment!
   */
  static async checkReturnStatus(paymentAttemptId: string) {
    const { db } = await getDb();

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentAttemptId))
      .limit(1);

    if (!payment) {
      throw new Error('Payment record not found');
    }

    // If still pending, it remains unconfirmed (AT-03)
    return {
      paymentId: payment.id,
      status: payment.status,
      isVerified: payment.status === 'succeeded',
    };
  }

  /**
   * Request refund with RBAC permission check (FR-PAY-008, AT-08)
   */
  static async requestRefund(params: {
    tenantId: string;
    paymentId: string;
    amountMinor: number;
    reason: string;
    actorUserId: string;
    actorRole: TenantRole;
    platformRole?: PlatformRole;
    requestId?: string;
  }) {
    const { db } = await getDb();
    const requestId = params.requestId || `req_${Date.now()}`;

    // RBAC check: Must have PAYMENTS_REFUND permission (AT-08)
    const allowed = hasPermission(
      params.actorRole,
      params.platformRole || 'none',
      Permissions.PAYMENTS_REFUND
    );
    if (!allowed) {
      // Log unauthorized attempt to audit trail (AT-08)
      await logAuditEvent(db, {
        tenantId: params.tenantId,
        actorUserId: params.actorUserId,
        actorRole: params.actorRole,
        action: 'refund.unauthorized_attempt',
        resourceType: 'payment',
        resourceId: params.paymentId,
        requestId,
        changeSummary: { reason: params.reason },
      });
      throw new Error('Access denied: Unauthorized to issue refunds');
    }

    const [refundRecord] = await db
      .insert(refunds)
      .values({
        tenantId: params.tenantId,
        paymentId: params.paymentId,
        requestedByUserId: params.actorUserId,
        amountMinor: params.amountMinor,
        reason: params.reason,
        status: 'pending',
      })
      .returning();

    await logAuditEvent(db, {
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      actorRole: params.actorRole,
      action: 'refund.requested',
      resourceType: 'refund',
      resourceId: refundRecord.id,
      requestId,
      changeSummary: { amountMinor: params.amountMinor, reason: params.reason },
    });

    return refundRecord;
  }
}
