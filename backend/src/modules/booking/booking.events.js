import { eventBus, DomainEvents } from '../../core/events/eventBus.js';
import { bookingService } from './booking.service.js';

export function registerBookingEventSubscribers() {
  eventBus.subscribe(DomainEvents.PAYMENT_CAPTURED, async (payload) => {
    if (payload.bookingId) {
      try {
        await bookingService.confirmBooking(payload.bookingId);
      } catch (err) {
        console.error(`[BOOKING EVENT] Failed to confirm booking ${payload.bookingId}:`, err);
      }
    }
  });
}
