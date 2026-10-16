import { Router } from 'express';
import {
  getDashboardMetrics,
  getAllRefundRequests,
  processRefundReview,
  getAuditLogs,
  getReconciliationExceptions,
  getConsolidatedReports,
  getSupportCases,
  updateSupportCase,
  getPrivilegedAccessSessions,
  createPrivilegedAccessSession,
  revokePrivilegedAccessSession,
  getPlatformConfigurations,
  updatePlatformConfiguration,
  getPlatformSubscriptions,
  getAlertRules,
  updateAlertRule,
  exportPlatformData
} from './admin.controller.js';
import { authenticate, requireRole } from '../../core/middleware/auth.js';

const router = Router();

// Guard all admin routes (devotee strictly prohibited with 403 Forbidden)
router.use(authenticate, requireRole(['admin', 'super_admin']));

// Operational Telemetry & Finance
router.get('/metrics', getDashboardMetrics);
router.get('/refunds', getAllRefundRequests);
router.put('/refunds/:id/review', processRefundReview);
router.get('/audit-logs', getAuditLogs);
router.get('/reconciliations', getReconciliationExceptions);
router.get('/reports', getConsolidatedReports);

// P1 Support Case Management
router.get('/support-cases', getSupportCases);
router.put('/support-cases/:id', updateSupportCase);

// Controlled Privileged Access Sessions
router.get('/privileged-access', getPrivilegedAccessSessions);
router.post('/privileged-access', createPrivilegedAccessSession);
router.put('/privileged-access/:code/revoke', revokePrivilegedAccessSession);

// Platform Configuration Management
router.get('/configurations', getPlatformConfigurations);
router.put('/configurations/:key', updatePlatformConfiguration);

// P1 Subscriptions & Direct Settlement
router.get('/subscriptions', getPlatformSubscriptions);

// P2 Configurable Alert Rules
router.get('/alert-rules', getAlertRules);
router.put('/alert-rules/:id', updateAlertRule);

// Data Export
router.post('/export', exportPlatformData);

export default router;


