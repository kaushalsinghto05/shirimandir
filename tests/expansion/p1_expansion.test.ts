import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { runMigrations } from '../../src/lib/db/migrate';
import { getDb, closeDb } from '../../src/lib/db';
import { AuthService } from '../../src/modules/identity/auth.service';
import { TenantService } from '../../src/modules/tenants/tenant.service';
import { PujaService } from '../../src/modules/pujas/puja.service';
import { DonationService } from '../../src/modules/donations/donation.service';
import { DomainService } from '../../src/modules/domains/domain.service';
import { ReportService } from '../../src/modules/reports/report.service';

describe('Phase P1 Expansion Features Test Suite', () => {
  let adminUser: any;
  let tenant: any;
  let temple1: any;
  let temple2: any;
  let puja: any;

  before(async () => {
    await runMigrations();

    // 1. Create Platform Admin
    adminUser = await AuthService.register({
      email: `p1_admin_${Date.now()}@platform.org`,
      password: 'PlatformAdminPass123!',
      name: 'P1 Super Admin',
      phone: '+919999000111',
      platformRole: 'platform_super_admin',
    });

    // 2. Create Tenant (Religious Trust)
    tenant = await TenantService.createTenant({
      name: 'Shree Mahakaleshwar Jyotirlinga Trust',
      slug: `mahakal-trust-${Date.now()}`,
      actorUserId: adminUser.id,
      actorRole: 'platform_super_admin',
    });
    await TenantService.updateTenantStatus({
      tenantId: tenant.id,
      status: 'active',
      actorUserId: adminUser.id,
      actorRole: 'platform_super_admin',
    });

    // 3. Create Temple 1 (Main Sanctum)
    temple1 = await TenantService.createTemple({
      tenantId: tenant.id,
      name: 'Mahakaleshwar Main Temple',
      slug: 'main-sanctum',
      address: 'Jaisinghpura, Ujjain, Madhya Pradesh 456006',
      timezone: 'Asia/Kolkata',
      contactEmail: 'darshan@mahakal.org',
      contactPhone: '+917342550563',
      actorUserId: adminUser.id,
      actorRole: 'platform_super_admin',
    });

    // 4. Create Temple 2 (Omkareshwar Branch)
    temple2 = await TenantService.createTemple({
      tenantId: tenant.id,
      name: 'Omkareshwar Branch Temple',
      slug: 'omkareshwar-branch',
      address: 'Mandhata Island, Khandwa, Madhya Pradesh 450554',
      timezone: 'Asia/Kolkata',
      contactEmail: 'contact@omkareshwar.org',
      contactPhone: '+917328273125',
      actorUserId: adminUser.id,
      actorRole: 'platform_super_admin',
    });

    // 5. Create Puja Service
    puja = await PujaService.createPuja({
      tenantId: tenant.id,
      templeId: temple1.id,
      name: 'Bhasma Aarti Darshan',
      durationMinutes: 90,
      priceMinor: 25000, // 250 INR
      actorUserId: adminUser.id,
      actorRole: 'platform_super_admin',
    });
    await PujaService.setPujaStatus(
      tenant.id,
      temple1.id,
      puja.id,
      'published',
      adminUser.id,
      'platform_super_admin'
    );
  });

  after(async () => {
    await closeDb();
  });

  // --------------------------------------------------------------------------
  // 1. CUSTOM DOMAINS LIFECYCLE (FR-TEN-006, FR-WL-005, AT-09)
  // --------------------------------------------------------------------------
  describe('Custom Domain Lifecycle & TLS Guarantees (FR-TEN-006, FR-WL-005)', () => {
    let domainRecord: any;

    test('Request custom domain creates record with pending verification token', async () => {
      domainRecord = await DomainService.requestDomain({
        tenantId: tenant.id,
        templeId: temple1.id,
        domain: `darshan-${Date.now()}.mahakaltrust.in`,
        verificationType: 'cname',
      });

      assert.ok(domainRecord.id);
      assert.equal(domainRecord.status, 'pending_verification');
      assert.equal(domainRecord.tlsStatus, 'pending');
      assert.ok(domainRecord.verificationToken.startsWith('shirimandir-verify-'));
    });

    test('Activation rejected when domain is not yet verified (AT-09)', async () => {
      await assert.rejects(
        async () => {
          await DomainService.activateDomain(tenant.id, domainRecord.id);
        },
        (err: any) => {
          assert.match(err.message, /Verification must be completed first/);
          return true;
        }
      );
    });

    test('Verification fails if DNS records do not resolve', async () => {
      await assert.rejects(
        async () => {
          await DomainService.verifyDomain(tenant.id, domainRecord.id, false);
        },
        (err: any) => {
          assert.match(err.message, /DNS verification check failed/);
          return true;
        }
      );
    });

    test('Verification succeeds on valid DNS, provisions TLS, and allows activation', async () => {
      const verified = await DomainService.verifyDomain(tenant.id, domainRecord.id, true);
      assert.equal(verified.status, 'verified');
      assert.equal(verified.tlsStatus, 'issued');

      const activated = await DomainService.activateDomain(tenant.id, domainRecord.id);
      assert.equal(activated.status, 'active');

      // Test white-label domain resolution
      const resolvedTemple = await DomainService.resolveTempleByDomain(domainRecord.domain);
      assert.ok(resolvedTemple);
      assert.equal(resolvedTemple?.id, temple1.id);
    });
  });

  // --------------------------------------------------------------------------
  // 2. RECURRING PUJA SCHEDULES & FESTIVAL EXCEPTIONS (FR-PUJA-007)
  // --------------------------------------------------------------------------
  describe('Recurring Schedules & Festival Exceptions (FR-PUJA-007)', () => {
    let schedule: any;

    test('Create daily recurring schedule with capacity limits', async () => {
      schedule = await PujaService.createRecurringSchedule({
        tenantId: tenant.id,
        templeId: temple1.id,
        pujaId: puja.id,
        frequency: 'daily',
        startTime: '04:00:00',
        endTime: '05:30:00',
        capacity: 100,
        startDate: '2026-11-01',
        endDate: '2026-11-07',
        actorUserId: adminUser.id,
        actorRole: 'platform_super_admin',
      });

      assert.ok(schedule.id);
      assert.equal(schedule.frequency, 'daily');
      assert.equal(schedule.capacity, 100);
    });

    test('Create festival exceptions: Maha Shivratri (custom capacity) & Solar Eclipse (closure)', async () => {
      // 1. Exception 1: Maha Shivratri on 2026-11-03 with enhanced capacity of 300
      const shivratri = await PujaService.createFestivalException({
        tenantId: tenant.id,
        templeId: temple1.id,
        pujaId: puja.id,
        festivalName: 'Maha Shivratri Mahotsav',
        exceptionDate: '2026-11-03',
        isClosed: false,
        customCapacity: 300,
        actorUserId: adminUser.id,
        actorRole: 'platform_super_admin',
      });
      assert.equal(shivratri.customCapacity, 300);

      // 2. Exception 2: Grahan Closure on 2026-11-05
      const eclipse = await PujaService.createFestivalException({
        tenantId: tenant.id,
        templeId: temple1.id,
        pujaId: puja.id,
        festivalName: 'Surya Grahan Sutak (Temple Closed)',
        exceptionDate: '2026-11-05',
        isClosed: true,
        actorUserId: adminUser.id,
        actorRole: 'platform_super_admin',
      });
      assert.equal(eclipse.isClosed, true);
    });

    test('Generate slots from recurring schedule accurately applies festival closures and capacity overrides', async () => {
      const generatedSlots = await PujaService.generateSlotsFromRecurring(
        tenant.id,
        temple1.id,
        puja.id,
        schedule.id,
        '2026-11-01',
        '2026-11-07',
        adminUser.id,
        'platform_super_admin'
      );

      // Total days = 7. Day 5 is closed, so 6 slots should be generated.
      assert.equal(generatedSlots.length, 6, 'Must generate exactly 6 slots skipping closed eclipse day');

      // Assert closure on 2026-11-05
      const closedSlot = generatedSlots.find((s) => s.slotDate === '2026-11-05');
      assert.equal(closedSlot, undefined, 'Closed festival date must not generate any slot');

      // Assert custom capacity on 2026-11-03 (Maha Shivratri)
      const shivratriSlot = generatedSlots.find((s) => s.slotDate === '2026-11-03');
      assert.ok(shivratriSlot);
      assert.equal(shivratriSlot?.totalCapacity, 300, 'Festival slot must adopt custom capacity override');

      // Assert regular day (2026-11-01) has normal capacity (100)
      const normalSlot = generatedSlots.find((s) => s.slotDate === '2026-11-01');
      assert.ok(normalSlot);
      assert.equal(normalSlot?.totalCapacity, 100, 'Standard days must retain regular schedule capacity');
    });
  });

  // --------------------------------------------------------------------------
  // 3. CAMPAIGN TARGETS, SCHEDULES & PROGRESS (FR-DON-008)
  // --------------------------------------------------------------------------
  describe('Donation Campaign Targets & Progress Tickers (FR-DON-008)', () => {
    let campaign: any;

    test('Create campaign with target amount and scheduled dates', async () => {
      campaign = await DonationService.createCampaign({
        tenantId: tenant.id,
        templeId: temple1.id,
        name: 'Mahakal Mandir Renovation & Gold Shikhar Seva',
        legalEntityName: 'Shree Mahakaleshwar Mandir Management Committee',
        minAmountMinor: 10000, // 100 INR
        targetAmountMinor: 5000000, // 50,000 INR
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-12-31'),
        currency: 'INR',
        actorUserId: adminUser.id,
        actorRole: 'platform_super_admin',
      });

      assert.equal(campaign.targetAmountMinor, 5000000);
      assert.equal(campaign.collectedAmountMinor, 0);

      // Publish campaign (FR-DON-001)
      await DonationService.setCampaignStatus(
        tenant.id,
        campaign.id,
        'published',
        adminUser.id,
        'platform_super_admin'
      );

      const progress = await DonationService.getCampaignProgress(tenant.id, campaign.id);
      assert.equal(progress.progressPercentage, 0);
      assert.equal(progress.isTargetMet, false);
      assert.equal(progress.isExpired, false);
    });

    test('Verified donation payment increments collected amount and updates progress ticker', async () => {
      const donation = await DonationService.createDonation({
        tenantId: tenant.id,
        templeId: temple1.id,
        campaignId: campaign.id,
        amountMinor: 2500000, // 25,000 INR (50% of target)
        donorName: 'Devotee Rameshwar',
        donorEmail: 'rameshwar@bhakt.org',
      });

      await DonationService.markDonationPaid(donation.id, `pay_${Date.now()}`);

      const progressAfter = await DonationService.getCampaignProgress(tenant.id, campaign.id);
      assert.equal(progressAfter.collectedAmountMinor, 2500000);
      assert.equal(progressAfter.progressPercentage, 50);
      assert.equal(progressAfter.isTargetMet, false);

      // Second donation of 30,000 INR completes and exceeds the 50,000 INR target
      const donation2 = await DonationService.createDonation({
        tenantId: tenant.id,
        templeId: temple1.id,
        campaignId: campaign.id,
        amountMinor: 3000000,
        donorName: 'Devotee Suresh',
        donorEmail: 'suresh@bhakt.org',
      });
      await DonationService.markDonationPaid(donation2.id, `pay2_${Date.now()}`);

      const progressFinal = await DonationService.getCampaignProgress(tenant.id, campaign.id);
      assert.equal(progressFinal.collectedAmountMinor, 5500000);
      assert.equal(progressFinal.progressPercentage, 110);
      assert.equal(progressFinal.isTargetMet, true);
    });
  });

  // --------------------------------------------------------------------------
  // 4. TRUST CONSOLIDATED REPORTING (FR-REP-005)
  // --------------------------------------------------------------------------
  describe('Trust-Level Consolidated Multi-Temple Reporting (FR-REP-005)', () => {
    test('Roll up bookings and donations across multiple branch temples in a trust', async () => {
      // 1. Create a campaign and donation in Temple 2 (Omkareshwar Branch)
      const campaign2 = await DonationService.createCampaign({
        tenantId: tenant.id,
        templeId: temple2.id,
        name: 'Omkareshwar Ghat Preservation',
        legalEntityName: 'Shree Omkareshwar Jyotirlinga Trust',
        minAmountMinor: 5000,
        actorUserId: adminUser.id,
        actorRole: 'platform_super_admin',
      });
      await DonationService.setCampaignStatus(
        tenant.id,
        campaign2.id,
        'published',
        adminUser.id,
        'platform_super_admin'
      );

      const donT2 = await DonationService.createDonation({
        tenantId: tenant.id,
        templeId: temple2.id,
        campaignId: campaign2.id,
        amountMinor: 1000000, // 10,000 INR
        donorName: 'Devotee Ananya',
        donorEmail: 'ananya@pilgrim.org',
      });
      await DonationService.markDonationPaid(donT2.id, `pay_t2_${Date.now()}`);

      // 2. Fetch trust consolidated report
      const consolidated = await ReportService.getTrustConsolidatedReport(tenant.id);

      assert.equal(consolidated.tenantId, tenant.id);
      assert.equal(consolidated.templeCount, 2, 'Trust report must include all 2 registered branch temples');

      // Check breakdown per temple
      const t1 = consolidated.temples.find((t) => t.templeId === temple1.id);
      const t2 = consolidated.temples.find((t) => t.templeId === temple2.id);

      assert.ok(t1);
      assert.ok(t2);
      assert.equal(t1?.donationRevenueMinor, 5500000, 'Temple 1 collected 55,000 INR');
      assert.equal(t2?.donationRevenueMinor, 1000000, 'Temple 2 collected 10,000 INR');

      // Consolidated gross turnover must equal sum of branches
      assert.equal(
        consolidated.consolidated.donationRevenueMinor,
        6500000,
        'Consolidated donations must equal 65,000 INR'
      );
    });
  });

  // --------------------------------------------------------------------------
  // 5. SAAS SUBSCRIPTION BILLING & PLATFORM REVENUE SEPARATION (FR-REP-006, FR-AUD-006)
  // --------------------------------------------------------------------------
  describe('Platform Subscription Revenue & Direct Settlement Separation (FR-REP-006, FR-AUD-006)', () => {
    test('Platform subscription plans and active tenant subscriptions are tracked', async () => {
      // 1. Create SaaS plans
      const proPlan = await ReportService.createSubscriptionPlan({
        name: 'Trust Pro',
        priceMinor: 499900, // 4,999 INR / month
        billingInterval: 'monthly',
        maxTemples: 5,
        maxBookingsPerMonth: 10000,
      });

      // 2. Assign plan to tenant
      const sub = await ReportService.assignTenantSubscription({
        tenantId: tenant.id,
        planId: proPlan.id,
        status: 'active',
      });
      assert.ok(sub.id);
      assert.equal(sub.status, 'active');

      // 3. Platform revenue report
      const platformReport = await ReportService.getPlatformRevenueReport();

      assert.ok(platformReport.platformRevenue.totalSubscriptionRevenueMinor >= 499900);
      assert.ok(platformReport.platformRevenue.activeSubscriptionsCount >= 1);

      // Verify temple collections remain accounted directly and separated
      assert.ok(platformReport.templeCollectionsDirect.totalDonationsMinor >= 6500000);
      assert.ok(
        platformReport.templeCollectionsDirect.note.includes('strictly separated from SaaS platform subscriptions'),
        'Report must provide explicit audit separation disclosure (FR-AUD-006)'
      );
    });
  });
});
