import { EventEmitter } from 'node:events';
import { DomainEvents } from './domainEvents.js';

class DomainEventBus extends EventEmitter {
  constructor() {
    super();
    // Allow ample listeners for decoupled modules
    this.setMaxListeners(50);
  }

  /**
   * Publish a domain event asynchronously to all registered module subscribers
   * @param {string} eventName
   * @param {object} payload
   */
  publish(eventName, payload = {}) {
    const eventContext = {
      ...payload,
      _publishedAt: new Date().toISOString()
    };

    console.log(`[EVENT-BUS] ⚡ Emitting domain event: ${eventName}`, {
      keys: Object.keys(payload)
    });

    // Execute listeners safely without crashing caller if any listener fails
    setImmediate(() => {
      try {
        this.emit(eventName, eventContext);
      } catch (err) {
        console.error(`[EVENT-BUS] Error dispatching event ${eventName}:`, err);
      }
    });
  }

  /**
   * Subscribe a handler to a domain event with safe error catching
   * @param {string} eventName
   * @param {function} handler
   */
  subscribe(eventName, handler) {
    this.on(eventName, async (data) => {
      try {
        await handler(data);
      } catch (err) {
        console.error(`[EVENT-BUS] Listener failure on ${eventName}:`, err);
      }
    });
  }
}

export const eventBus = new DomainEventBus();
export { DomainEvents };
