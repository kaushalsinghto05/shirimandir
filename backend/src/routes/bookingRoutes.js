import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  uploadBookingProof
} from '../controllers/bookingController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { uploadMiddleware } from '../services/storageService.js';

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
