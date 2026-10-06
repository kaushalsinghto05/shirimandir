import { Router } from 'express';
import {
  createPaymentIntent,
  handlePaymentWebhook,
  simulateWebhookExecution
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Create pending payment record
router.post('/intent', authenticate, createPaymentIntent);

// Server-side Webhook (called by payment gateway Razorpay / PayU)
// Requires HMAC SHA-256 signature verification in handlePaymentWebhook
router.post('/webhook', handlePaymentWebhook);

// Dev / test simulation route
router.post('/simulate-webhook', authenticate, simulateWebhookExecution);

export default router;
