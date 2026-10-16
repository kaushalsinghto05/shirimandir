import { adminService } from './admin.service.js';

export async function getDashboardMetrics(req, res, next) {
  try {
    const data = await adminService.getDashboardMetrics();
    return res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllRefundRequests(req, res, next) {
  try {
    const data = await adminService.getAllRefundRequests();
    return res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
}

export async function processRefundReview(req, res, next) {
  try {
    const { id } = req.params;
    const result = await adminService.processRefundReview(id, req.body, req.user.id);

    return res.json({
      success: true,
      message: `Refund request #${result.refundCode} has been ${result.status}.`,
      data: {
        id: result.id,
        status: result.status,
        processed_at: result.processed_at
      }
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const logs = await adminService.getAuditLogs(limit);
    return res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}

export async function getReconciliationExceptions(req, res, next) {
  try {
    const exceptions = await adminService.getReconciliationExceptions();
    return res.json({ success: true, data: exceptions });
  } catch (err) {
    next(err);
  }
}

export async function getConsolidatedReports(req, res, next) {
  try {
    const reports = await adminService.getConsolidatedReports();
    return res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
}

