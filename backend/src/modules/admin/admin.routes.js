import { Router } from 'express';
import {
  getDashboardMetrics,
  getAllRefundRequests,
  processRefundReview
} from './admin.controller.js';
import { authenticate, requireRole } from '../../core/middleware/auth.js';

const router = Router();

// Guard all admin routes
router.use(authenticate, requireRole(['admin']));

router.get('/metrics', getDashboardMetrics);
router.get('/refunds', getAllRefundRequests);
router.put('/refunds/:id/review', processRefundReview);

export default router;
