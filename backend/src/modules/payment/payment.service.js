import crypto from 'node:crypto';
import { query } from '../../database/db.js';
import { eventBus, DomainEvents } from '../../core/events/eventBus.js';
import {
  verifyWebhookSignature,
  verifyCheckoutSignature,
  createMockWebhookEvent
} from './webhook.service.js';

export class PaymentService {
  /**
   * Initiate a new payment session
   */
  async createIntent({ booking_id, order_id, gateway = 'razorpay' }, requestingUser) {
    if (!booking_id && !order_id) {
      throw { status: 400, message: 'Either booking_id or order_id is required' };
    }

    let amountPaise = 0;
    let description = '';
    let targetEntity = null;

    if (booking_id) {
      const bRes = await query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2', [booking_id, requestingUser.id]);
      if (bRes.rows.length === 0) {
        throw { status: 404, message: 'Booking not found' };
      }
      targetEntity = bRes.rows[0];

      if (['confirmed', 'completed'].includes(targetEntity.status)) {
        throw {
          status: 400,
          message: `Booking #${targetEntity.booking_code} is already confirmed and paid.`
        };
      }
      if (['cancelled', 'refunded'].includes(targetEntity.status)) {
        throw {
          status: 400,
          message: `Cannot initiate payment for ${targetEntity.status} booking #${targetEntity.booking_code}.`
        };
      }

      amountPaise = targetEntity.total_amount_paise;
      description = `Puja Seva Booking #${targetEntity.booking_code}`;
    } else {
      const oRes = await query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [order_id, requestingUser.id]);
      if (oRes.rows.length === 0) {
        throw { status: 404, message: 'Order not found' };
      }
      targetEntity = oRes.rows[0];

      if (['paid', 'preparing', 'dispatched', 'delivered'].includes(targetEntity.status)) {
        throw {
          status: 400,
          message: `Order #${targetEntity.order_code} is already paid and in fulfillment.`
        };
      }
      if (['cancelled', 'refunded'].includes(targetEntity.status)) {
        throw {
          status: 400,
          message: `Cannot initiate payment for ${targetEntity.status} order #${targetEntity.order_code}.`
        };
      }

      amountPaise = targetEntity.total_amount_paise;
      description = `Prasad Seva Order #${targetEntity.order_code}`;
    }

    if (!amountPaise || amountPaise <= 0) {
      throw { status: 400, message: 'Invalid monetary total for payment session' };
    }

    const prefix = booking_id ? 'BK' : 'ORD';
    const paymentCode = `PAY-${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const mockGatewayOrderId = `order_rzp_${crypto.randomBytes(6).toString('hex')}`;

    await query(
      `INSERT INTO payments (
        payment_code, booking_id, order_id, user_id, amount_paise,
        currency, gateway, gateway_order_id, verified_server_side, status
      )
      VALUES ($1, $2, $3, $4, $5, 'INR', $6, $7, 0, 'created')`,
      [
        paymentCode,
        booking_id || null,
        order_id || null,
        requestingUser.id,
        amountPaise,
        gateway,
        mockGatewayOrderId
      ]
    );

    return {
      payment_code: paymentCode,
      gateway_order_id: mockGatewayOrderId,
      amount_paise: amountPaise,
      amount_inr: amountPaise / 100,
      currency: 'INR',
      gateway,
      description,
      key_id: 'rzp_test_shirimandir_public_key',
      verified_server_side: false,
      note: 'Payment status remains pending until server-side HMAC SHA-256 signature verification occurs.'
    };
  }

  /**
   * Direct checkout verification (Client callback with HMAC validation)
   */
  async verifyDirectPayment({
    payment_code,
    gateway_order_id,
    razorpay_order_id,
    gateway_payment_id,
    razorpay_payment_id,
    gateway_signature,
    razorpay_signature
  }, requestingUser) {
    const orderId = razorpay_order_id || gateway_order_id;
    const paymentId = razorpay_payment_id || gateway_payment_id;
    const signature = razorpay_signature || gateway_signature;

    if (!paymentId || !signature) {
      throw {
        status: 400,
        message: 'gateway_payment_id and gateway_signature are required for verification'
      };
    }

    let paymentRecord = null;
    if (payment_code) {
      const pRes = await query('SELECT * FROM payments WHERE payment_code = $1', [payment_code]);
      if (pRes.rows.length > 0) paymentRecord = pRes.rows[0];
    } else if (orderId) {
      const pRes = await query('SELECT * FROM payments WHERE gateway_order_id = $1', [orderId]);
      if (pRes.rows.length > 0) paymentRecord = pRes.rows[0];
    }

    if (!paymentRecord) {
      throw { status: 404, message: 'Payment session not found' };
    }

    if (paymentRecord.user_id !== requestingUser.id && !['admin', 'temple_partner'].includes(requestingUser.role)) {
      throw { status: 403, message: 'Access denied' };
    }

    // Idempotency check
    if (paymentRecord.verified_server_side === 1 && paymentRecord.status === 'captured') {
      return {
        alreadyVerified: true,
        verified_server_side: true,
        status: 'captured',
        payment_code: paymentRecord.payment_code,
        message: 'Payment was previously verified and captured.'
      };
    }

    const effectiveOrderId = orderId || paymentRecord.gateway_order_id;
    const verification = verifyCheckoutSignature({
      gatewayOrderId: effectiveOrderId,
      gatewayPaymentId: paymentId,
      signature
    });

    const now = new Date().toISOString();

    if (!verification.isValid) {
      console.warn('[SECURITY] Payment checkout signature verification failed:', verification.reason);
      await query(
        'UPDATE payments SET status = \'failed\', updated_at = $1 WHERE id = $2 AND status = \'created\'',
        [now, paymentRecord.id]
      );

      eventBus.publish(DomainEvents.PAYMENT_FAILED, {
        paymentId: paymentRecord.id,
        paymentCode: paymentRecord.payment_code,
        bookingId: paymentRecord.booking_id,
        orderId: paymentRecord.order_id,
        reason: verification.reason
      });

      throw {
        status: 400,
        message: 'Cryptographic Signature Verification Failed',
        details: verification.reason
      };
    }

    // Update payment record to captured and verified
    await query(
      `UPDATE payments
       SET verified_server_side = 1,
           status = 'captured',
           gateway_payment_id = $1,
           gateway_signature = $2,
           signature_verified_at = $3,
           updated_at = $4
       WHERE id = $5`,
      [paymentId, signature, now, now, paymentRecord.id]
    );

    // Update parent booking & order directly for backward-compatibility
    if (paymentRecord.booking_id) {
      await query(
        'UPDATE bookings SET status = \'confirmed\', updated_at = $1 WHERE id = $2',
        [now, paymentRecord.booking_id]
      );
    }
    if (paymentRecord.order_id) {
      await query(
        'UPDATE orders SET status = \'paid\', updated_at = $1 WHERE id = $2',
        [now, paymentRecord.order_id]
      );
    }

    // Publish event to decouple any other modules (notifications, emails, analytics)
    eventBus.publish(DomainEvents.PAYMENT_CAPTURED, {
      paymentId: paymentRecord.id,
      paymentCode: paymentRecord.payment_code,
      bookingId: paymentRecord.booking_id,
      orderId: paymentRecord.order_id,
      amountPaise: paymentRecord.amount_paise,
      capturedAt: now,
      gatewayPaymentId: paymentId
    });

    return {
      verified_server_side: true,
      status: 'captured',
      payment_code: paymentRecord.payment_code,
      amount_inr: paymentRecord.amount_paise / 100,
      currency: paymentRecord.currency,
      verified_at: now,
      message: 'Payment verified cryptographically and booking confirmed.'
    };
  }

  /**
   * Authoritative Webhook Processor
   */
  async processWebhook(rawPayload, signature, body, queryParams) {
    const verificationResult = verifyWebhookSignature(rawPayload, signature);

    if (!verificationResult.isValid) {
      console.warn('[SECURITY] Unauthorized payment webhook rejected:', verificationResult.reason);
      throw {
        status: 400,
        message: 'Cryptographic Signature Verification Failed',
        details: verificationResult.reason
      };
    }

    const payloadObj = typeof body === 'object' ? body : JSON.parse(rawPayload);
    const event = payloadObj.event || 'payment.captured';
    const paymentEntity = payloadObj.payload?.payment?.entity || payloadObj.payment || {};

    const paymentCode = paymentEntity.notes?.payment_code || queryParams?.payment_code;
    const gatewayOrderId = paymentEntity.order_id;
    const gatewayPaymentId = paymentEntity.id || `pay_${Date.now()}`;
    const webhookEventId = payloadObj.id || `evt_${Date.now()}`;

    let paymentRecord = null;
    if (paymentCode) {
      const pRes = await query('SELECT * FROM payments WHERE payment_code = $1', [paymentCode]);
      if (pRes.rows.length > 0) paymentRecord = pRes.rows[0];
    } else if (gatewayOrderId) {
      const pRes = await query('SELECT * FROM payments WHERE gateway_order_id = $1', [gatewayOrderId]);
      if (pRes.rows.length > 0) paymentRecord = pRes.rows[0];
    }

    if (!paymentRecord) {
      console.warn('[WEBHOOK] Payment record not located for gateway order:', gatewayOrderId);
      return { received: true, note: 'Payment record not found; event logged.' };
    }

    // Idempotency check
    if (paymentRecord.webhook_event_id === webhookEventId && paymentRecord.verified_server_side === 1) {
      return {
        received: true,
        idempotent: true,
        verified_server_side: true,
        payment_code: paymentRecord.payment_code
      };
    }

    const now = new Date().toISOString();

    if (event === 'payment.captured' || event === 'payment.authorized') {
      const targetStatus = event === 'payment.captured' ? 'captured' : 'authorized';

      await query(
        `UPDATE payments
         SET verified_server_side = 1,
             status = $1,
             gateway_payment_id = $2,
             gateway_signature = $3,
             webhook_event_id = $4,
             signature_verified_at = $5,
             raw_webhook_payload = $6,
             updated_at = $7
         WHERE id = $8`,
        [targetStatus, gatewayPaymentId, signature, webhookEventId, now, JSON.stringify(payloadObj), now, paymentRecord.id]
      );

      if (paymentRecord.booking_id && targetStatus === 'captured') {
        await query(
          'UPDATE bookings SET status = \'confirmed\', updated_at = $1 WHERE id = $2',
          [now, paymentRecord.booking_id]
        );
      }

      if (paymentRecord.order_id && targetStatus === 'captured') {
        await query(
          'UPDATE orders SET status = \'paid\', updated_at = $1 WHERE id = $2',
          [now, paymentRecord.order_id]
        );
      }

      console.log(`[PAYMENT VERIFIED] Webhook verified payment ${paymentRecord.payment_code} server-side. status=${targetStatus}.`);

      eventBus.publish(DomainEvents.PAYMENT_CAPTURED, {
        paymentId: paymentRecord.id,
        paymentCode: paymentRecord.payment_code,
        bookingId: paymentRecord.booking_id,
        orderId: paymentRecord.order_id,
        amountPaise: paymentRecord.amount_paise,
        capturedAt: now,
        gatewayPaymentId
      });

      return {
        received: true,
        verified_server_side: true,
        status: targetStatus,
        payment_code: paymentRecord.payment_code,
        verified_at: now
      };
    } else if (event === 'payment.failed') {
      await query(
        `UPDATE payments
         SET status = 'failed',
             webhook_event_id = $1,
             raw_webhook_payload = $2,
             updated_at = $3
         WHERE id = $4`,
        [webhookEventId, JSON.stringify(payloadObj), now, paymentRecord.id]
      );

      console.warn(`[PAYMENT FAILED] Webhook logged failure for payment ${paymentRecord.payment_code}.`);

      eventBus.publish(DomainEvents.PAYMENT_FAILED, {
        paymentId: paymentRecord.id,
        paymentCode: paymentRecord.payment_code,
        bookingId: paymentRecord.booking_id,
        orderId: paymentRecord.order_id,
        reason: 'Payment failed reported via gateway webhook'
      });

      return {
        received: true,
        status: 'failed',
        payment_code: paymentRecord.payment_code
      };
    } else if (event === 'refund.processed' || event === 'refund.created') {
      await query(
        `UPDATE payments
         SET status = 'refunded',
             webhook_event_id = $1,
             raw_webhook_payload = $2,
             updated_at = $3
         WHERE id = $4`,
        [webhookEventId, JSON.stringify(payloadObj), now, paymentRecord.id]
      );

      if (paymentRecord.booking_id) {
        await query(
          'UPDATE bookings SET status = \'refunded\', updated_at = $1 WHERE id = $2',
          [now, paymentRecord.booking_id]
        );
      }
      if (paymentRecord.order_id) {
        await query(
          'UPDATE orders SET status = \'refunded\', updated_at = $1 WHERE id = $2',
          [now, paymentRecord.order_id]
        );
      }

      return {
        received: true,
        status: 'refunded',
        payment_code: paymentRecord.payment_code
      };
    }

    return { received: true, event, payment_code: paymentRecord.payment_code };
  }

  /**
   * Get payment details by code
   */
  async getPaymentByCode(paymentCode, requestingUser) {
    const pRes = await query('SELECT * FROM payments WHERE payment_code = $1', [paymentCode]);
    if (pRes.rows.length === 0) return null;

    const payment = pRes.rows[0];
    if (payment.user_id !== requestingUser.id && !['admin', 'temple_partner'].includes(requestingUser.role)) {
      throw { status: 403, message: 'Access denied' };
    }

    let linkedBooking = null;
    let linkedOrder = null;

    if (payment.booking_id) {
      const bRes = await query(
        `SELECT b.id, b.booking_code, b.status, b.scheduled_date, b.sankalp_name,
                p.title AS puja_title, t.name AS temple_name
         FROM bookings b
         JOIN pujas p ON b.puja_id = p.id
         JOIN temples t ON b.temple_id = t.id
         WHERE b.id = $1`,
        [payment.booking_id]
      );
      if (bRes.rows.length > 0) linkedBooking = bRes.rows[0];
    }

    if (payment.order_id) {
      const oRes = await query(
        'SELECT id, order_code, status, shipping_name, tracking_number, courier_partner FROM orders WHERE id = $1',
        [payment.order_id]
      );
      if (oRes.rows.length > 0) linkedOrder = oRes.rows[0];
    }

    return {
      id: payment.id,
      payment_code: payment.payment_code,
      status: payment.status,
      verified_server_side: Boolean(payment.verified_server_side),
      amount_paise: payment.amount_paise,
      amount_inr: payment.amount_paise / 100,
      currency: payment.currency,
      gateway: payment.gateway,
      gateway_order_id: payment.gateway_order_id,
      gateway_payment_id: payment.gateway_payment_id,
      signature_verified_at: payment.signature_verified_at,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
      booking: linkedBooking,
      order: linkedOrder
    };
  }

  /**
   * Get devotee payments
   */
  async getDevoteePayments(userId) {
    const { rows } = await query(
      `SELECT p.*,
              b.booking_code, b.scheduled_date, pu.title AS puja_title,
              o.order_code
       FROM payments p
       LEFT JOIN bookings b ON p.booking_id = b.id
       LEFT JOIN pujas pu ON b.puja_id = pu.id
       LEFT JOIN orders o ON p.order_id = o.id
       WHERE p.user_id = $1
       ORDER BY p.id DESC`,
      [userId]
    );

    return rows.map(item => ({
      id: item.id,
      payment_code: item.payment_code,
      status: item.status,
      verified_server_side: Boolean(item.verified_server_side),
      amount_paise: item.amount_paise,
      amount_inr: item.amount_paise / 100,
      currency: item.currency,
      gateway: item.gateway,
      gateway_order_id: item.gateway_order_id,
      gateway_payment_id: item.gateway_payment_id,
      booking_code: item.booking_code || null,
      puja_title: item.puja_title || null,
      order_code: item.order_code || null,
      scheduled_date: item.scheduled_date || null,
      signature_verified_at: item.signature_verified_at,
      created_at: item.created_at
    }));
  }
}

export const paymentService = new PaymentService();
