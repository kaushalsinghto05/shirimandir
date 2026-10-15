import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { runMigrations } from '../../src/lib/db/migrate';
import { getDb, withTenantContext, closeDb } from '../../src/lib/db';
import { sql, eq, and } from 'drizzle-orm';
import {
  tenants,
  temples,
  pujaSlots,
  bookings,
  donations,
  receipts,
  payments,
  auditLogs,
  reconciliationExceptions,
  refunds,
} from '../../src/lib/db/schema';
import { AuthService } from '../../src/modules/identity/auth.service';
import { TenantService } from '../../src/modules/tenants/tenant.service';
import { PujaService } from '../../src/modules/pujas/puja.service';
import { BookingService } from '../../src/modules/bookings/booking.service';
import { DonationService } from '../../src/modules/donations/donation.service';
import { ReceiptService } from '../../src/modules/receipts/receipt.service';
import { PaymentService } from '../../src/modules/payments/payment.service';
import { MockPaymentAdapter } from '../../src/lib/payments/mock.adapter';
import { ReportService } from '../../src/modules/reports/report.service';
import { DomainService } from '../../src/modules/domains/domain.service';

describe('Comprehensive Acceptance Matrix Suite (AT-01 to AT-12)', () => {
  let adminUser: any;
  let devoteeA: any;
  let devoteeB: any;
  let tenantA: any;
  let tenantB: any;
  let templeA: any;
  let templeB: any;
  let pujaA: any;
  let singleCapacitySlot: any;
  let multiCapacitySlot: any;
  let campaignA: any;
  const WEBHOOK_SECRET = 'test_webhook_secret_key_123';

  before(async () => {
    await runMigrations();

    // 1. Create Platform Admin
    const adminReg = await AuthService.register({
      email: `platform_admin_${Date.now()}@shirimandir.org`,
      password: 'AdminPassword123!',
      name: 'System Admin',
      platformRole: 'platform_super_admin',
    });
    adminUser = adminReg.user;

    // 2. Create Devotee A and Devotee B
    const devAReg = await AuthService.register({
      email: `devotee_a_${Date.now()}@test.org`,
      password: 'Password123!',
      name: 'Devotee Arjun',
    });
    devoteeA = devAReg.user;

    const devBReg = await AuthService.register({
      email: `devotee_b_${Date.now()}@test.org`,
      password: 'Password123!',
      name: 'Devotee Bheem',
    });
    devoteeB = devBReg.user;

    // 3. Create Tenant A and Tenant B
    tenantA = await TenantService.createTenant({
      slug: `tenant-a-${Date.now()}`,
      name: 'Trimbakeshwar Trust',
      actorUserId: adminUser.id,
      actorRole: adminUser.platformRole,
    });
    await TenantService.updateTenantStatus({
      tenantId: tenantA.id,
      status: 'active',
      actorUserId: adminUser.id,
      actorRole: adminUser.platformRole,
    });

    tenantB = await TenantService.createTenant({
      slug: `tenant-b-${Date.now()}`,
      name: 'Mahakaleshwar Trust',
      actorUserId: adminUser.id,
      actorRole: adminUser.platformRole,
    });
    await TenantService.updateTenantStatus({
      tenantId: tenantB.id,
      status: 'active',
      actorUserId: adminUser.id,
      actorRole: adminUser.platformRole,
    });

    // 4. Create Temple in Tenant A and Temple in Tenant B
    templeA = await TenantService.createTemple({
      tenantId: tenantA.id,
      slug: 'main-temple',
      name: 'Trimbakeshwar Main Mandir',
      address: 'Nashik, Maharashtra',
      timezone: 'Asia/Kolkata',
      contactEmail: 'contact@trimbak.org',
      contactPhone: '9123456789',
      actorUserId: adminUser.id,
      actorRole: adminUser.platformRole,
    });
    await TenantService.updateTemple(
      tenantA.id,
      templeA.id,
      { status: 'published' },
      adminUser.id,
      adminUser.platformRole
    );

    templeB = await TenantService.createTemple({
      tenantId: tenantB.id,
      slug: 'main-temple',
      name: 'Mahakaleshwar Jyotirlinga',
      address: 'Ujjain, MP',
      timezone: 'Asia/Kolkata',
      contactEmail: 'contact@mahakal.org',
      contactPhone: '9123456780',
      actorUserId: adminUser.id,
      actorRole: adminUser.platformRole,
    });
    await TenantService.updateTemple(
      tenantB.id,
      templeB.id,
      { status: 'published' },
      adminUser.id,
      adminUser.platformRole
    );

    // 5. Create Puja in Temple A
    pujaA = await PujaService.createPuja({
      tenantId: tenantA.id,
      templeId: templeA.id,
      name: 'Rudrabhishek Puja',
      description: 'Sacred Rudra Abhishek with holy Ganga water and milk',
      durationMinutes: 45,
      priceMinor: 51000, // 510 INR
      currency: 'INR',
      actorUserId: adminUser.id,
      actorRole: adminUser.platformRole,
    });
    await PujaService.setPujaStatus(
      tenantA.id,
      templeA.id,
      pujaA.id,
      'published',
      adminUser.id,
      adminUser.platformRole
    );

    // 6. Create Slots: one with capacity = 1 for race condition test, one multi-capacity
    singleCapacitySlot = await PujaService.createSlot({
      tenantId: tenantA.id,
      templeId: templeA.id,
      pujaId: pujaA.id,
      slotDate: '2026-11-01',
      startTime: '08:00:00',
      endTime: '09:00:00',
      totalCapacity: 1,
      actorUserId: adminUser.id,
      actorRole: adminUser.platformRole,
    });

    multiCapacitySlot = await PujaService.createSlot({
      tenantId: tenantA.id,
      templeId: templeA.id,
      pujaId: pujaA.id,
      slotDate: '2026-11-01',
      startTime: '10:00:00',
      endTime: '11:00:00',
      totalCapacity: 50,
      actorUserId: adminUser.id,
      actorRole: adminUser.platformRole,
    });

    // 7. Create Donation Campaign in Temple A
    campaignA = await DonationService.createCampaign({
      tenantId: tenantA.id,
      templeId: templeA.id,
      name: 'Annakshetra Daily Bhandara',
      description: 'Food offering seva for pilgrims and devotees',
      legalEntityName: 'Shree Trimbakeshwar Sansthan Charitable Trust',
      minAmountMinor: 10000, // 100 INR
      currency: 'INR',
      taxExemptEligible: true,
      taxExemptionRef: '80G-DEL-2026-1198',
      actorUserId: adminUser.id,
      actorRole: adminUser.platformRole,
    });
    await DonationService.setCampaignStatus(
      tenantA.id,
      campaignA.id,
      'published',
      adminUser.id,
      adminUser.platformRole
    );
  });

  after(async () => {
    await closeDb();
  });

  // --------------------------------------------------------------------------
  // AT-01: CROSS-TENANT ACCESS RESTRICTION
  // --------------------------------------------------------------------------
  test('AT-01: Tenant A admin requests Tenant B resource by ID -> Access denied', async () => {
    const crossAccess = await TenantService.getTemple(tenantA.id, templeB.id);
    assert.equal(crossAccess, null, 'Tenant A must not be able to read Tenant B resources');
  });

  // --------------------------------------------------------------------------
  // AT-02: CONCURRENT BOOKING AGAINST FINAL SEAT (PREVENTS OVERSELLING)
  // --------------------------------------------------------------------------
  test('AT-02: Two devotees book the final seat simultaneously -> Only available capacity is confirmed; no overselling', async () => {
    // Attempt 10 concurrent reservations for slot with capacity = 1
    const attempts = Array.from({ length: 10 }).map((_, idx) =>
      BookingService.reserveSlot({
        tenantId: tenantA.id,
        templeId: templeA.id,
        pujaId: pujaA.id,
        slotId: singleCapacitySlot.id,
        participantCount: 1,
        devoteeName: `Concurrent Devotee ${idx}`,
        devoteeEmail: `devotee_${idx}@test.org`,
        devoteePhone: '9876543210',
      }).catch((err) => ({ error: err.message }))
    );

    const results = await Promise.all(attempts);
    const successfulReservations = results.filter((r: any) => !r.error && r.id);
    const failedAttempts = results.filter((r: any) => r.error);

    assert.equal(
      successfulReservations.length,
      1,
      'Exactly 1 reservation must succeed on slot with capacity = 1'
    );
    assert.equal(
      failedAttempts.length,
      9,
      'Remaining 9 concurrent requests must be rejected with capacity error'
    );

    // Verify slot booked_capacity in DB equals total_capacity (never exceeded!)
    const { db } = await getDb();
    const [slotRecord] = await db
      .select()
      .from(pujaSlots)
      .where(eq(pujaSlots.id, singleCapacitySlot.id))
      .limit(1);

    assert.equal(slotRecord.bookedCapacity, 1);
    assert.equal(slotRecord.totalCapacity, 1);
  });

  // --------------------------------------------------------------------------
  // AT-03: BROWSER RETURN PAGE DOES NOT TREAT REDIRECT AS PROOF OF PAYMENT
  // --------------------------------------------------------------------------
  test('AT-03: Browser return page reports payment success without provider confirmation -> Booking remains unconfirmed', async () => {
    // 1. Reserve slot
    const booking = await BookingService.reserveSlot({
      tenantId: tenantA.id,
      templeId: templeA.id,
      pujaId: pujaA.id,
      slotId: multiCapacitySlot.id,
      participantCount: 1,
      devoteeUserId: devoteeA.id,
      devoteeName: devoteeA.name,
      devoteeEmail: devoteeA.email,
      devoteePhone: '9876543210',
    });

    // 2. Create payment attempt
    const paymentRes = await PaymentService.createPaymentAttempt({
      tenantId: tenantA.id,
      templeId: templeA.id,
      payableType: 'booking',
      payableId: booking.id,
      amountMinor: booking.priceSnapshotMinor,
      currency: booking.currency,
      donorOrDevotee: { name: devoteeA.name, email: devoteeA.email },
      returnUrl: 'https://mandir.org/return',
    });

    // 3. User navigates to return page without webhook arrived yet
    const returnCheck = await PaymentService.checkReturnStatus(paymentRes.payment.id);
    assert.equal(returnCheck.isVerified, false, 'Redirect return page must not verify payment');
    assert.equal(returnCheck.status, 'pending');

    // 4. Verify booking is still pending_payment
    const { db } = await getDb();
    const [bRecord] = await db.select().from(bookings).where(eq(bookings.id, booking.id)).limit(1);
    assert.equal(bRecord.status, 'pending_payment');
  });

  // --------------------------------------------------------------------------
  // AT-04: WEBHOOK DEDUPLICATION & IDEMPOTENCY
  // --------------------------------------------------------------------------
  test('AT-04: Provider delivers same successful webhook twice -> One payment effect, one confirmation, no duplicate receipt', async () => {
    // 1. Reserve a booking
    const booking = await BookingService.reserveSlot({
      tenantId: tenantA.id,
      templeId: templeA.id,
      pujaId: pujaA.id,
      slotId: multiCapacitySlot.id,
      participantCount: 2,
      devoteeUserId: devoteeA.id,
      devoteeName: devoteeA.name,
      devoteeEmail: devoteeA.email,
      devoteePhone: '9876543210',
    });

    const paymentRes = await PaymentService.createPaymentAttempt({
      tenantId: tenantA.id,
      templeId: templeA.id,
      payableType: 'booking',
      payableId: booking.id,
      amountMinor: booking.priceSnapshotMinor,
      currency: booking.currency,
      donorOrDevotee: { name: devoteeA.name, email: devoteeA.email },
      returnUrl: 'https://mandir.org/return',
    });

    const orderId = paymentRes.payment.providerOrderId;
    const webhookPayload = {
      event_id: `evt_idempotent_${Date.now()}`,
      event_type: 'payment.succeeded',
      order_id: orderId,
      payment_id: `pay_${Date.now()}`,
      amount_minor: booking.priceSnapshotMinor,
      currency: booking.currency,
    };

    const { body, signature } = MockPaymentAdapter.generateSignedWebhook(
      webhookPayload,
      WEBHOOK_SECRET
    );

    // Delivery 1: Should process and confirm booking
    const res1 = await PaymentService.handleWebhook({
      provider: 'mock',
      rawBody: body,
      signature,
      webhookSecret: WEBHOOK_SECRET,
    });
    assert.equal(res1.status, 'processed');

    const { db } = await getDb();
    const [confirmedBooking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, booking.id))
      .limit(1);
    assert.equal(confirmedBooking.status, 'confirmed');

    // Delivery 2: Identical webhook delivery (duplicate)
    const res2 = await PaymentService.handleWebhook({
      provider: 'mock',
      rawBody: body,
      signature,
      webhookSecret: WEBHOOK_SECRET,
    });
    assert.equal(res2.status, 'duplicate_ignored', 'Duplicate delivery must be safely ignored');
  });

  // --------------------------------------------------------------------------
  // AT-05: SIGNED WEBHOOK WITH MISMATCHED AMOUNT OR CURRENCY
  // --------------------------------------------------------------------------
  test('AT-05: Signed webhook has mismatched amount or currency -> Quarantined in reconciliation_exceptions; not marked paid', async () => {
    const booking = await BookingService.reserveSlot({
      tenantId: tenantA.id,
      templeId: templeA.id,
      pujaId: pujaA.id,
      slotId: multiCapacitySlot.id,
      participantCount: 1,
      devoteeUserId: devoteeA.id,
      devoteeName: devoteeA.name,
      devoteeEmail: devoteeA.email,
      devoteePhone: '9876543210',
    });

    const paymentRes = await PaymentService.createPaymentAttempt({
      tenantId: tenantA.id,
      templeId: templeA.id,
      payableType: 'booking',
      payableId: booking.id,
      amountMinor: booking.priceSnapshotMinor, // e.g. 51000
      currency: 'INR',
      donorOrDevotee: { name: devoteeA.name, email: devoteeA.email },
      returnUrl: 'https://mandir.org/return',
    });

    // Tampered payload: claims amount is 100 paise instead of 51000 paise
    const tamperedPayload = {
      event_id: `evt_tampered_${Date.now()}`,
      event_type: 'payment.succeeded',
      order_id: paymentRes.payment.providerOrderId,
      payment_id: `pay_tampered_${Date.now()}`,
      amount_minor: 100, // Mismatched!
      currency: 'INR',
    };

    const { body, signature } = MockPaymentAdapter.generateSignedWebhook(
      tamperedPayload,
      WEBHOOK_SECRET
    );

    const res = await PaymentService.handleWebhook({
      provider: 'mock',
      rawBody: body,
      signature,
      webhookSecret: WEBHOOK_SECRET,
    });

    assert.equal(res.status, 'quarantined');

    // Check payment record status
    const { db } = await getDb();
    const [pRecord] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentRes.payment.id))
      .limit(1);
    assert.equal(pRecord.status, 'reconciliation_required');

    // Booking must NOT be marked confirmed
    const [bRecord] = await db.select().from(bookings).where(eq(bookings.id, booking.id)).limit(1);
    assert.equal(bRecord.status, 'pending_payment');

    // Reconciliation exception recorded
    const [exception] = await db
      .select()
      .from(reconciliationExceptions)
      .where(eq(reconciliationExceptions.internalReference, paymentRes.payment.id))
      .limit(1);
    assert.ok(exception);
    assert.equal(exception.exceptionType, 'amount_mismatch');
  });

  // --------------------------------------------------------------------------
  // AT-06: PAYMENT SUCCEEDS AFTER RESERVATION EXPIRES
  // --------------------------------------------------------------------------
  test('AT-06: Payment succeeds after reservation expires -> Defined exception handling runs; no silent overbooking', async () => {
    const booking = await BookingService.reserveSlot({
      tenantId: tenantA.id,
      templeId: templeA.id,
      pujaId: pujaA.id,
      slotId: multiCapacitySlot.id,
      participantCount: 1,
      devoteeUserId: devoteeA.id,
      devoteeName: devoteeA.name,
      devoteeEmail: devoteeA.email,
      devoteePhone: '9876543210',
    });

    const paymentRes = await PaymentService.createPaymentAttempt({
      tenantId: tenantA.id,
      templeId: templeA.id,
      payableType: 'booking',
      payableId: booking.id,
      amountMinor: booking.priceSnapshotMinor,
      currency: 'INR',
      donorOrDevotee: { name: devoteeA.name, email: devoteeA.email },
      returnUrl: 'https://mandir.org/return',
    });

    // Manually simulate expiration of booking (e.g. 10 minutes elapsed)
    const { db } = await getDb();
    await db
      .update(bookings)
      .set({
        status: 'expired',
        expiresAt: new Date(Date.now() - 60000), // 1 min ago
      })
      .where(eq(bookings.id, booking.id));

    // Release capacity as the reaper would
    await db.execute(
      sql`UPDATE puja_slots SET booked_capacity = booked_capacity - 1 WHERE id = ${multiCapacitySlot.id}`
    );

    // Late payment arrives via webhook
    const lateWebhook = {
      event_id: `evt_late_${Date.now()}`,
      event_type: 'payment.succeeded',
      order_id: paymentRes.payment.providerOrderId,
      payment_id: `pay_late_${Date.now()}`,
      amount_minor: booking.priceSnapshotMinor,
      currency: 'INR',
    };

    const { body, signature } = MockPaymentAdapter.generateSignedWebhook(
      lateWebhook,
      WEBHOOK_SECRET
    );

    await PaymentService.handleWebhook({
      provider: 'mock',
      rawBody: body,
      signature,
      webhookSecret: WEBHOOK_SECRET,
    });

    // Booking must NOT be resurrected into confirmed
    const [finalBooking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, booking.id))
      .limit(1);
    assert.equal(finalBooking.status, 'expired', 'Expired booking must not be resurrected');

    // Refund must be initiated and recorded
    const [refund] = await db
      .select()
      .from(refunds)
      .where(eq(refunds.paymentId, paymentRes.payment.id))
      .limit(1);
    assert.ok(refund, 'Late payment must generate a refund record');
    assert.equal(refund.status, 'pending');
  });

  // --------------------------------------------------------------------------
  // AT-07: DEVOTEE REQUESTS ANOTHER USER'S RECORD
  // --------------------------------------------------------------------------
  test('AT-07: Devotee A cannot request Devotee B booking or receipt -> Access denied', async () => {
    // Devotee A makes a donation and gets a receipt
    const donationA = await DonationService.createDonation({
      tenantId: tenantA.id,
      templeId: templeA.id,
      campaignId: campaignA.id,
      amountMinor: 20000, // 200 INR
      devoteeUserId: devoteeA.id,
      donorName: devoteeA.name,
      donorEmail: devoteeA.email,
    });

    const paidResult = await DonationService.markDonationPaid(
      donationA.id,
      `pay_manual_${Date.now()}`
    );
    const receiptA = paidResult.receipt;

    // Devotee B attempts to fetch Devotee A's receipt -> Must return null / access denied
    const crossReceipt = await ReceiptService.getDevoteeReceipt(devoteeB.id, receiptA.id);
    assert.equal(crossReceipt, null, 'Devotee B must not access Devotee A receipt');

    // Devotee A CAN access their own receipt
    const ownReceipt = await ReceiptService.getDevoteeReceipt(devoteeA.id, receiptA.id);
    assert.ok(ownReceipt);
    assert.equal(ownReceipt.id, receiptA.id);
  });

  // --------------------------------------------------------------------------
  // AT-08: UNAUTHORIZED STAFF ATTEMPTS TO ISSUE REFUND
  // --------------------------------------------------------------------------
  test('AT-08: Unauthorized staff member (priest) tries to issue a refund -> Request is denied and logged', async () => {
    // Register priest user
    const priestReg = await AuthService.register({
      email: `priest_${Date.now()}@test.org`,
      password: 'PriestPassword123!',
      name: 'Priest Shastri',
    });

    await assert.rejects(
      () =>
        PaymentService.requestRefund({
          tenantId: tenantA.id,
          paymentId: '00000000-0000-0000-0000-000000000000',
          amountMinor: 10000,
          reason: 'Unauthorized refund',
          actorUserId: priestReg.user.id,
          actorRole: 'priest',
        }),
      /Access denied: Unauthorized to issue refunds/i
    );

    // Verify unauthorized attempt logged to audit trail (AT-08)
    const { db } = await getDb();
    const [log] = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.actorUserId, priestReg.user.id),
          eq(auditLogs.action, 'refund.unauthorized_attempt')
        )
      )
      .limit(1);

    assert.ok(log, 'Unauthorized refund attempt must be recorded in audit log');
  });

  // --------------------------------------------------------------------------
  // AT-09: UNVERIFIED CUSTOM DOMAIN CANNOT BECOME ACTIVE (FR-TEN-006, FR-WL-005, AT-09)
  // --------------------------------------------------------------------------
  test('AT-09: Tenant custom domain is not verified -> Domain cannot become active', async () => {
    // 1. Request custom domain
    const requested = await DomainService.requestDomain({
      tenantId: tenantA.id,
      templeId: templeA.id,
      domain: 'darshan.trimbakeshwar.org',
    });
    assert.equal(requested.status, 'pending_verification');
    assert.equal(requested.tlsStatus, 'pending');

    // 2. Attempt activation before verification -> must be rejected
    await assert.rejects(
      async () => {
        await DomainService.activateDomain(tenantA.id, requested.id);
      },
      (err: any) => {
        assert.match(err.message, /Cannot activate domain/);
        return true;
      },
      'Unverified custom domain must not be activatable'
    );

    // 3. Verify domain via DNS check
    const verified = await DomainService.verifyDomain(tenantA.id, requested.id, true);
    assert.equal(verified.status, 'verified');
    assert.equal(verified.tlsStatus, 'issued');

    // 4. Activate domain after verification
    const activated = await DomainService.activateDomain(tenantA.id, requested.id);
    assert.equal(activated.status, 'active');

    // 5. White-label resolution
    const resolved = await DomainService.resolveTempleByDomain('darshan.trimbakeshwar.org');
    assert.ok(resolved);
    assert.equal(resolved?.id, templeA.id);
  });

  // --------------------------------------------------------------------------
  // AT-10: DONATION PAYMENT IS VERIFIED -> RECEIPT ISSUED UNDER CORRECT ENTITY
  // --------------------------------------------------------------------------
  test('AT-10: A donation payment is verified -> Donation is recorded, receipt is issued under the correct entity and reports update', async () => {
    const donation = await DonationService.createDonation({
      tenantId: tenantA.id,
      templeId: templeA.id,
      campaignId: campaignA.id,
      amountMinor: 100000, // 1000 INR
      devoteeUserId: devoteeA.id,
      donorName: devoteeA.name,
      donorEmail: devoteeA.email,
    });

    const paymentRes = await PaymentService.createPaymentAttempt({
      tenantId: tenantA.id,
      templeId: templeA.id,
      payableType: 'donation',
      payableId: donation.id,
      amountMinor: 100000,
      currency: 'INR',
      donorOrDevotee: { name: devoteeA.name, email: devoteeA.email },
      returnUrl: 'https://mandir.org/return',
    });

    const webhook = {
      event_id: `evt_don_${Date.now()}`,
      event_type: 'payment.succeeded',
      order_id: paymentRes.payment.providerOrderId,
      payment_id: `pay_don_${Date.now()}`,
      amount_minor: 100000,
      currency: 'INR',
    };

    const { body, signature } = MockPaymentAdapter.generateSignedWebhook(webhook, WEBHOOK_SECRET);

    await PaymentService.handleWebhook({
      provider: 'mock',
      rawBody: body,
      signature,
      webhookSecret: WEBHOOK_SECRET,
      onPaymentSuccess: async (p) => {
        await DonationService.markDonationPaid(p.payableId, p.id);
      },
    });

    // Check donation is paid
    const { db } = await getDb();
    const [paidDonation] = await db
      .select()
      .from(donations)
      .where(eq(donations.id, donation.id))
      .limit(1);
    assert.equal(paidDonation.status, 'paid');

    // Check receipt exists and identifies verified legal entity name
    const [receipt] = await db
      .select()
      .from(receipts)
      .where(eq(receipts.donationId, donation.id))
      .limit(1);
    assert.ok(receipt);
    assert.equal(receipt.issuingLegalEntity, 'Shree Trimbakeshwar Sansthan Charitable Trust');
    assert.match(receipt.receiptNumber, /^RCP-TENANT-A-.*-00000\d$/);

    // Verify finance report reflects donation
    const financeSummary = await ReportService.getFinanceSummary(tenantA.id);
    assert.ok(financeSummary.grossCollectionsMinor >= 100000);
  });

  // --------------------------------------------------------------------------
  // AT-11: DATABASE CONNECTION REUSE AFTER TENANT TRANSACTION
  // --------------------------------------------------------------------------
  test('AT-11: Database connection is reused after tenant-scoped transaction -> No previous tenant context leaks', async () => {
    const { db } = await getDb();
    const tenantContextId = '33333333-3333-4333-a333-333333333333';

    await withTenantContext(tenantContextId, async (tx) => {
      const res = await tx.execute(
        sql`SELECT current_setting('app.current_tenant_id', true) AS current_tenant`
      );
      const rows = res.rows || res;
      assert.equal(rows[0].current_tenant, tenantContextId);
    });

    // Clean connection check outside transaction
    const res = await db.execute(
      sql`SELECT current_setting('app.current_tenant_id', true) AS current_tenant`
    );
    const rows = res.rows || res;
    assert.ok(!rows[0]?.current_tenant || rows[0]?.current_tenant === '');
  });

  // --------------------------------------------------------------------------
  // AT-12: FINANCIAL RECORD IS CORRECTED OR VOIDED -> AUDITABLE LINEAGE
  // --------------------------------------------------------------------------
  test('AT-12: A financial record is corrected or voided -> Original history remains auditable and correction is attributable', async () => {
    // 1. Create a donation and issue a test receipt
    const donationForReceipt = await DonationService.createDonation({
      tenantId: tenantA.id,
      templeId: templeA.id,
      campaignId: campaignA.id,
      amountMinor: 50000,
      devoteeUserId: devoteeA.id,
      donorName: devoteeA.name,
      donorEmail: devoteeA.email,
    });

    const receipt = await ReceiptService.issueReceipt({
      tenantId: tenantA.id,
      templeId: templeA.id,
      donationId: donationForReceipt.id,
      issuingLegalEntity: 'Shree Trimbakeshwar Sansthan Charitable Trust',
      amountMinor: 50000,
      currency: 'INR',
    });

    // 2. Void receipt
    const voided = await ReceiptService.voidReceipt({
      tenantId: tenantA.id,
      receiptId: receipt.id,
      voidReason: 'Cheque bounced / Donor requested cancellation',
      actorUserId: adminUser.id,
      actorRole: 'temple_accountant',
    });

    assert.equal(voided.status, 'voided');
    assert.equal(voided.voidReason, 'Cheque bounced / Donor requested cancellation');

    // 3. Verify audit log entry
    const { db } = await getDb();
    const [auditEntry] = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.resourceId, receipt.id), eq(auditLogs.action, 'receipt.voided')))
      .limit(1);

    assert.ok(auditEntry);
    assert.equal(auditEntry.actorUserId, adminUser.id);
    assert.equal(auditEntry.actorRole, 'temple_accountant');
    assert.equal(
      (auditEntry.changeSummary as any).voidReason,
      'Cheque bounced / Donor requested cancellation'
    );
  });
});
