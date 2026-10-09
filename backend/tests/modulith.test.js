import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ModulithManifest,
  identityService,
  templeService,
  pujaService,
  prasadService,
  bookingService,
  orderService,
  paymentService,
  refundService,
  adminService
} from '../src/modules/index.js';
import { eventBus, DomainEvents } from '../src/core/events/eventBus.js';

test('Shiri Mandir Modulith Architecture Verification Suite', async (t) => {
  await t.test('Modulith Chunk Verification: All 9 domain modules are registered in manifest', () => {
    const expectedModules = [
      'identity',
      'temple',
      'puja',
      'prasad',
      'booking',
      'order',
      'payment',
      'refund',
      'admin'
    ];

    assert.equal(ModulithManifest.length, 9, 'Should have exactly 9 domain modules');
    expectedModules.forEach(modName => {
      const found = ModulithManifest.find(m => m.name === modName);
      assert.ok(found, `Module ${modName} must be declared in ModulithManifest`);
      assert.ok(found.mountPath.startsWith('/api/'), `Module ${modName} mount path must be valid API route`);
    });
  });

  await t.test('Domain Services Integrity: Each module encapsulates domain logic', () => {
    assert.ok(typeof identityService.registerUser === 'function', 'identityService has registerUser');
    assert.ok(typeof templeService.getTemples === 'function', 'templeService has getTemples');
    assert.ok(typeof pujaService.getPujas === 'function', 'pujaService has getPujas');
    assert.ok(typeof prasadService.getPrasadItems === 'function', 'prasadService has getPrasadItems');
    assert.ok(typeof bookingService.createBooking === 'function', 'bookingService has createBooking');
    assert.ok(typeof orderService.createOrder === 'function', 'orderService has createOrder');
    assert.ok(typeof paymentService.createIntent === 'function', 'paymentService has createIntent');
    assert.ok(typeof refundService.createRefundRequest === 'function', 'refundService has createRefundRequest');
    assert.ok(typeof adminService.getDashboardMetrics === 'function', 'adminService has getDashboardMetrics');
  });

  await t.test('Domain Event Bus: Decoupled events publish and receive safely', async () => {
    let eventReceived = false;
    let receivedPayload = null;

    eventBus.subscribe('test.modulith.event', (data) => {
      eventReceived = true;
      receivedPayload = data;
    });

    eventBus.publish('test.modulith.event', { sampleId: 42, module: 'test' });

    // Wait for setImmediate dispatch
    await new Promise(resolve => setTimeout(resolve, 50));

    assert.ok(eventReceived, 'Event subscriber should receive published event');
    assert.equal(receivedPayload.sampleId, 42, 'Event payload should match');
    assert.ok(receivedPayload._publishedAt, 'Event bus attaches publish timestamp');
  });
});
