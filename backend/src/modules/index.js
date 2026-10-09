import { identityRoutes, identityService } from './identity/index.js';
import { templeRoutes, templeService } from './temple/index.js';
import { pujaRoutes, pujaService } from './puja/index.js';
import { prasadRoutes, prasadService } from './prasad/index.js';
import { bookingRoutes, bookingService, registerBookingEventSubscribers } from './booking/index.js';
import { orderRoutes, orderService, registerOrderEventSubscribers } from './order/index.js';
import { paymentRoutes, paymentService } from './payment/index.js';
import { refundRoutes, refundService } from './refund/index.js';
import { adminRoutes, adminService } from './admin/index.js';

/**
 * Manifest of all domain chunks in the Shiri Mandir Modular Monolith (Modulith)
 */
export const ModulithManifest = [
  { name: 'identity', mountPath: '/api/auth', description: 'Devotee Authentication, JWT, and Consent Management' },
  { name: 'temple', mountPath: '/api/temples', description: 'Temple Registrations, Affiliation Proof, and Deities' },
  { name: 'puja', mountPath: '/api/pujas', description: 'Spiritual Puja Offerings, Categories, and Packages' },
  { name: 'prasad', mountPath: '/api/prasad', description: 'Sacred Prasad Store, FSSAI Legal Compliance, and Stock' },
  { name: 'booking', mountPath: '/api/bookings', description: 'Puja Seva Bookings, Sankalp, and Priest Proof Media' },
  { name: 'order', mountPath: '/api/orders', description: 'Prasad Orders, Zero Hidden Fees, and Inventory Deduction' },
  { name: 'payment', mountPath: '/api/payments', description: 'Payment Sessions and Cryptographic HMAC SHA-256 Webhooks' },
  { name: 'refund', mountPath: '/api/refunds', description: 'Transparent Cancellation Policies and Automated Refund Math' },
  { name: 'admin', mountPath: '/api/admin', description: 'Platform Governance, Compliance Metrics, and Refund Audits' }
];

/**
 * Register all Modulith Domain Modules onto the Express application
 * @param {import('express').Express} app
 */
export function registerModules(app) {
  console.log('[MODULITH] Bootstrapping domain modules and event bus subscriptions...');

  // 1. Initialize Inter-Module Event Subscribers
  registerBookingEventSubscribers();
  registerOrderEventSubscribers();

  // 2. Mount Module Routers
  app.use('/api/auth', identityRoutes);
  app.use('/api/temples', templeRoutes);
  app.use('/api/pujas', pujaRoutes);
  app.use('/api/prasad', prasadRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/refunds', refundRoutes);
  app.use('/api/admin', adminRoutes);

  console.log(`[MODULITH] Successfully mounted ${ModulithManifest.length} cohesive domain modules.`);
}

export {
  identityService,
  templeService,
  pujaService,
  prasadService,
  bookingService,
  orderService,
  paymentService,
  refundService,
  adminService
};
