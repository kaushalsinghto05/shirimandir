import { Router } from 'express';
import {
  createPaymentIntent,
  verifyPayment,
  handlePaymentWebhook,
  simulateWebhookExecution,
  getPaymentByCode,
  getMyPayments
} from './payment.controller.js';
import { authenticate } from '../../core/middleware/auth.js';

const router = Router();

// Create pending payment record
router.post('/intent', authenticate, createPaymentIntent);

// Direct checkout verification (Razorpay client response handler)
router.post('/verify', authenticate, verifyPayment);

// Server-side Webhook (called by payment gateway Razorpay / PayU)
// Requires HMAC SHA-256 signature verification in handlePaymentWebhook
router.post('/webhook', handlePaymentWebhook);

// Dev / test simulation route
router.post('/simulate-webhook', authenticate, simulateWebhookExecution);

// Devotee payment history
router.get('/my', authenticate, getMyPayments);

// Devotee / Staff check payment details & verification status
router.get('/:payment_code', authenticate, getPaymentByCode);

export default router;
