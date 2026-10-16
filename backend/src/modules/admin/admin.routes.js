import { Router } from 'express';
import {
  getDashboardMetrics,
  getAllRefundRequests,
  processRefundReview,
  getAuditLogs,
  getReconciliationExceptions,
  getConsolidatedReports
} from './admin.controller.js';
import { authenticate, requireRole } from '../../core/middleware/auth.js';

const router = Router();

// Guard all admin routes (devotee strictly prohibited with 403 Forbidden)
router.use(authenticate, requireRole(['admin', 'super_admin']));

router.get('/metrics', getDashboardMetrics);
router.get('/refunds', getAllRefundRequests);
router.put('/refunds/:id/review', processRefundReview);
router.get('/audit-logs', getAuditLogs);
router.get('/reconciliations', getReconciliationExceptions);
router.get('/reports', getConsolidatedReports);

export default router;

