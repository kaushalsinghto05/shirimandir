import { Router } from 'express';
import {
  getAllPrasad,
  getPrasadById,
  createPrasadItem,
  approveFSSAI
} from '../controllers/prasadController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllPrasad);
router.get('/:id', getPrasadById);

router.post(
  '/',
  authenticate,
  requireRole(['admin', 'temple_partner']),
  createPrasadItem
);

// Admin-only FSSAI verification approval
router.put(
  '/:id/approve-fssai',
  authenticate,
  requireRole(['admin']),
  approveFSSAI
);

export default router;
