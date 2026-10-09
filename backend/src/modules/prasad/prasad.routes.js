import { Router } from 'express';
import {
  getAllPrasad,
  getPrasadById,
  createPrasadItem,
  approveFSSAI
} from './prasad.controller.js';
import { authenticate, requireRole } from '../../core/middleware/auth.js';

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
