import crypto from 'node:crypto';
import { query } from '../database/db.js';

/**
 * COMPLIANCE ENDPOINT: Standard Cancellation & Refund Policies
 * Displayed explicitly to devotees BEFORE any monetary payment
 */
export function getCancellationPolicy(req, res) {
  return res.json({
    success: true,
    policy: {
      platform: 'Shiri Mandir Transparency Assurance',
      version: '2026.1',
      puja_services: [
        {
          tier: '>48h_full_refund',
          timeframe: 'More than 48 hours before scheduled puja',
          refund_percentage: 98,
          deduction_note: '100% refund minus 2% standard banking gateway fee',
          eligibility: 'Automatic full refund eligibility'
        },
        {
          tier: '24-48h_partial_50',
          timeframe: 'Between 24 to 48 hours before scheduled puja',
          refund_percentage: 50,
          deduction_note: '50% retained for priest schedule hold & flower reservations',
          eligibility: 'Automatic 50% refund eligibility'
        },
        {
          tier: '<24h_non_refundable',
          timeframe: 'Less than 24 hours before scheduled puja',
          refund_percentage: 0,
          deduction_note: 'Non-refundable (Vedic samagri purchased, Brahmana sankalp initiated)',
          eligibility: 'Ineligible for cancellation'
        }
      ],
      prasad_orders: [
        {
          tier: 'pre_dispatch_prasad',
          stage: 'Before temple packaging & courier dispatch',
          refund_percentage: 100,
          deduction_note: 'Full 100% refund guaranteed',
          eligibility: 'Full refund'
        },
        {
          tier: 'dispatched_food_non_refundable',
          stage: 'After dispatch / transit',
          refund_percentage: 0,
          deduction_note: 'Non-returnable due to FSSAI food safety regulations and sacred prasadam purity',
          eligibility: 'Ineligible once shipped'
        }
      ],
      legal_disclaimer: 'All refund calculations are automatically enforced by code logic based on verified timestamps.'
    }
  });
}

/**
 * Devotee: Request Refund
 * Automatically calculates eligible amount using code-enforced rules
 */
export async function createRefundRequest(req, res) {
  try {
    const { booking_id, order_id, reason } = req.body;

    if (!booking_id && !order_id) {
      return res.status(400).json({ success: false, error: 'Either booking_id or order_id must be specified' });
    }

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Please provide a valid reason for cancellation' });
    }

    let requestedAmountPaise = 0;
    let eligibleAmountPaise = 0;
    let deductionFeePaise = 0;
    let policyTier = '';
    let paymentId = null;

    if (booking_id) {
      const bRes = await query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2', [booking_id, req.user.id]);
      if (bRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Booking not found' });
      const booking = bRes.rows[0];

      if (['cancelled', 'refunded'].includes(booking.status)) {
        return res.status(409).json({ success: false, error: 'Booking is already cancelled or refunded' });
      }

      requestedAmountPaise = booking.total_amount_paise;

      // Locate payment record
      const pRes = await query('SELECT id FROM payments WHERE booking_id = $1 AND verified_server_side = 1', [booking.id]);
      if (pRes.rows.length > 0) paymentId = pRes.rows[0].id;

      // Auto-enforce cancellation timeframe
      const scheduledDate = new Date(booking.scheduled_date);
      const now = new Date();
      const diffHours = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours >= 48) {
        policyTier = '>48h_full_refund';
        deductionFeePaise = Math.round(requestedAmountPaise * 0.02); // 2% gateway fee
        eligibleAmountPaise = requestedAmountPaise - deductionFeePaise;
      } else if (diffHours >= 24) {
        policyTier = '24-48h_partial_50';
        eligibleAmountPaise = Math.round(requestedAmountPaise * 0.5);
        deductionFeePaise = requestedAmountPaise - eligibleAmountPaise;
      } else {
        policyTier = '<24h_non_refundable';
        eligibleAmountPaise = 0;
        deductionFeePaise = requestedAmountPaise;
      }
    } else {
      const oRes = await query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [order_id, req.user.id]);
      if (oRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Order not found' });
      const order = oRes.rows[0];

      if (['cancelled', 'refunded'].includes(order.status)) {
        return res.status(409).json({ success: false, error: 'Order is already cancelled or refunded' });
      }

      requestedAmountPaise = order.total_amount_paise;

      const pRes = await query('SELECT id FROM payments WHERE order_id = $1 AND verified_server_side = 1', [order.id]);
      if (pRes.rows.length > 0) paymentId = pRes.rows[0].id;

      if (['pending_payment', 'paid', 'preparing'].includes(order.status)) {
        policyTier = 'pre_dispatch_prasad';
        eligibleAmountPaise = requestedAmountPaise;
        deductionFeePaise = 0;
      } else {
        policyTier = 'dispatched_food_non_refundable';
        eligibleAmountPaise = 0;
        deductionFeePaise = requestedAmountPaise;
      }
    }

    const refundCode = `REF-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const insertRes = await query(
      `INSERT INTO refund_requests (
        refund_code, user_id, booking_id, order_id, payment_id,
        requested_amount_paise, eligible_amount_paise, deduction_fee_paise,
        reason, policy_tier, cancellation_rules_accepted, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1, 'requested')
      RETURNING *`,
      [
        refundCode,
        req.user.id,
        booking_id || null,
        order_id || null,
        paymentId,
        requestedAmountPaise,
        eligibleAmountPaise,
        deductionFeePaise,
        reason.trim(),
        policyTier
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Refund request logged and policy tier automatically evaluated.',
      data: {
        ...insertRes.rows[0],
        requested_amount_inr: requestedAmountPaise / 100,
        eligible_amount_inr: eligibleAmountPaise / 100,
        deduction_fee_inr: deductionFeePaise / 100
      }
    });
  } catch (err) {
    console.error('Error creating refund request:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getMyRefundRequests(req, res) {
  try {
    const { rows } = await query(
      'SELECT * FROM refund_requests WHERE user_id = $1 ORDER BY id DESC',
      [req.user.id]
    );

    const enriched = rows.map(r => ({
      ...r,
      requested_amount_inr: r.requested_amount_paise / 100,
      eligible_amount_inr: r.eligible_amount_paise / 100,
      deduction_fee_inr: r.deduction_fee_paise / 100
    }));

    return res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
