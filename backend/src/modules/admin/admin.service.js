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
}

export const adminService = new AdminService();
