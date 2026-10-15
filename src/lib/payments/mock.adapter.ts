import crypto from 'node:crypto';
import type {
  PaymentAdapter,
  CreatePaymentInput,
  PaymentAttemptResult,
  WebhookEventPayload,
} from './adapter.interface';

export class MockPaymentAdapter implements PaymentAdapter {
  async createPaymentAttempt(input: CreatePaymentInput): Promise<PaymentAttemptResult> {
    const orderId = `mock_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      paymentAttemptId: `attempt_${Date.now()}`,
      providerOrderId: orderId,
      checkoutUrl: `https://checkout.shirimandir.org/pay/${orderId}`,
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return false;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  parseWebhookPayload(rawBody: string): WebhookEventPayload {
    const data = JSON.parse(rawBody);
    return {
      eventId: data.event_id || data.id || `evt_${Date.now()}`,
      eventType: data.event_type || 'payment.succeeded',
      providerOrderId: data.order_id,
      providerPaymentId: data.payment_id,
      amountMinor: data.amount_minor,
      currency: data.currency || 'INR',
      merchantAccountId: data.merchant_account_id,
      rawPayload: data,
    };
  }

  async fetchPaymentStatus(providerPaymentId: string, merchantAccountId: string) {
    return {
      status: 'succeeded' as const,
      amountMinor: 10000,
      currency: 'INR',
      settled: false,
    };
  }

  async initiateRefund(params: {
    providerPaymentId: string;
    amountMinor: number;
    reason: string;
    merchantAccountId: string;
  }) {
    return {
      refundId: `mock_rfnd_${Date.now()}`,
      status: 'succeeded' as const,
    };
  }

  /**
   * Helper to generate a signed mock webhook payload for tests
   */
  static generateSignedWebhook(
    payload: Record<string, unknown>,
    secret: string
  ): { body: string; signature: string } {
    const body = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return { body, signature };
  }
}
