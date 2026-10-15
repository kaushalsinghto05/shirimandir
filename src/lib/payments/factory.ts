import type { PaymentAdapter } from './adapter.interface';
import { MockPaymentAdapter } from './mock.adapter';
import { RazorpayPaymentAdapter } from './razorpay.adapter';

export function getPaymentAdapter(provider: string = 'mock'): PaymentAdapter {
  switch (provider.toLowerCase()) {
    case 'razorpay':
      return new RazorpayPaymentAdapter();
    case 'mock':
    default:
      return new MockPaymentAdapter();
  }
}
