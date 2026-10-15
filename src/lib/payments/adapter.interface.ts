export interface CreatePaymentInput {
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
  merchantAccountId: string;
  returnUrl: string;
}

export interface PaymentAttemptResult {
  paymentAttemptId: string;
  providerPaymentId?: string;
  providerOrderId: string;
  clientSecret?: string;
  checkoutUrl?: string;
}

export interface WebhookEventPayload {
  eventId: string;
  eventType: 'payment.succeeded' | 'payment.failed' | 'refund.processed';
  providerOrderId: string;
  providerPaymentId: string;
  amountMinor: number;
  currency: string;
  merchantAccountId?: string;
  rawPayload: Record<string, unknown>;
}

export interface PaymentAdapter {
  createPaymentAttempt(input: CreatePaymentInput): Promise<PaymentAttemptResult>;
  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean;
  parseWebhookPayload(rawBody: string): WebhookEventPayload;
  fetchPaymentStatus(
    providerPaymentId: string,
    merchantAccountId: string
  ): Promise<{
    status: 'succeeded' | 'failed' | 'pending';
    amountMinor: number;
    currency: string;
    settled: boolean;
  }>;
  initiateRefund(params: {
    providerPaymentId: string;
    amountMinor: number;
    reason: string;
    merchantAccountId: string;
  }): Promise<{ refundId: string; status: 'pending' | 'succeeded' }>;
}
