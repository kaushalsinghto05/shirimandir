import { refundService } from './refund.service.js';

export function getCancellationPolicy(req, res) {
  return res.json({
    success: true,
    policy: refundService.getCancellationPolicy()
  });
}

export async function createRefundRequest(req, res, next) {
  try {
    const result = await refundService.createRefundRequest(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: 'Refund request logged and policy tier automatically evaluated.',
      data: {
        ...result.record,
        requested_amount_inr: result.requestedAmountPaise / 100,
        eligible_amount_inr: result.eligibleAmountPaise / 100,
        deduction_fee_inr: result.deductionFeePaise / 100
      }
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
}

export async function getMyRefundRequests(req, res, next) {
  try {
    const refunds = await refundService.getDevoteeRefunds(req.user.id);
    return res.json({
      success: true,
      count: refunds.length,
      data: refunds
    });
  } catch (err) {
    next(err);
  }
}
