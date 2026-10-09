import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  uploadBookingProof
} from './booking.controller.js';
import { authenticate, requireRole } from '../../core/middleware/auth.js';
import { uploadMiddleware } from '../../core/storage/storageService.js';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);

// Proof-of-service media upload (Temple Partner or Admin)
router.put(
  '/:id/proof',
  authenticate,
  requireRole(['admin', 'temple_partner']),
  uploadMiddleware.single('proof_media'),
  uploadBookingProof
);

export default router;
