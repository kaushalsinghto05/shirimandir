import { query } from '../../database/db.js';
import { eventBus, DomainEvents } from '../../core/events/eventBus.js';

export class AdminService {
  /**
   * Super Admin & Temple Compliance Overview Metrics
   */
  async getDashboardMetrics() {
    const templesStats = await query(`
      SELECT 
        COUNT(*) AS total_temples,
        SUM(CASE WHEN verification_status = 'official' THEN 1 ELSE 0 END) AS official_temples,
        SUM(CASE WHEN verification_status = 'partnered' THEN 1 ELSE 0 END) AS partnered_temples,
        SUM(CASE WHEN verification_status = 'independent' THEN 1 ELSE 0 END) AS independent_temples
      FROM temples
    `);

    const bookingsStats = await query(`
      SELECT 
        COUNT(*) AS total_bookings,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
        SUM(CASE WHEN status = 'pending_payment' THEN 1 ELSE 0 END) AS pending_bookings,
        SUM(CASE WHEN proof_media_url IS NOT NULL THEN 1 ELSE 0 END) AS proof_attached_count,
        SUM(total_amount_paise) AS gross_volume_paise
      FROM bookings
    `);

    const prasadStats = await query(`
      SELECT 
        COUNT(*) AS total_prasad,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_items,
        SUM(CASE WHEN is_edible = 1 AND (fssai_verified_at IS NULL OR is_active = 0) THEN 1 ELSE 0 END) AS pending_fssai_approval,
        SUM(stock_qty) AS total_inventory_units
      FROM prasad_items
    `);

    const refundsStats = await query(`
      SELECT 
        COUNT(*) AS total_refunds,
        SUM(CASE WHEN status = 'requested' THEN 1 ELSE 0 END) AS pending_refunds,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_refunds,
        SUM(eligible_amount_paise) AS eligible_refund_paise
      FROM refund_requests
    `);

    const privacyStats = await query(`
      SELECT 
        COUNT(*) AS total_devotees,
        SUM(CASE WHEN consent_data_sharing = 1 THEN 1 ELSE 0 END) AS consent_granted_count,
        SUM(CASE WHEN consent_data_sharing = 0 THEN 1 ELSE 0 END) AS privacy_protected_count
      FROM users WHERE role = 'devotee'
    `);

    const b = bookingsStats.rows[0];
    const completed = Number(b.completed_bookings) || 0;
    const proofAttached = Number(b.proof_attached_count) || 0;
    const proofComplianceRate = completed > 0 ? Math.round((proofAttached / completed) * 100) : 100;

    return {
      temples: templesStats.rows[0],
      bookings: {
        ...b,
        gross_volume_inr: (Number(b.gross_volume_paise) || 0) / 100,
        proof_compliance_rate_percent: proofComplianceRate
      },
      prasad: prasadStats.rows[0],
      refunds: {
        ...refundsStats.rows[0],
        eligible_refund_inr: (Number(refundsStats.rows[0]?.eligible_refund_paise) || 0) / 100
      },
      privacy: privacyStats.rows[0]
    };
  }

  /**
   * Get all refund requests
   */
  async getAllRefundRequests() {
    const { rows } = await query(`
      SELECT r.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
             b.booking_code, o.order_code
      FROM refund_requests r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      LEFT JOIN orders o ON r.order_id = o.id
      ORDER BY r.id DESC
    `);

    return rows.map(r => ({
      ...r,
      requested_amount_inr: r.requested_amount_paise / 100,
      eligible_amount_inr: r.eligible_amount_paise / 100,
      deduction_fee_inr: r.deduction_fee_paise / 100
    }));
  }

  /**
   * Process refund review (approve or reject)
   */
  async processRefundReview(id, { status, admin_notes }, adminUserId) {
    if (!['approved', 'rejected'].includes(status)) {
      throw { status: 400, message: 'Status must be approved or rejected' };
    }

    const rRes = await query('SELECT * FROM refund_requests WHERE id = $1', [id]);
    if (rRes.rows.length === 0) {
      throw { status: 404, message: 'Refund request not found' };
    }

    const refund = rRes.rows[0];
    const now = new Date().toISOString();

    await query(
      `UPDATE refund_requests
       SET status = $1, admin_notes = $2, processed_by = $3, processed_at = $4, updated_at = datetime('now')
       WHERE id = $5`,
      [status, admin_notes || 'Reviewed according to statutory cancellation policy', adminUserId, now, id]
    );

    if (status === 'approved') {
      if (refund.booking_id) {
        await query('UPDATE bookings SET status = \'refunded\', updated_at = datetime(\'now\') WHERE id = $1', [refund.booking_id]);
      }
      if (refund.order_id) {
        await query('UPDATE orders SET status = \'refunded\', updated_at = datetime(\'now\') WHERE id = $1', [refund.order_id]);
      }
    }

    eventBus.publish(DomainEvents.REFUND_PROCESSED, {
      refundId: id,
      refundCode: refund.refund_code,
      status,
      approvedAmountPaise: status === 'approved' ? refund.eligible_amount_paise : 0
    });

    return {
      id,
      refundCode: refund.refund_code,
      status,
      processed_at: now
    };
  }

  /**
   * Audit Trail (FR-AUD-001..006, AT-12)
   */
  async getAuditLogs(limit = 50) {
    const { rows } = await query(
      `SELECT a.*, u.name AS actor_name
       FROM audit_logs a
       LEFT JOIN users u ON a.actor_user_id = u.id
       ORDER BY a.id DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  }

  /**
   * Platform Operations & Payment Exceptions (AT-05, AT-06, FR-PAY-007)
   */
  async getReconciliationExceptions() {
    const { rows } = await query(
      `SELECT r.*, p.payment_code
       FROM reconciliation_exceptions r
       LEFT JOIN payments p ON r.payment_id = p.id
       ORDER BY r.id DESC`
    );
    return rows.map(r => ({
      ...r,
      expected_amount_inr: r.expected_amount_paise / 100,
      received_amount_inr: r.received_amount_paise / 100
    }));
  }

  /**
   * Consolidated Trust & Platform Financial Reports (FR-REP-001..006)
   */
  async getConsolidatedReports() {
    const bookingsByTemple = await query(`
      SELECT t.name AS temple_name, t.slug,
             COUNT(b.id) AS booking_count,
             COALESCE(SUM(b.total_amount_paise), 0) AS total_paise
      FROM temples t
      LEFT JOIN bookings b ON t.id = b.temple_id
      GROUP BY t.id, t.name, t.slug
    `);

    const donationsByTemple = await query(`
      SELECT t.name AS temple_name, t.slug,
             COUNT(d.id) AS donation_count,
             COALESCE(SUM(d.amount_paise), 0) AS total_paise
      FROM temples t
      LEFT JOIN donations d ON t.id = d.temple_id
      GROUP BY t.id, t.name, t.slug
    `);

    return {
      temple_bookings: bookingsByTemple.rows.map(r => ({
        ...r,
        total_inr: Number(r.total_paise) / 100
      })),
      temple_donations: donationsByTemple.rows.map(r => ({
        ...r,
        total_inr: Number(r.total_paise) / 100
      }))
    };
  }

  /**
   * Support Case Management (FR-SUP-001..005)
   */
  async getSupportCases() {
    const { rows } = await query(`
      SELECT * FROM support_cases
      ORDER BY 
        CASE priority 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        id DESC
    `);
    return rows;
  }

  async updateSupportCase(id, { status, assigned_to, resolution_notes }, actorEmail) {
    const caseRes = await query('SELECT * FROM support_cases WHERE id = $1', [id]);
    if (caseRes.rows.length === 0) {
      throw { status: 404, message: 'Support case not found' };
    }
    const current = caseRes.rows[0];
    const newStatus = status || current.status;
    const newAssigned = assigned_to || current.assigned_to;
    const newNotes = resolution_notes || current.resolution_notes;

    await query(
      `UPDATE support_cases 
       SET status = $1, assigned_to = $2, resolution_notes = $3, updated_at = datetime('now')
       WHERE id = $4`,
      [newStatus, newAssigned, newNotes, id]
    );

    // Audit trail record
    await query(
      `INSERT INTO audit_logs (actor_email, actor_role, action, resource_type, resource_id, details)
       VALUES ($1, 'super_admin', 'support_case.updated', 'support_case', $2, $3)`,
      [actorEmail || 'superadmin@shirimandir.org', String(id), `Updated case #${current.ticket_number} status to '${newStatus}', assigned to '${newAssigned}'`]
    );

    return { id, ticket_number: current.ticket_number, status: newStatus, assigned_to: newAssigned };
  }

  /**
   * Controlled Administrative Access (Break-Glass & Privileged Impersonation Sessions)
   */
  async getPrivilegedAccessSessions() {
    const { rows } = await query('SELECT * FROM privileged_access_sessions ORDER BY id DESC');
    return rows;
  }

  async createPrivilegedAccessSession({ target_tenant_name, access_level, justification, authorized_by, duration_minutes = 120 }, actorEmail, ipAddress) {
    const sessionCode = `PRV-${Date.now().toString().slice(-6)}`;
    const expiresAt = new Date(Date.now() + duration_minutes * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

    await query(
      `INSERT INTO privileged_access_sessions 
        (session_code, actor_email, target_tenant_name, access_level, justification, authorized_by, expires_at, status, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8)`,
      [sessionCode, actorEmail, target_tenant_name, access_level, justification, authorized_by, expiresAt, ipAddress || '127.0.0.1']
    );

    // Log in immutable audit trail
    await query(
      `INSERT INTO audit_logs (actor_email, actor_role, action, resource_type, resource_id, details, ip_address)
       VALUES ($1, 'super_admin', 'privileged_access.initiated', 'tenant', $2, $3, $4)`,
      [actorEmail, target_tenant_name, `Authorized ${access_level} privileged session (${sessionCode}) with justification: "${justification}". Authorized by: ${authorized_by}`, ipAddress || '127.0.0.1']
    );

    return { session_code: sessionCode, expires_at: expiresAt, status: 'active' };
  }

  async revokePrivilegedAccessSession(sessionCode, actorEmail) {
    await query(
      `UPDATE privileged_access_sessions SET status = 'revoked' WHERE session_code = $1`,
      [sessionCode]
    );

    await query(
      `INSERT INTO audit_logs (actor_email, actor_role, action, resource_type, resource_id, details)
       VALUES ($1, 'super_admin', 'privileged_access.revoked', 'session', $2, 'Revoked break-glass access session prematurely.')`,
      [actorEmail || 'superadmin@shirimandir.org', sessionCode]
    );

    return { session_code: sessionCode, status: 'revoked' };
  }

  /**
   * Platform Configuration Management (FR-CFG-001..004)
   */
  async getPlatformConfigurations() {
    const { rows } = await query('SELECT * FROM platform_configurations ORDER BY category ASC, id ASC');
    return rows;
  }

  async updatePlatformConfiguration(configKey, configValue, actorEmail) {
    const current = await query('SELECT * FROM platform_configurations WHERE config_key = $1', [configKey]);
    if (current.rows.length === 0) {
      throw { status: 404, message: 'Configuration key not found' };
    }

    await query(
      `UPDATE platform_configurations 
       SET config_value = $1, last_modified_by = $2, updated_at = datetime('now')
       WHERE config_key = $3`,
      [configValue, actorEmail, configKey]
    );

    await query(
      `INSERT INTO audit_logs (actor_email, actor_role, action, resource_type, resource_id, details)
       VALUES ($1, 'super_admin', 'platform_config.modified', 'configuration', $2, $3)`,
      [actorEmail, configKey, `Updated '${configKey}' from '${current.rows[0].config_value}' to '${configValue}'`]
    );

    return { config_key: configKey, config_value: configValue, updated_at: new Date().toISOString() };
  }

  /**
   * Platform Subscriptions & Direct Settlement (FR-REP-006, FR-AUD-006)
   */
  async getPlatformSubscriptions() {
    const { rows } = await query('SELECT * FROM platform_subscriptions ORDER BY id ASC');
    return rows.map(s => ({
      ...s,
      monthly_price_inr: s.monthly_price_paise / 100
    }));
  }

  /**
   * Configurable Alert Rules (FR-ALT-001..004)
   */
  async getAlertRules() {
    const { rows } = await query('SELECT * FROM alert_rules ORDER BY id ASC');
    return rows;
  }

  async updateAlertRule(id, { is_enabled, threshold_value }) {
    await query(
      `UPDATE alert_rules 
       SET is_enabled = $1, threshold_value = $2 
       WHERE id = $3`,
      [is_enabled ? 1 : 0, threshold_value, id]
    );
    return { id, is_enabled, threshold_value };
  }

  /**
   * Data Export Engine with Role Permissions & Sensitive Data Masking
   */
  async exportPlatformData({ dataset, tenant_name, mask_sensitive = true }) {
    let records = [];
    if (dataset === 'bookings') {
      const q = tenant_name && tenant_name !== 'All'
        ? `SELECT b.*, t.name AS temple_name, u.email AS devotee_email FROM bookings b JOIN temples t ON b.temple_id = t.id JOIN users u ON b.user_id = u.id WHERE t.name = $1 ORDER BY b.id DESC`
        : `SELECT b.*, t.name AS temple_name, u.email AS devotee_email FROM bookings b JOIN temples t ON b.temple_id = t.id JOIN users u ON b.user_id = u.id ORDER BY b.id DESC`;
      const res = tenant_name && tenant_name !== 'All' ? await query(q, [tenant_name]) : await query(q);
      records = res.rows.map(r => ({
        booking_code: r.booking_code,
        temple_name: r.temple_name,
        scheduled_date: r.scheduled_date,
        sankalp_name: mask_sensitive ? `${r.sankalp_name.slice(0, 2)}***` : r.sankalp_name,
        devotee_email: mask_sensitive ? `***@${r.devotee_email.split('@')[1]}` : r.devotee_email,
        total_amount_inr: r.total_amount_paise / 100,
        status: r.status,
        has_proof: Boolean(r.proof_media_url)
      }));
    } else if (dataset === 'donations') {
      const q = tenant_name && tenant_name !== 'All'
        ? `SELECT d.*, t.name AS temple_name FROM donations d JOIN temples t ON d.temple_id = t.id WHERE t.name = $1 ORDER BY d.id DESC`
        : `SELECT d.*, t.name AS temple_name FROM donations d JOIN temples t ON d.temple_id = t.id ORDER BY d.id DESC`;
      const res = tenant_name && tenant_name !== 'All' ? await query(q, [tenant_name]) : await query(q);
      records = res.rows.map(r => ({
        donation_code: r.donation_code,
        temple_name: r.temple_name,
        donor_name: mask_sensitive ? `${r.donor_name.slice(0, 2)}***` : r.donor_name,
        donor_pan: mask_sensitive && r.donor_pan ? `XXXXX${r.donor_pan.slice(-4)}` : r.donor_pan,
        amount_inr: r.amount_paise / 100,
        status: r.status,
        created_at: r.created_at
      }));
    } else if (dataset === 'audit_logs') {
      const res = await query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 500');
      records = res.rows.map(l => ({
        timestamp: l.created_at,
        actor: l.actor_email,
        role: l.actor_role,
        action: l.action,
        resource: `${l.resource_type}:${l.resource_id}`,
        details: l.details
      }));
    }

    return {
      dataset,
      generated_at: new Date().toISOString(),
      record_count: records.length,
      masking_applied: mask_sensitive,
      records
    };
  }
}

export const adminService = new AdminService();

