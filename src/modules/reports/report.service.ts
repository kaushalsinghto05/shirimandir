import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../../lib/db';
import {
  bookings,
  donations,
  refunds,
  temples,
  tenants,
  reconciliationExceptions,
  webhookEvents,
  subscriptionPlans,
  tenantSubscriptions,
} from '../../lib/db/schema';

export class ReportService {
  /**
   * Booking dashboard & summary with temple timezone filtering (FR-REP-001, FR-REP-003)
   */
  static async getBookingSummary(params: {
    tenantId: string;
    templeId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { db } = await getDb();

    // 1. Fetch temple to get timezone
    const [temple] = await db
      .select({ timezone: temples.timezone })
      .from(temples)
      .where(and(eq(temples.tenantId, params.tenantId), eq(temples.id, params.templeId)))
      .limit(1);

    const timezone = temple?.timezone || 'Asia/Kolkata';

    // 2. Aggregate booking statuses
    const counts = await db.execute(
      sql`SELECT status, COUNT(*)::int AS count
          FROM bookings
          WHERE tenant_id = ${params.tenantId}
            AND temple_id = ${params.templeId}
          GROUP BY status`
    );

    const rows = counts.rows || counts;
    const summary: Record<string, number> = {
      pending_payment: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      expired: 0,
    };

    for (const r of rows) {
      summary[r.status] = r.count;
    }

    return {
      templeTimezone: timezone,
      summary,
    };
  }

  /**
   * Financial Summary: Gross donations, refunds, and exceptions (FR-REP-002, FR-REC-005)
   */
  static async getFinanceSummary(tenantId: string, templeId?: string) {
    const { db } = await getDb();

    // 1. Gross Collections from paid donations
    const donationTotal = await db.execute(
      sql`SELECT COALESCE(SUM(amount_minor), 0)::bigint AS gross_donations_minor,
                 COUNT(*)::int AS paid_donations_count
          FROM donations
          WHERE tenant_id = ${tenantId}
            AND status = 'paid'`
    );
    const donRows = donationTotal.rows || donationTotal;

    // 2. Refunds Total
    const refundTotal = await db.execute(
      sql`SELECT COALESCE(SUM(amount_minor), 0)::bigint AS refunds_minor,
                 COUNT(*)::int AS refund_count
          FROM refunds
          WHERE tenant_id = ${tenantId}
            AND status IN ('pending', 'succeeded')`
    );
    const refRows = refundTotal.rows || refundTotal;

    // 3. Reconciliation Exceptions
    const exceptions = await db
      .select()
      .from(reconciliationExceptions)
      .where(
        and(
          eq(reconciliationExceptions.tenantId, tenantId),
          eq(reconciliationExceptions.resolved, false)
        )
      );

    const grossDonations = Number(donRows[0]?.gross_donations_minor || 0);
    const totalRefunds = Number(refRows[0]?.refunds_minor || 0);

    return {
      grossCollectionsMinor: grossDonations,
      refundsMinor: totalRefunds,
      netSettlementMinor: grossDonations - totalRefunds,
      unresolvedExceptionsCount: exceptions.length,
      exceptions,
    };
  }

  /**
   * Export booking records ensuring tenant scoping (FR-REP-004)
   */
  static async exportBookings(tenantId: string, templeId?: string) {
    const { db } = await getDb();

    let query = db
      .select({
        bookingReference: bookings.bookingReference,
        devoteeName: bookings.devoteeName,
        devoteeEmail: bookings.devoteeEmail,
        participantCount: bookings.participantCount,
        priceSnapshotMinor: bookings.priceSnapshotMinor,
        currency: bookings.currency,
        status: bookings.status,
        checkInStatus: bookings.checkInStatus,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .where(eq(bookings.tenantId, tenantId));

    return await query;
  }

  /**
   * Platform Overview for Operators (FR-AUD-004, FR-AUD-005)
   */
  static async getPlatformOverview() {
    const { db } = await getDb();

    // Tenant counts by status
    const tenantStats = await db.execute(
      sql`SELECT status, COUNT(*)::int AS count FROM tenants GROUP BY status`
    );
    const tenantRows = tenantStats.rows || tenantStats;

    // Webhook health
    const webhookStats = await db.execute(
      sql`SELECT status, COUNT(*)::int AS count FROM webhook_events GROUP BY status`
    );
    const webhookRows = webhookStats.rows || webhookStats;

    return {
      tenants: tenantRows,
      webhooks: webhookRows,
    };
  }

  /**
   * Trust Consolidated Multi-Temple Rollup Report (FR-REP-005)
   */
  static async getTrustConsolidatedReport(tenantId: string) {
    const { db } = await getDb();

    // 1. Fetch all temples under this tenant
    const templeList = await db
      .select({
        id: temples.id,
        name: temples.name,
        slug: temples.slug,
        timezone: temples.timezone,
        status: temples.status,
      })
      .from(temples)
      .where(eq(temples.tenantId, tenantId));

    const templeBreakdown = [];
    let totalBookingsCount = 0;
    let totalBookingRevenueMinor = 0;
    let totalDonationsCount = 0;
    let totalDonationRevenueMinor = 0;

    for (const t of templeList) {
      // Bookings aggregation
      const bookingRes = await db.execute(
        sql`SELECT COUNT(*)::int AS count,
                   COALESCE(SUM(price_snapshot_minor), 0)::bigint AS revenue_minor
            FROM bookings
            WHERE tenant_id = ${tenantId}
              AND temple_id = ${t.id}
              AND status IN ('confirmed', 'completed')`
      );
      const bRows = bookingRes.rows || bookingRes;
      const bCount = Number(bRows[0]?.count || 0);
      const bRev = Number(bRows[0]?.revenue_minor || 0);

      // Donations aggregation
      const donationRes = await db.execute(
        sql`SELECT COUNT(*)::int AS count,
                   COALESCE(SUM(amount_minor), 0)::bigint AS revenue_minor
            FROM donations
            WHERE tenant_id = ${tenantId}
              AND temple_id = ${t.id}
              AND status = 'paid'`
      );
      const dRows = donationRes.rows || donationRes;
      const dCount = Number(dRows[0]?.count || 0);
      const dRev = Number(dRows[0]?.revenue_minor || 0);

      totalBookingsCount += bCount;
      totalBookingRevenueMinor += bRev;
      totalDonationsCount += dCount;
      totalDonationRevenueMinor += dRev;

      templeBreakdown.push({
        templeId: t.id,
        name: t.name,
        slug: t.slug,
        bookingsCount: bCount,
        bookingRevenueMinor: bRev,
        donationsCount: dCount,
        donationRevenueMinor: dRev,
        totalRevenueMinor: bRev + dRev,
      });
    }

    return {
      tenantId,
      templeCount: templeList.length,
      consolidated: {
        bookingsCount: totalBookingsCount,
        bookingRevenueMinor: totalBookingRevenueMinor,
        donationsCount: totalDonationsCount,
        donationRevenueMinor: totalDonationRevenueMinor,
        grossTurnoverMinor: totalBookingRevenueMinor + totalDonationRevenueMinor,
      },
      temples: templeBreakdown,
    };
  }

  /**
   * Create SaaS Platform Subscription Plan (FR-REP-006, FR-AUD-006)
   */
  static async createSubscriptionPlan(input: {
    name: string;
    priceMinor: number;
    currency?: string;
    billingInterval?: 'monthly' | 'yearly';
    maxTemples?: number;
    maxBookingsPerMonth?: number;
  }) {
    const { db } = await getDb();

    const [plan] = await db
      .insert(subscriptionPlans)
      .values({
        name: input.name,
        priceMinor: input.priceMinor,
        currency: input.currency || 'INR',
        billingInterval: input.billingInterval || 'monthly',
        maxTemples: input.maxTemples || 1,
        maxBookingsPerMonth: input.maxBookingsPerMonth || 1000,
      })
      .returning();

    return plan;
  }

  /**
   * Assign or update Tenant Platform Subscription (FR-REP-006, FR-AUD-006)
   */
  static async assignTenantSubscription(input: {
    tenantId: string;
    planId: string;
    status?: 'active' | 'past_due' | 'cancelled' | 'renewing';
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
  }) {
    const { db } = await getDb();

    const now = input.currentPeriodStart || new Date();
    const end =
      input.currentPeriodEnd || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [sub] = await db
      .insert(tenantSubscriptions)
      .values({
        tenantId: input.tenantId,
        planId: input.planId,
        status: input.status || 'active',
        currentPeriodStart: now,
        currentPeriodEnd: end,
      })
      .returning();

    return sub;
  }

  /**
   * Platform SaaS Subscription Revenue vs Temple Collections (FR-REP-006, FR-AUD-006)
   * Enforces strict revenue separation between platform billing and temple collections
   */
  static async getPlatformRevenueReport() {
    const { db } = await getDb();

    // 1. Subscription Revenue Aggregation
    const subQuery = await db.execute(
      sql`SELECT p.name AS plan_name,
                 p.billing_interval,
                 p.price_minor,
                 p.currency,
                 COUNT(s.id)::int AS active_subscriptions_count,
                 (COUNT(s.id) * p.price_minor)::bigint AS recurring_revenue_minor
          FROM subscription_plans p
          LEFT JOIN tenant_subscriptions s ON s.plan_id = p.id AND s.status = 'active'
          GROUP BY p.id, p.name, p.billing_interval, p.price_minor, p.currency`
    );
    const subRows = subQuery.rows || subQuery;

    let totalPlatformSubscriptionRevenueMinor = 0;
    let totalActiveSubscriptions = 0;

    for (const r of subRows) {
      totalPlatformSubscriptionRevenueMinor += Number(r.recurring_revenue_minor || 0);
      totalActiveSubscriptions += Number(r.active_subscriptions_count || 0);
    }

    // 2. Temple Collections Total (for audit separation guarantee)
    const templeDonations = await db.execute(
      sql`SELECT COALESCE(SUM(amount_minor), 0)::bigint AS temple_donations_minor FROM donations WHERE status = 'paid'`
    );
    const donRows = templeDonations.rows || templeDonations;
    const totalTempleDonationsMinor = Number(donRows[0]?.temple_donations_minor || 0);

    return {
      platformRevenue: {
        totalSubscriptionRevenueMinor: totalPlatformSubscriptionRevenueMinor,
        activeSubscriptionsCount: totalActiveSubscriptions,
        plans: subRows,
      },
      templeCollectionsDirect: {
        totalDonationsMinor: totalTempleDonationsMinor,
        note: 'Temple collections settle directly to temple merchant accounts and are strictly separated from SaaS platform subscriptions (FR-AUD-006)',
      },
    };
  }
}
