import { Router } from 'express';
import {
  getCancellationPolicy,
  createRefundRequest,
  getMyRefundRequests
} from './refund.controller.js';
import { authenticate } from '../../core/middleware/auth.js';

const router = Router();

// Public cancellation policy disclosure
router.get('/policy', getCancellationPolicy);

// Devotee refund actions
router.post('/request', authenticate, createRefundRequest);
router.get('/my', authenticate, getMyRefundRequests);

export default router;
