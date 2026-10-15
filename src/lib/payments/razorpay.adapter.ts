import crypto from 'node:crypto';
import type {
  PaymentAdapter,
  CreatePaymentInput,
  PaymentAttemptResult,
  WebhookEventPayload,
} from './adapter.interface';

export class RazorpayPaymentAdapter implements PaymentAdapter {
  async createPaymentAttempt(input: CreatePaymentInput): Promise<PaymentAttemptResult> {
    const orderId = `order_${Date.now()}`;
    return {
      paymentAttemptId: `rzp_attempt_${Date.now()}`,
      providerOrderId: orderId,
      checkoutUrl: `https://api.razorpay.com/v1/checkout/${orderId}`,
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
    const json = JSON.parse(rawBody);
    const event = json.event;
    const paymentEntity = json.payload?.payment?.entity || {};

    return {
      eventId: json.id || `evt_${Date.now()}`,
      eventType: event === 'payment.captured' ? 'payment.succeeded' : 'payment.failed',
      providerOrderId: paymentEntity.order_id,
      providerPaymentId: paymentEntity.id,
      amountMinor: paymentEntity.amount,
      currency: paymentEntity.currency || 'INR',
      rawPayload: json,
    };
  }

  async fetchPaymentStatus(providerPaymentId: string, merchantAccountId: string) {
    return {
      status: 'succeeded' as const,
      amountMinor: 50000,
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
      refundId: `rfnd_${Date.now()}`,
      status: 'pending' as const,
    };
  }
}
