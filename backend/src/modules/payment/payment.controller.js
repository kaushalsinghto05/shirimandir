import { paymentService } from './payment.service.js';
import { createMockWebhookEvent } from './webhook.service.js';
import { query } from '../../database/db.js';

export async function createPaymentIntent(req, res, next) {
  try {
    const data = await paymentService.createIntent(req.body, req.user);
    return res.status(201).json({
      success: true,
      data
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const result = await paymentService.verifyDirectPayment(req.body, req.user);
    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        success: false,
        error: err.message,
        details: err.details
      });
    }
    next(err);
  }
}

export async function handlePaymentWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'] || req.headers['x-webhook-signature'];
    const rawPayload = req.rawBody || JSON.stringify(req.body);

    const result = await paymentService.processWebhook(rawPayload, signature, req.body, req.query);
    return res.status(200).json(result);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        success: false,
        error: err.message,
        details: err.details
      });
    }
    next(err);
  }
}

export async function getPaymentByCode(req, res, next) {
  try {
    const { payment_code } = req.params;
    const payment = await paymentService.getPaymentByCode(payment_code, req.user);

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    return res.json({
      success: true,
      data: payment
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
}

export async function getMyPayments(req, res, next) {
  try {
    const payments = await paymentService.getDevoteePayments(req.user.id);
    return res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    next(err);
  }
}

export async function simulateWebhookExecution(req, res, next) {
  try {
    const { payment_code, event_type = 'payment.captured' } = req.body;
    if (!payment_code) {
      return res.status(400).json({ success: false, error: 'payment_code is required to simulate webhook' });
    }

    const pRes = await query('SELECT * FROM payments WHERE payment_code = $1', [payment_code]);
    if (pRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    const payment = pRes.rows[0];

    const mock = createMockWebhookEvent({
      eventType: event_type,
      paymentCode: payment.payment_code,
      amountPaise: payment.amount_paise,
      gatewayOrderId: payment.gateway_order_id
    });

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

    await handlePaymentWebhook(mockReq, mockRes, next);

    return res.json({
      success: true,
      message: 'Cryptographic HMAC signature created and verified server-side.',
      signature: mock.signature,
      simulatedResponse
    });
  } catch (err) {
    next(err);
  }
}
