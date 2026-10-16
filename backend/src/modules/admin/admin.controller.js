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

// ── Support Cases (P1) ──
export async function getSupportCases(req, res, next) {
  try {
    const cases = await adminService.getSupportCases();
    return res.json({ success: true, data: cases });
  } catch (err) {
    next(err);
  }
}

export async function updateSupportCase(req, res, next) {
  try {
    const { id } = req.params;
    const result = await adminService.updateSupportCase(id, req.body, req.user?.email);
    return res.json({ success: true, message: 'Support case updated successfully', data: result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, error: err.message });
    next(err);
  }
}

// ── Controlled Privileged Access ──
export async function getPrivilegedAccessSessions(req, res, next) {
  try {
    const sessions = await adminService.getPrivilegedAccessSessions();
    return res.json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
}

export async function createPrivilegedAccessSession(req, res, next) {
  try {
    const result = await adminService.createPrivilegedAccessSession(req.body, req.user?.email || 'superadmin@shirimandir.org', req.ip);
    return res.json({ success: true, message: 'Privileged session authorized', data: result });
  } catch (err) {
    next(err);
  }
}

export async function revokePrivilegedAccessSession(req, res, next) {
  try {
    const { code } = req.params;
    const result = await adminService.revokePrivilegedAccessSession(code, req.user?.email);
    return res.json({ success: true, message: 'Privileged session revoked', data: result });
  } catch (err) {
    next(err);
  }
}

// ── Platform Configurations ──
export async function getPlatformConfigurations(req, res, next) {
  try {
    const configs = await adminService.getPlatformConfigurations();
    return res.json({ success: true, data: configs });
  } catch (err) {
    next(err);
  }
}

export async function updatePlatformConfiguration(req, res, next) {
  try {
    const { key } = req.params;
    const { config_value } = req.body;
    const result = await adminService.updatePlatformConfiguration(key, config_value, req.user?.email || 'superadmin@shirimandir.org');
    return res.json({ success: true, message: 'Configuration updated successfully', data: result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, error: err.message });
    next(err);
  }
}

// ── Platform Subscriptions (P1) ──
export async function getPlatformSubscriptions(req, res, next) {
  try {
    const subs = await adminService.getPlatformSubscriptions();
    return res.json({ success: true, data: subs });
  } catch (err) {
    next(err);
  }
}

// ── Alert Rules (P2) ──
export async function getAlertRules(req, res, next) {
  try {
    const rules = await adminService.getAlertRules();
    return res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
}

export async function updateAlertRule(req, res, next) {
  try {
    const { id } = req.params;
    const result = await adminService.updateAlertRule(id, req.body);
    return res.json({ success: true, message: 'Alert rule updated', data: result });
  } catch (err) {
    next(err);
  }
}

// ── Data Export ──
export async function exportPlatformData(req, res, next) {
  try {
    const exportResult = await adminService.exportPlatformData(req.body);
    return res.json({ success: true, data: exportResult });
  } catch (err) {
    next(err);
  }
}


