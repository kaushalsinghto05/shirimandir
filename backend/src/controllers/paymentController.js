import crypto from 'node:crypto';
import { query } from '../database/db.js';
import { verifyWebhookSignature, createMockWebhookEvent } from '../services/paymentWebhookService.js';

/**
 * Step 1: Initiate Payment Session
 * Creates a server-side record in 'created' state with verified_server_side = 0
 */
export async function createPaymentIntent(req, res) {
  try {
    const { booking_id, order_id, gateway = 'razorpay' } = req.body;

    if (!booking_id && !order_id) {
      return res.status(400).json({ success: false, error: 'Either booking_id or order_id is required' });
    }

    let amountPaise = 0;
    let description = '';

    if (booking_id) {
      const bRes = await query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2', [booking_id, req.user.id]);
      if (bRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Booking not found' });
      amountPaise = bRes.rows[0].total_amount_paise;
      description = `Puja Seva Booking #${bRes.rows[0].booking_code}`;
    } else {
      const oRes = await query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [order_id, req.user.id]);
      if (oRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Order not found' });
      amountPaise = oRes.rows[0].total_amount_paise;
      description = `Prasad Seva Order #${oRes.rows[0].order_code}`;
    }

    const paymentCode = `PAY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const mockGatewayOrderId = `order_rzp_${crypto.randomBytes(6).toString('hex')}`;

    const insertPayment = await query(
      `INSERT INTO payments (
        payment_code, booking_id, order_id, user_id, amount_paise,
        currency, gateway, gateway_order_id, verified_server_side, status
      )
      VALUES ($1, $2, $3, $4, $5, 'INR', $6, $7, 0, 'created')
      RETURNING *`,
      [
        paymentCode,
        booking_id || null,
        order_id || null,
        req.user.id,
        amountPaise,
        gateway,
        mockGatewayOrderId
      ]
    );

    return res.status(201).json({
      success: true,
      data: {
        payment_code: paymentCode,
        gateway_order_id: mockGatewayOrderId,
        amount_paise: amountPaise,
        amount_inr: amountPaise / 100,
        currency: 'INR',
        description,
        key_id: 'rzp_test_shirimandir_public_key',
        verified_server_side: false,
        note: 'Payment status will remain unconfirmed until HMAC signature verification occurs via webhook.'
      }
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Step 2: COMPLIANCE SERVER-SIDE WEBHOOK LISTENER
 * The ONLY authority capable of setting payments.verified_server_side = 1.
 * Validates HMAC SHA-256 signature using raw payload buffer and secret.
 */
export async function handlePaymentWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'] || req.headers['x-webhook-signature'];
    
    // Express provides req.rawBody if configured, or fallback to stringified body
    const rawPayload = req.rawBody || JSON.stringify(req.body);

    const verificationResult = verifyWebhookSignature(rawPayload, signature);

    if (!verificationResult.isValid) {
      console.warn('[SECURITY] Unauthorized payment webhook rejected:', verificationResult.reason);
      return res.status(400).json({
        success: false,
        error: 'Cryptographic Signature Verification Failed',
        details: verificationResult.reason
      });
    }

    // Signature is authentic and valid!
    const body = typeof req.body === 'object' ? req.body : JSON.parse(rawPayload);
    const event = body.event || 'payment.captured';
    const paymentEntity = body.payload?.payment?.entity || body.payment || {};

    const paymentCode = paymentEntity.notes?.payment_code || req.query.payment_code;
    const gatewayOrderId = paymentEntity.order_id;
    const gatewayPaymentId = paymentEntity.id || `pay_${Date.now()}`;
    const webhookEventId = body.id || `evt_${Date.now()}`;

    // Find the payment record
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
      return res.status(200).json({ received: true, note: 'Payment record not found; event logged.' });
    }

    const now = new Date().toISOString();

    // UPDATE PAYMENT: Set verified_server_side = 1
    await query(
      `UPDATE payments
       SET verified_server_side = 1,
           status = 'captured',
           gateway_payment_id = $1,
           gateway_signature = $2,
           webhook_event_id = $3,
           signature_verified_at = $4,
           raw_webhook_payload = $5,
           updated_at = datetime('now')
       WHERE id = $6`,
      [gatewayPaymentId, signature, webhookEventId, now, JSON.stringify(body), paymentRecord.id]
    );

    // Update parent booking to confirmed
    if (paymentRecord.booking_id) {
      await query(
        `UPDATE bookings 
         SET status = 'confirmed', updated_at = datetime('now') 
         WHERE id = $1`,
        [paymentRecord.booking_id]
      );
    }

    // Update parent order to paid
    if (paymentRecord.order_id) {
      await query(
        `UPDATE orders 
         SET status = 'paid', updated_at = datetime('now') 
         WHERE id = $1`,
        [paymentRecord.order_id]
      );
    }

    console.log(`[PAYMENT VERIFIED] Webhook verified payment ${paymentRecord.payment_code} server-side. verified_server_side=true.`);

    return res.status(200).json({
      received: true,
      verified_server_side: true,
      payment_code: paymentRecord.payment_code,
      verified_at: now
    });
  } catch (err) {
    console.error('Webhook processing exception:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Developer Simulator for testing HMAC Webhook verification locally
 */
export async function simulateWebhookExecution(req, res) {
  try {
    const { payment_code } = req.body;
    if (!payment_code) {
      return res.status(400).json({ success: false, error: 'payment_code is required to simulate webhook' });
    }

    const pRes = await query('SELECT * FROM payments WHERE payment_code = $1', [payment_code]);
    if (pRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    const payment = pRes.rows[0];

    // Generate genuine HMAC signature
    const mock = createMockWebhookEvent({
      paymentCode: payment.payment_code,
      amountPaise: payment.amount_paise,
      gatewayOrderId: payment.gateway_order_id
    });

    // Simulate sending to webhook endpoint internally
    const mockReq = {
      headers: {
        'x-razorpay-signature': mock.signature
      },
      rawBody: mock.rawPayload,
      body: mock.payload,
      query: { payment_code: payment.payment_code }
    };

    let simulatedResponse = null;
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          simulatedResponse = { statusCode: code, data };
          return simulatedResponse;
        }
      })
    };

    await handlePaymentWebhook(mockReq, mockRes);

    return res.json({
      success: true,
      message: 'Cryptographic HMAC signature created and verified server-side.',
      signature: mock.signature,
      simulatedResponse
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
