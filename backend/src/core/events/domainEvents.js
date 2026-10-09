/**
 * Shiri Mandir Domain Events Catalog
 * Defines standard decoupled events emitted and handled across Modulith modules.
 */
export const DomainEvents = {
  // Payment Lifecycle
  PAYMENT_CAPTURED: 'payment.captured',
  PAYMENT_FAILED: 'payment.failed',

  // Booking Lifecycle
  BOOKING_CREATED: 'booking.created',
  BOOKING_CONFIRMED: 'booking.confirmed',
  BOOKING_COMPLETED: 'booking.completed',

  // Order Lifecycle
  ORDER_CREATED: 'order.created',
  ORDER_PAID: 'order.paid',
  ORDER_DISPATCHED: 'order.dispatched',

  // Prasad Compliance
  PRASAD_FSSAI_APPROVED: 'prasad.fssai.approved',

  // Refund Lifecycle
  REFUND_REQUESTED: 'refund.requested',
  REFUND_PROCESSED: 'refund.processed'
};
