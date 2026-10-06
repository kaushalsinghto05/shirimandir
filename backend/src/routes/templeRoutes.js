import { Router } from 'express';
import {
  getAllTemples,
  getTempleBySlug,
  createTemple,
  updateVerificationStatus
} from '../controllers/templeController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { uploadMiddleware } from '../services/storageService.js';

const router = Router();

router.get('/', getAllTemples);
router.get('/:slug', getTempleBySlug);

// Admin / Temple Partner route for registering temple with optional proof doc
router.post(
  '/',
  authenticate,
  requireRole(['admin', 'temple_partner']),
  uploadMiddleware.single('affiliation_proof'),
  createTemple
);

// Admin-only route for verifying or updating official status
router.put(
  '/:id/verification',
  authenticate,
  requireRole(['admin']),
  uploadMiddleware.single('affiliation_proof'),
  updateVerificationStatus
);

export default router;
