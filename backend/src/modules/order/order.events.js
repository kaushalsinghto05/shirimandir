import { eventBus, DomainEvents } from '../../core/events/eventBus.js';
import { orderService } from './order.service.js';

export function registerOrderEventSubscribers() {
  eventBus.subscribe(DomainEvents.PAYMENT_CAPTURED, async (payload) => {
    if (payload.orderId) {
      try {
        await orderService.markOrderPaid(payload.orderId);
      } catch (err) {
        console.error(`[ORDER EVENT] Failed to mark order ${payload.orderId} as paid:`, err);
      }
    }
  });
}
