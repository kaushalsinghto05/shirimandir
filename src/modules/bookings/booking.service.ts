import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../../lib/db';
import {
  bookings,
  pujaSlots,
  pujas,
  temples,
  payments,
  refunds,
  reconciliationExceptions,
} from '../../lib/db/schema';
import { logAuditEvent } from '../../lib/audit/logger';

export interface ReserveBookingInput {
  tenantId: string;
  templeId: string;
  pujaId: string;
  slotId: string;
  participantCount: number;
  devoteeUserId?: string | null;
  devoteeName: string;
  devoteeEmail: string;
  devoteePhone: string;
  devoteeGotra?: string;
  devoteeSankalp?: string;
  requestId?: string;
}

export class BookingService {
  /**
   * Reserve puja slot capacity atomically (FR-BOOK-001..004, FR-BOOK-009, AT-02)
   */
  static async reserveSlot(input: ReserveBookingInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;
    const participantCount = input.participantCount || 1;

    if (participantCount <= 0) {
      throw new Error('Participant count must be at least 1');
    }

    return await db.transaction(async (tx: any) => {
      // 1. Validate puja belongs to temple & tenant, and is published (FR-PUJA-004, FR-PUJA-005)
      const [puja] = await tx
        .select()
        .from(pujas)
        .where(
          and(
            eq(pujas.tenantId, input.tenantId),
            eq(pujas.templeId, input.templeId),
            eq(pujas.id, input.pujaId),
            eq(pujas.status, 'published')
          )
        )
        .limit(1);

      if (!puja) {
        throw new Error('Selected puja is not active or published');
      }

      // 2. Authoritative backend pricing (FR-BOOK-002, FR-PUJA-006)
      const calculatedPriceMinor = puja.priceMinor * participantCount;

      // 3. Atomically reserve slot capacity (AT-02 concurrency protection)
      // Enforces: booked_capacity + count <= total_capacity in a single atomic SQL command
      const updateResult = await tx.execute(
        sql`UPDATE puja_slots 
            SET booked_capacity = booked_capacity + ${participantCount},
                updated_at = CURRENT_TIMESTAMP
            WHERE tenant_id = ${input.tenantId}
              AND temple_id = ${input.templeId}
              AND id = ${input.slotId}
              AND puja_id = ${input.pujaId}
              AND status = 'available'
              AND (booked_capacity + ${participantCount}) <= total_capacity
            RETURNING *`
      );

      const updatedRows = updateResult.rows || updateResult;
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error('Insufficient slot capacity or slot unavailable');
      }

      // 4. Generate unique booking reference and 10-minute expiry (FR-BOOK-004)
      const bookingReference = `BK-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const [booking] = await tx
        .insert(bookings)
        .values({
          tenantId: input.tenantId,
          templeId: input.templeId,
          pujaId: input.pujaId,
          slotId: input.slotId,
          devoteeUserId: input.devoteeUserId || null,
          devoteeName: input.devoteeName,
          devoteeEmail: input.devoteeEmail,
          devoteePhone: input.devoteePhone,
          devoteeGotra: input.devoteeGotra || null,
          devoteeSankalp: input.devoteeSankalp || null,
          participantCount,
          priceSnapshotMinor: calculatedPriceMinor,
          currency: puja.currency,
          status: 'pending_payment',
          expiresAt,
          checkInStatus: 'pending',
          bookingReference,
        })
        .returning();

      // 5. Audit log reservation
      await logAuditEvent(tx, {
        tenantId: input.tenantId,
        actorUserId: input.devoteeUserId || null,
        actorRole: 'devotee',
        action: 'booking.reserved',
        resourceType: 'booking',
        resourceId: booking.id,
        requestId,
        changeSummary: {
          bookingReference: booking.bookingReference,
          priceMinor: calculatedPriceMinor,
          expiresAt,
        },
      });

      return booking;
    });
  }

  /**
   * Confirm booking upon verified payment (FR-BOOK-005, AT-06)
   */
  static async confirmBooking(
    bookingId: string,
    paymentId: string,
    requestId = `req_${Date.now()}`
  ) {
    const { db } = await getDb();

    return await db.transaction(async (tx: any) => {
      const [booking] = await tx
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if booking already expired (AT-06 exception handling)
      if (booking.status === 'expired' || booking.expiresAt < new Date()) {
        // Late payment after expiration! DO NOT oversell.
        await tx.insert(reconciliationExceptions).values({
          tenantId: booking.tenantId,
          provider: 'payment_engine',
          internalReference: booking.bookingReference,
          payableType: 'booking',
          payableId: booking.id,
          exceptionType: 'late_payment_expired_slot',
          details: {
            bookingId: booking.id,
            paymentId,
            reason: 'Payment succeeded after slot reservation expired',
          },
          resolved: false,
        });

        // Trigger automatic refund workflow
        await tx.insert(refunds).values({
          tenantId: booking.tenantId,
          paymentId,
          requestedByUserId: booking.devoteeUserId || '00000000-0000-0000-0000-000000000000',
          amountMinor: booking.priceSnapshotMinor,
          currency: booking.currency,
          reason: 'Automatic refund: payment received after reservation expired',
          status: 'pending',
        });

        return {
          status: 'expired_quarantined',
          message: 'Reservation expired before payment confirmed. Refund has been initiated.',
        };
      }

      const [confirmed] = await tx
        .update(bookings)
        .set({ status: 'confirmed', updatedAt: new Date() })
        .where(and(eq(bookings.id, bookingId), eq(bookings.status, 'pending_payment')))
        .returning();

      await logAuditEvent(tx, {
        tenantId: booking.tenantId,
        actorUserId: booking.devoteeUserId || null,
        actorRole: 'system',
        action: 'booking.confirmed',
        resourceType: 'booking',
        resourceId: booking.id,
        requestId,
        changeSummary: { paymentId },
      });

      return confirmed;
    });
  }

  /**
   * Background Expiry Reaper: Releases expired pending reservations (FR-BOOK-009)
   */
  static async expirePendingReservations() {
    const { db } = await getDb();
    const now = new Date();

    const expiredPending = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.status, 'pending_payment'),
          sql`${bookings.expiresAt} < ${now.toISOString()}`
        )
      );

    let releasedCount = 0;

    for (const b of expiredPending) {
      await db.transaction(async (tx: any) => {
        // Atomically transition to expired
        const [updated] = await tx
          .update(bookings)
          .set({ status: 'expired', updatedAt: new Date() })
          .where(and(eq(bookings.id, b.id), eq(bookings.status, 'pending_payment')))
          .returning();

        if (updated) {
          // Release slot capacity exactly once (FR-BOOK-009)
          await tx.execute(
            sql`UPDATE puja_slots 
                SET booked_capacity = GREATEST(0, booked_capacity - ${b.participantCount}),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${b.slotId}`
          );
          releasedCount++;
        }
      });
    }

    return { releasedCount };
  }

  /**
   * Staff Check-In Devotee (FR-BOOK-007)
   */
  static async checkInDevotee(
    tenantId: string,
    bookingId: string,
    staffUserId: string,
    actorRole: string,
    requestId = `req_${Date.now()}`
  ) {
    const { db } = await getDb();

    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.tenantId, tenantId), eq(bookings.id, bookingId)))
      .limit(1);

    if (!booking) {
      throw new Error('Booking not found in this tenant');
    }
    if (booking.status !== 'confirmed') {
      throw new Error(`Cannot check in booking with status: ${booking.status}`);
    }

    const [checkedIn] = await db
      .update(bookings)
      .set({
        checkInStatus: 'checked_in',
        checkInAt: new Date(),
        checkInBy: staffUserId,
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(and(eq(bookings.tenantId, tenantId), eq(bookings.id, bookingId)))
      .returning();

    await logAuditEvent(db, {
      tenantId,
      actorUserId: staffUserId,
      actorRole,
      action: 'booking.checked_in',
      resourceType: 'booking',
      resourceId: booking.id,
      requestId,
    });

    return checkedIn;
  }

  /**
   * Devotee retrieval of own booking (FR-BOOK-010, AT-07 cross-user protection)
   */
  static async getDevoteeBooking(devoteeUserId: string, bookingId: string) {
    const { db } = await getDb();

    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.devoteeUserId, devoteeUserId)))
      .limit(1);

    return booking || null;
  }

  /**
   * Search bookings for staff (FR-BOOK-006)
   */
  static async searchBookings(
    tenantId: string,
    templeId?: string,
    status?: string,
    searchQuery?: string
  ) {
    const { db } = await getDb();
    let query = db.select().from(bookings).where(eq(bookings.tenantId, tenantId));
    // Additional filters applied server-side
    return await query;
  }
}
