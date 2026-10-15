import { eq, and, gte, sql, lte } from 'drizzle-orm';
import { getDb } from '../../lib/db';
import { pujas, pujaSlots, temples, recurringPujaSchedules, festivalExceptions } from '../../lib/db/schema';
import { logAuditEvent } from '../../lib/audit/logger';

export interface CreateRecurringScheduleInput {
  tenantId: string;
  templeId: string;
  pujaId: string;
  frequency: 'daily' | 'weekly';
  dayOfWeek?: number; // 0=Sunday, 6=Saturday
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  capacity: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  actorUserId: string;
  actorRole: string;
  requestId?: string;
}

export interface CreateFestivalExceptionInput {
  tenantId: string;
  templeId: string;
  pujaId: string;
  festivalName: string;
  exceptionDate: string; // YYYY-MM-DD
  isClosed?: boolean;
  customCapacity?: number;
  customStartTime?: string;
  customEndTime?: string;
  actorUserId: string;
  actorRole: string;
  requestId?: string;
}

export interface CreatePujaInput {
  tenantId: string;
  templeId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  priceMinor: number;
  currency?: string;
  actorUserId: string;
  actorRole: string;
  requestId?: string;
}

export interface CreateSlotInput {
  tenantId: string;
  templeId: string;
  pujaId: string;
  slotDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  totalCapacity: number;
  actorUserId: string;
  actorRole: string;
  requestId?: string;
}

export class PujaService {
  /**
   * Create a new Puja Service (FR-PUJA-001, FR-PUJA-002)
   */
  static async createPuja(input: CreatePujaInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;

    // Verify temple belongs to tenant (FR-PUJA-005)
    const [temple] = await db
      .select()
      .from(temples)
      .where(and(eq(temples.tenantId, input.tenantId), eq(temples.id, input.templeId)))
      .limit(1);

    if (!temple) {
      throw new Error('Temple does not exist or unauthorized in this tenant');
    }

    if (input.priceMinor < 0) {
      throw new Error('Price cannot be negative');
    }
    if (input.durationMinutes <= 0) {
      throw new Error('Duration must be greater than zero');
    }

    const [puja] = await db
      .insert(pujas)
      .values({
        tenantId: input.tenantId,
        templeId: input.templeId,
        name: input.name,
        description: input.description || '',
        durationMinutes: input.durationMinutes,
        priceMinor: input.priceMinor,
        currency: input.currency || 'INR',
        status: 'draft',
      })
      .returning();

    await logAuditEvent(db, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: 'puja.created',
      resourceType: 'puja',
      resourceId: puja.id,
      requestId,
      changeSummary: { name: puja.name, priceMinor: puja.priceMinor },
    });

    return puja;
  }

  /**
   * Publish, unpublish or archive a puja (FR-PUJA-001)
   */
  static async setPujaStatus(
    tenantId: string,
    templeId: string,
    pujaId: string,
    status: 'draft' | 'published' | 'archived',
    actorUserId: string,
    actorRole: string,
    requestId = `req_${Date.now()}`
  ) {
    const { db } = await getDb();

    const [puja] = await db
      .update(pujas)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(pujas.tenantId, tenantId),
          eq(pujas.templeId, templeId),
          eq(pujas.id, pujaId)
        )
      )
      .returning();

    if (!puja) {
      throw new Error('Puja not found or unauthorized');
    }

    await logAuditEvent(db, {
      tenantId,
      actorUserId,
      actorRole,
      action: `puja.${status}`,
      resourceType: 'puja',
      resourceId: puja.id,
      requestId,
      changeSummary: { newStatus: status },
    });

    return puja;
  }

  /**
   * Create a bookable time slot for a puja (FR-PUJA-003)
   */
  static async createSlot(input: CreateSlotInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;

    // Verify puja belongs to this temple & tenant (FR-PUJA-005)
    const [puja] = await db
      .select()
      .from(pujas)
      .where(
        and(
          eq(pujas.tenantId, input.tenantId),
          eq(pujas.templeId, input.templeId),
          eq(pujas.id, input.pujaId)
        )
      )
      .limit(1);

    if (!puja) {
      throw new Error('Puja service not found or unauthorized');
    }

    if (input.totalCapacity <= 0) {
      throw new Error('Capacity must be greater than zero');
    }

    const [slot] = await db
      .insert(pujaSlots)
      .values({
        tenantId: input.tenantId,
        templeId: input.templeId,
        pujaId: input.pujaId,
        slotDate: input.slotDate,
        startTime: input.startTime,
        endTime: input.endTime,
        totalCapacity: input.totalCapacity,
        bookedCapacity: 0,
        status: 'available',
      })
      .returning();

    await logAuditEvent(db, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: 'slot.created',
      resourceType: 'slot',
      resourceId: slot.id,
      requestId,
      changeSummary: {
        slotDate: slot.slotDate,
        startTime: slot.startTime,
        totalCapacity: slot.totalCapacity,
      },
    });

    return slot;
  }

  /**
   * List valid bookable future slots (FR-PUJA-004)
   */
  static async listBookableSlots(
    tenantId: string,
    templeId: string,
    pujaId: string,
    fromDate?: string
  ) {
    const { db } = await getDb();
    const today = fromDate || new Date().toISOString().split('T')[0];

    return await db
      .select()
      .from(pujaSlots)
      .where(
        and(
          eq(pujaSlots.tenantId, tenantId),
          eq(pujaSlots.templeId, templeId),
          eq(pujaSlots.pujaId, pujaId),
          eq(pujaSlots.status, 'available'),
          gte(pujaSlots.slotDate, today),
          sql`${pujaSlots.bookedCapacity} < ${pujaSlots.totalCapacity}`
        )
      );
  }

  /**
   * Create recurring puja schedule (FR-PUJA-007)
   */
  static async createRecurringSchedule(input: CreateRecurringScheduleInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;

    const [puja] = await db
      .select()
      .from(pujas)
      .where(
        and(
          eq(pujas.tenantId, input.tenantId),
          eq(pujas.templeId, input.templeId),
          eq(pujas.id, input.pujaId)
        )
      )
      .limit(1);

    if (!puja) {
      throw new Error('Puja service not found or unauthorized');
    }

    if (input.capacity <= 0) {
      throw new Error('Schedule capacity must be greater than zero');
    }

    const [schedule] = await db
      .insert(recurringPujaSchedules)
      .values({
        tenantId: input.tenantId,
        templeId: input.templeId,
        pujaId: input.pujaId,
        frequency: input.frequency,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        capacity: input.capacity,
        startDate: input.startDate,
        endDate: input.endDate || null,
        isActive: true,
      })
      .returning();

    await logAuditEvent(db, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: 'recurring_schedule.created',
      resourceType: 'recurring_puja_schedule',
      resourceId: schedule.id,
      requestId,
      changeSummary: { frequency: schedule.frequency, capacity: schedule.capacity },
    });

    return schedule;
  }

  /**
   * Create festival exception override (FR-PUJA-007)
   */
  static async createFestivalException(input: CreateFestivalExceptionInput) {
    const { db } = await getDb();
    const requestId = input.requestId || `req_${Date.now()}`;

    const [puja] = await db
      .select()
      .from(pujas)
      .where(
        and(
          eq(pujas.tenantId, input.tenantId),
          eq(pujas.templeId, input.templeId),
          eq(pujas.id, input.pujaId)
        )
      )
      .limit(1);

    if (!puja) {
      throw new Error('Puja service not found or unauthorized');
    }

    const [exception] = await db
      .insert(festivalExceptions)
      .values({
        tenantId: input.tenantId,
        templeId: input.templeId,
        pujaId: input.pujaId,
        festivalName: input.festivalName,
        exceptionDate: input.exceptionDate,
        isClosed: input.isClosed || false,
        customCapacity: input.customCapacity || null,
        customStartTime: input.customStartTime || null,
        customEndTime: input.customEndTime || null,
      })
      .returning();

    await logAuditEvent(db, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: 'festival_exception.created',
      resourceType: 'festival_exception',
      resourceId: exception.id,
      requestId,
      changeSummary: { festivalName: exception.festivalName, isClosed: exception.isClosed },
    });

    return exception;
  }

  /**
   * Generate slots from a recurring schedule taking festival exceptions into account (FR-PUJA-007)
   */
  static async generateSlotsFromRecurring(
    tenantId: string,
    templeId: string,
    pujaId: string,
    scheduleId: string,
    startDateStr: string,
    endDateStr: string,
    actorUserId: string,
    actorRole: string
  ) {
    const { db } = await getDb();

    const [schedule] = await db
      .select()
      .from(recurringPujaSchedules)
      .where(
        and(
          eq(recurringPujaSchedules.tenantId, tenantId),
          eq(recurringPujaSchedules.templeId, templeId),
          eq(recurringPujaSchedules.pujaId, pujaId),
          eq(recurringPujaSchedules.id, scheduleId)
        )
      )
      .limit(1);

    if (!schedule || !schedule.isActive) {
      throw new Error('Recurring schedule not found or inactive');
    }

    // Fetch festival exceptions in date range
    const exceptions = await db
      .select()
      .from(festivalExceptions)
      .where(
        and(
          eq(festivalExceptions.tenantId, tenantId),
          eq(festivalExceptions.templeId, templeId),
          eq(festivalExceptions.pujaId, pujaId),
          gte(festivalExceptions.exceptionDate, startDateStr),
          lte(festivalExceptions.exceptionDate, endDateStr)
        )
      );

    const exceptionsMap = new Map<string, typeof exceptions[0]>();
    for (const ex of exceptions) {
      exceptionsMap.set(ex.exceptionDate, ex);
    }

    const generatedSlots = [];
    const current = new Date(startDateStr);
    const end = new Date(endDateStr);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const dayOfWeek = current.getUTCDay(); // 0 = Sunday, 6 = Saturday

      let shouldGenerate = false;
      if (schedule.frequency === 'daily') {
        shouldGenerate = true;
      } else if (schedule.frequency === 'weekly') {
        shouldGenerate = schedule.dayOfWeek === dayOfWeek;
      }

      // Check within schedule start and end dates
      if (schedule.startDate && dateStr < schedule.startDate) {
        shouldGenerate = false;
      }
      if (schedule.endDate && dateStr > schedule.endDate) {
        shouldGenerate = false;
      }

      if (shouldGenerate) {
        const exception = exceptionsMap.get(dateStr);

        // If festival closed, skip generating slot
        if (exception?.isClosed) {
          current.setUTCDate(current.getUTCDate() + 1);
          continue;
        }

        const capacity = exception?.customCapacity ?? schedule.capacity;
        const startTime = exception?.customStartTime ?? schedule.startTime;
        const endTime = exception?.customEndTime ?? schedule.endTime;

        // Check if slot already exists on this date/time
        const existing = await db
          .select()
          .from(pujaSlots)
          .where(
            and(
              eq(pujaSlots.tenantId, tenantId),
              eq(pujaSlots.templeId, templeId),
              eq(pujaSlots.pujaId, pujaId),
              eq(pujaSlots.slotDate, dateStr),
              eq(pujaSlots.startTime, startTime)
            )
          )
          .limit(1);

        if (existing.length === 0) {
          const [newSlot] = await db
            .insert(pujaSlots)
            .values({
              tenantId,
              templeId,
              pujaId,
              slotDate: dateStr,
              startTime,
              endTime,
              totalCapacity: capacity,
              bookedCapacity: 0,
              status: 'available',
            })
            .returning();
          generatedSlots.push(newSlot);
        }
      }

      current.setUTCDate(current.getUTCDate() + 1);
    }

    return generatedSlots;
  }
}
