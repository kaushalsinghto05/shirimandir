import crypto from 'node:crypto';
import { config } from '../../config/index.js';

/**
 * Razorpay / PayU Cryptographic Webhook Signature Validator
 * 
 * Rules:
 * 1. Client-reported success is NEVER trusted to mark an order/booking as paid.
 * 2. Signature must match HMAC SHA256 of the raw webhook payload using server secret.
 * 3. Comparison must use timing-safe comparison to prevent timing attacks.
 */
export function verifyWebhookSignature(rawPayload, signatureHeader, secret = config.paymentWebhookSecret) {
  if (!signatureHeader || !rawPayload) {
    return {
      isValid: false,
      reason: 'Missing payload or signature header'
    };
  }

  try {
    const payloadString = typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signatureHeader, 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return {
        isValid: false,
        reason: 'Signature length mismatch'
      };
    }

    const isMatch = crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    return {
      isValid: isMatch,
      expectedSignature: isMatch ? expectedSignature : undefined,
      reason: isMatch ? null : 'Cryptographic signature mismatch'
    };
  } catch (err) {
    return {
      isValid: false,
      reason: `Signature verification exception: ${err.message}`
    };
  }
}

/**
 * Generate a cryptographically valid webhook event and signature
 * (Used for local testing and automated verification suites)
 */
export function createMockWebhookEvent({
  eventType = 'payment.captured',
  paymentCode,
  gatewayPaymentId = 'pay_' + crypto.randomBytes(6).toString('hex'),
  gatewayOrderId = 'order_' + crypto.randomBytes(6).toString('hex'),
  amountPaise,
  currency = 'INR'
}) {
  const payload = {
    entity: 'event',
    account_id: 'acc_shirimandir_prod',
    event: eventType,
    contains: ['payment'],
    payload: {
      payment: {
        entity: {
          id: gatewayPaymentId,
          order_id: gatewayOrderId,
          amount: amountPaise,
          currency,
          status: 'captured',
          method: 'upi',
          notes: {
            payment_code: paymentCode
          },
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    },
    created_at: Math.floor(Date.now() / 1000)
  };

  const payloadString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', config.paymentWebhookSecret)
    .update(payloadString)
    .digest('hex');

  return {
    rawPayload: payloadString,
    signature,
    payload
  };
}

/**
 * Verify client-side Razorpay / PayU direct checkout callback signature
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, secret) === signature
 */
export function verifyCheckoutSignature({
  gatewayOrderId,
  gatewayPaymentId,
  signature,
  secret = config.paymentWebhookSecret
}) {
  if (!gatewayOrderId || !gatewayPaymentId || !signature) {
    return {
      isValid: false,
      reason: 'Missing order ID, payment ID, or signature'
    };
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${gatewayOrderId}|${gatewayPaymentId}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return {
        isValid: false,
        reason: 'Signature length mismatch'
      };
    }

    const isMatch = crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    return {
      isValid: isMatch,
      expectedSignature: isMatch ? expectedSignature : undefined,
      reason: isMatch ? null : 'Cryptographic signature mismatch'
    };
  } catch (err) {
    return {
      isValid: false,
      reason: `Verification exception: ${err.message}`
    };
  }
}

/**
 * Generate a valid checkout signature for tests and simulated flows
 */
export function createMockCheckoutSignature({
  gatewayOrderId,
  gatewayPaymentId,
  secret = config.paymentWebhookSecret
}) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${gatewayOrderId}|${gatewayPaymentId}`)
    .digest('hex');
}
