import { Router } from 'express';
import {
  getCampaigns,
  createCampaign,
  createDonation,
  getMyDonations,
  getReceipt
} from './donation.controller.js';
import { authenticate, requireRole } from '../../core/middleware/auth.js';

const router = Router();

// Public: View active campaigns
router.get('/campaigns', getCampaigns);

// Admin: Create new donation campaign
router.post('/campaigns', authenticate, requireRole(['admin', 'super_admin']), createCampaign);

// Devotee / Public: Make a donation (with optional authenticated session)
router.post('/', (req, res, next) => {
  // Try authenticating if authorization header is present, but allow guest donations
  if (req.headers.authorization || req.headers.cookie) {
    return authenticate(req, res, () => createDonation(req, res, next));
  }
  return createDonation(req, res, next);
});

// Devotee: View own donation history and receipts
router.get('/my', authenticate, getMyDonations);

// Public / Devotee: Verify or retrieve 80G receipt
router.get('/receipts/:receiptNumber', getReceipt);

export default router;
