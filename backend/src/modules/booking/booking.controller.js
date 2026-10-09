import { bookingService } from './booking.service.js';
import { getPublicMediaUrl } from '../../core/storage/storageService.js';

export async function createBooking(req, res, next) {
  try {
    const result = await bookingService.createBooking(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Booking initiated with transparent itemized pricing breakdown',
      data: {
        ...result.booking,
        itemized_breakdown: result.itemized_breakdown,
        cancellation_policy_pre_payment: result.cancellation_policy_pre_payment
      }
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
}

export async function getMyBookings(req, res, next) {
  try {
    const bookings = await bookingService.getDevoteeBookings(req.user.id);
    return res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
}

export async function getBookingById(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id, req.user);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    return res.json({
      success: true,
      data: booking
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
}

export async function uploadBookingProof(req, res, next) {
  try {
    const { id } = req.params;
    let mediaUrl = req.body.proof_media_url || null;

    if (req.file) {
      mediaUrl = getPublicMediaUrl(req.file, req);
    }

    const result = await bookingService.uploadProof(
      id,
      {
        mediaUrl,
        proof_media_type: req.body.proof_media_type || 'photo',
        proof_notes: req.body.proof_notes
      },
      req.user.id
    );

    return res.json({
      success: true,
      message: 'Proof of service attached successfully and booking marked as Completed. Devotee has been notified.',
      data: result
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        success: false,
        error: err.message,
        requiredField: err.requiredField
      });
    }
    next(err);
  }
}
