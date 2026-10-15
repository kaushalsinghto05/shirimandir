import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  date,
  time,
  jsonb,
  unique,
  foreignKey,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ----------------------------------------------------------------------
// 1. TENANTS & TEMPLES
// ----------------------------------------------------------------------

export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 63 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    status: varchar('status', { length: 31 })
      .notNull()
      .default('pending_approval'), // 'pending_approval' | 'active' | 'suspended'
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    statusCheck: check(
      'chk_tenant_status',
      sql`${table.status} IN ('pending_approval', 'active', 'suspended')`
    ),
  })
);

export const temples = pgTable(
  'temples',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 63 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address').notNull(),
    timezone: varchar('timezone', { length: 63 })
      .notNull()
      .default('Asia/Kolkata'),
    contactEmail: varchar('contact_email', { length: 255 }).notNull(),
    contactPhone: varchar('contact_phone', { length: 31 }).notNull(),
    description: text('description').notNull().default(''),
    branding: jsonb('branding')
      .notNull()
      .default({
        logoUrl: null,
        primaryColor: '#e11d48',
        secondaryColor: '#f59e0b',
        bannerUrl: null,
      }),
    status: varchar('status', { length: 31 })
      .notNull()
      .default('draft'), // 'draft' | 'published' | 'suspended'
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uqTenantSlug: unique('uq_temples_tenant_slug').on(table.tenantId, table.slug),
    uqTenantId: unique('uq_temples_tenant_id').on(table.tenantId, table.id),
    statusCheck: check(
      'chk_temple_status',
      sql`${table.status} IN ('draft', 'published', 'suspended')`
    ),
  })
);

// ----------------------------------------------------------------------
// 2. USERS, MEMBERSHIPS & RBAC
// ----------------------------------------------------------------------

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 31 }),
    mfaSecret: varchar('mfa_secret', { length: 255 }),
    mfaEnabled: boolean('mfa_enabled').notNull().default(false),
    platformRole: varchar('platform_role', { length: 31 })
      .notNull()
      .default('none'), // 'none' | 'platform_super_admin' | 'platform_support' | 'platform_finance'
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    platformRoleCheck: check(
      'chk_user_platform_role',
      sql`${table.platformRole} IN ('none', 'platform_super_admin', 'platform_support', 'platform_finance')`
    ),
  })
);

export const tenantMemberships = pgTable(
  'tenant_memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 31 }).notNull(), // 'trust_admin' | 'temple_admin' | 'puja_manager' | 'priest' | 'temple_accountant' | 'devotee'
    assignedTempleId: uuid('assigned_temple_id'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uqTenantUser: unique('uq_tenant_user').on(table.tenantId, table.userId),
    fkMembershipTemple: foreignKey({
      columns: [table.tenantId, table.assignedTempleId],
      foreignColumns: [temples.tenantId, temples.id],
      name: 'fk_membership_temple',
    }).onDelete('set null'),
    roleCheck: check(
      'chk_membership_role',
      sql`${table.role} IN ('trust_admin', 'temple_admin', 'puja_manager', 'priest', 'temple_accountant', 'devotee')`
    ),
  })
);

// ----------------------------------------------------------------------
// 3. PAYMENT CONFIGURATIONS (DIRECT SETTLEMENT)
// ----------------------------------------------------------------------

export const paymentConfigs = pgTable(
  'payment_configs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    templeId: uuid('temple_id').notNull(),
    provider: varchar('provider', { length: 31 }).notNull(), // 'razorpay' | 'stripe' | 'mock'
    merchantAccountId: varchar('merchant_account_id', { length: 255 }).notNull(),
    onboardingStatus: varchar('onboarding_status', { length: 31 })
      .notNull()
      .default('pending'), // 'pending' | 'active' | 'suspended'
    credentialsEncrypted: jsonb('credentials_encrypted').notNull().default({}),
    isActive: boolean('is_active').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    fkPayConfigTemple: foreignKey({
      columns: [table.tenantId, table.templeId],
      foreignColumns: [temples.tenantId, temples.id],
      name: 'fk_payconfig_temple',
    }).onDelete('cascade'),
    uqPayConfigTemple: unique('uq_payconfig_temple').on(table.tenantId, table.templeId),
    providerCheck: check(
      'chk_payconfig_provider',
      sql`${table.provider} IN ('razorpay', 'stripe', 'mock')`
    ),
    onboardingCheck: check(
      'chk_payconfig_onboarding',
      sql`${table.onboardingStatus} IN ('pending', 'active', 'suspended')`
    ),
  })
);

// ----------------------------------------------------------------------
// 4. PUJAS & SCHEDULES
// ----------------------------------------------------------------------

export const pujas = pgTable(
  'pujas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    templeId: uuid('temple_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull().default(''),
    durationMinutes: integer('duration_minutes').notNull(),
    priceMinor: integer('price_minor').notNull(), // in paise / cents
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    status: varchar('status', { length: 31 })
      .notNull()
      .default('draft'), // 'draft' | 'published' | 'archived'
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    fkPujasTemple: foreignKey({
      columns: [table.tenantId, table.templeId],
      foreignColumns: [temples.tenantId, temples.id],
      name: 'fk_pujas_temple',
    }).onDelete('cascade'),
    uqPujasTenantId: unique('uq_pujas_tenant_id').on(table.tenantId, table.id),
    statusCheck: check(
      'chk_puja_status',
      sql`${table.status} IN ('draft', 'published', 'archived')`
    ),
    durationCheck: check('chk_puja_duration', sql`${table.durationMinutes} > 0`),
    priceCheck: check('chk_puja_price', sql`${table.priceMinor} >= 0`),
  })
);

export const pujaSlots = pgTable(
  'puja_slots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    templeId: uuid('temple_id').notNull(),
    pujaId: uuid('puja_id').notNull(),
    slotDate: date('slot_date').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    totalCapacity: integer('total_capacity').notNull(),
    bookedCapacity: integer('booked_capacity').notNull().default(0),
    status: varchar('status', { length: 31 })
      .notNull()
      .default('available'), // 'available' | 'cancelled' | 'completed'
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    fkSlotsPuja: foreignKey({
      columns: [table.tenantId, table.pujaId],
      foreignColumns: [pujas.tenantId, pujas.id],
      name: 'fk_slots_puja',
    }).onDelete('cascade'),
    uqSlotsTenantId: unique('uq_slots_tenant_id').on(table.tenantId, table.id),
    capacityCheck: check(
      'chk_slot_capacity',
      sql`${table.bookedCapacity} <= ${table.totalCapacity} AND ${table.bookedCapacity} >= 0`
    ),
    totalCapacityCheck: check('chk_slot_total_cap', sql`${table.totalCapacity} > 0`),
    statusCheck: check(
      'chk_slot_status',
      sql`${table.status} IN ('available', 'cancelled', 'completed')`
    ),
  })
);

// ----------------------------------------------------------------------
// 5. BOOKINGS & CONCURRENCY
// ----------------------------------------------------------------------

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    templeId: uuid('temple_id').notNull(),
    pujaId: uuid('puja_id').notNull(),
    slotId: uuid('slot_id').notNull(),
    devoteeUserId: uuid('devotee_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    devoteeName: varchar('devotee_name', { length: 255 }).notNull(),
    devoteeEmail: varchar('devotee_email', { length: 255 }).notNull(),
    devoteePhone: varchar('devotee_phone', { length: 31 }).notNull(),
    devoteeGotra: varchar('devotee_gotra', { length: 127 }),
    devoteeSankalp: text('devotee_sankalp'),
    participantCount: integer('participant_count').notNull().default(1),
    priceSnapshotMinor: integer('price_snapshot_minor').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    status: varchar('status', { length: 31 })
      .notNull()
      .default('pending_payment'), // 'pending_payment' | 'confirmed' | 'cancelled' | 'expired' | 'completed'
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    checkInStatus: varchar('check_in_status', { length: 31 })
      .notNull()
      .default('pending'), // 'pending' | 'checked_in'
    checkInAt: timestamp('check_in_at', { withTimezone: true }),
    checkInBy: uuid('check_in_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    bookingReference: varchar('booking_reference', { length: 63 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    fkBookingsTemple: foreignKey({
      columns: [table.tenantId, table.templeId],
      foreignColumns: [temples.tenantId, temples.id],
      name: 'fk_bookings_temple',
    }).onDelete('cascade'),
    fkBookingsSlot: foreignKey({
      columns: [table.tenantId, table.slotId],
      foreignColumns: [pujaSlots.tenantId, pujaSlots.id],
      name: 'fk_bookings_slot',
    }).onDelete('cascade'),
    uqBookingsTenantRef: unique('uq_bookings_tenant_ref').on(
      table.tenantId,
      table.bookingReference
    ),
    uqBookingsTenantId: unique('uq_bookings_tenant_id').on(table.tenantId, table.id),
    statusCheck: check(
      'chk_booking_status',
      sql`${table.status} IN ('pending_payment', 'confirmed', 'cancelled', 'expired', 'completed')`
    ),
    checkInStatusCheck: check(
      'chk_booking_checkin_status',
      sql`${table.checkInStatus} IN ('pending', 'checked_in')`
    ),
    participantCheck: check('chk_booking_participants', sql`${table.participantCount} > 0`),
    priceCheck: check('chk_booking_price', sql`${table.priceSnapshotMinor} >= 0`),
  })
);

// ----------------------------------------------------------------------
// 6. DONATION CAMPAIGNS & DONATIONS
// ----------------------------------------------------------------------

export const donationCampaigns = pgTable(
  'donation_campaigns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    templeId: uuid('temple_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull().default(''),
    legalEntityName: varchar('legal_entity_name', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    status: varchar('status', { length: 31 })
      .notNull()
      .default('draft'), // 'draft' | 'published' | 'closed'
    minAmountMinor: integer('min_amount_minor').notNull().default(1000), // 10 INR
    maxAmountMinor: integer('max_amount_minor'),
    targetAmountMinor: integer('target_amount_minor'), // FR-DON-008
    collectedAmountMinor: integer('collected_amount_minor').notNull().default(0), // FR-DON-008
    startDate: timestamp('start_date', { withTimezone: true }), // FR-DON-008
    endDate: timestamp('end_date', { withTimezone: true }), // FR-DON-008
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    taxExemptEligible: boolean('tax_exempt_eligible').notNull().default(false),
    taxExemptionRef: varchar('tax_exemption_ref', { length: 127 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    fkCampaignsTemple: foreignKey({
      columns: [table.tenantId, table.templeId],
      foreignColumns: [temples.tenantId, temples.id],
      name: 'fk_campaigns_temple',
    }).onDelete('cascade'),
    uqCampaignsTenantId: unique('uq_campaigns_tenant_id').on(table.tenantId, table.id),
    statusCheck: check(
      'chk_campaign_status',
      sql`${table.status} IN ('draft', 'published', 'closed')`
    ),
    minAmountCheck: check('chk_campaign_min_amount', sql`${table.minAmountMinor} > 0`),
  })
);

export const donations = pgTable(
  'donations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    templeId: uuid('temple_id').notNull(),
    campaignId: uuid('campaign_id').notNull(),
    devoteeUserId: uuid('devotee_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    donorName: varchar('donor_name', { length: 255 }).notNull(),
    donorEmail: varchar('donor_email', { length: 255 }).notNull(),
    donorPhone: varchar('donor_phone', { length: 31 }),
    donorPan: varchar('donor_pan', { length: 15 }),
    amountMinor: integer('amount_minor').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    status: varchar('status', { length: 31 })
      .notNull()
      .default('pending_payment'), // 'pending_payment' | 'paid' | 'failed' | 'refunded'
    paidAt: timestamp('paid_at', { withTimezone: true }),
    donationReference: varchar('donation_reference', { length: 63 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    fkDonationsTemple: foreignKey({
      columns: [table.tenantId, table.templeId],
      foreignColumns: [temples.tenantId, temples.id],
      name: 'fk_donations_temple',
    }).onDelete('cascade'),
    fkDonationsCampaign: foreignKey({
      columns: [table.tenantId, table.campaignId],
      foreignColumns: [donationCampaigns.tenantId, donationCampaigns.id],
      name: 'fk_donations_campaign',
    }).onDelete('cascade'),
    uqDonationsTenantRef: unique('uq_donations_tenant_ref').on(
      table.tenantId,
      table.donationReference
    ),
    uqDonationsTenantId: unique('uq_donations_tenant_id').on(table.tenantId, table.id),
    statusCheck: check(
      'chk_donation_status',
      sql`${table.status} IN ('pending_payment', 'paid', 'failed', 'refunded')`
    ),
    amountCheck: check('chk_donation_amount', sql`${table.amountMinor} > 0`),
  })
);

// ----------------------------------------------------------------------
// 7. PAYMENTS, WEBHOOKS & REFUNDS
// ----------------------------------------------------------------------

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    templeId: uuid('temple_id').notNull(),
    payableType: varchar('payable_type', { length: 31 }).notNull(), // 'booking' | 'donation'
    payableId: uuid('payable_id').notNull(),
    provider: varchar('provider', { length: 31 }).notNull(), // 'razorpay' | 'stripe' | 'mock'
    providerPaymentId: varchar('provider_payment_id', { length: 255 }),
    providerOrderId: varchar('provider_order_id', { length: 255 }).notNull(),
    amountMinor: integer('amount_minor').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    status: varchar('status', { length: 31 })
      .notNull()
      .default('pending'), // 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refund_pending' | 'refunded' | 'reconciliation_required'
    providerFeeMinor: integer('provider_fee_minor').default(0),
    settlementStatus: varchar('settlement_status', { length: 31 })
      .notNull()
      .default('unsettled'), // 'unsettled' | 'settled'
    settlementAmountMinor: integer('settlement_amount_minor'),
    settledAt: timestamp('settled_at', { withTimezone: true }),
    rawMetadata: jsonb('raw_metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    fkPaymentsTemple: foreignKey({
      columns: [table.tenantId, table.templeId],
      foreignColumns: [temples.tenantId, temples.id],
      name: 'fk_payments_temple',
    }).onDelete('cascade'),
    uqPaymentsTenantId: unique('uq_payments_tenant_id').on(table.tenantId, table.id),
    payableTypeCheck: check(
      'chk_payment_payable_type',
      sql`${table.payableType} IN ('booking', 'donation')`
    ),
    providerCheck: check(
      'chk_payment_provider',
      sql`${table.provider} IN ('razorpay', 'stripe', 'mock')`
    ),
    statusCheck: check(
      'chk_payment_status',
      sql`${table.status} IN ('pending', 'succeeded', 'failed', 'cancelled', 'refund_pending', 'refunded', 'reconciliation_required')`
    ),
    settlementStatusCheck: check(
      'chk_payment_settlement_status',
      sql`${table.settlementStatus} IN ('unsettled', 'settled')`
    ),
  })
);

export const webhookEvents = pgTable(
  'webhook_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provider: varchar('provider', { length: 31 }).notNull(),
    eventId: varchar('event_id', { length: 255 }).notNull(),
    eventType: varchar('event_type', { length: 127 }).notNull(),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'set null',
    }),
    payload: jsonb('payload').notNull(),
    status: varchar('status', { length: 31 })
      .notNull()
      .default('pending'), // 'pending' | 'processed' | 'duplicate' | 'failed' | 'quarantined'
    failureReason: text('failure_reason'),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uqWebhookProviderEvent: unique('uq_webhook_provider_event').on(
      table.provider,
      table.eventId
    ),
    statusCheck: check(
      'chk_webhook_status',
      sql`${table.status} IN ('pending', 'processed', 'duplicate', 'failed', 'quarantined')`
    ),
  })
);

export const refunds = pgTable(
  'refunds',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    paymentId: uuid('payment_id')
      .notNull()
      .references(() => payments.id, { onDelete: 'cascade' }),
    requestedByUserId: uuid('requested_by_user_id')
      .notNull()
      .references(() => users.id),
    amountMinor: integer('amount_minor').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    reason: text('reason').notNull(),
    providerRefundId: varchar('provider_refund_id', { length: 255 }),
    status: varchar('status', { length: 31 })
      .notNull()
      .default('pending'), // 'pending' | 'succeeded' | 'failed'
    failureReason: text('failure_reason'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    statusCheck: check(
      'chk_refund_status',
      sql`${table.status} IN ('pending', 'succeeded', 'failed')`
    ),
    amountCheck: check('chk_refund_amount', sql`${table.amountMinor} > 0`),
  })
);

// ----------------------------------------------------------------------
// 8. RECEIPTS & AUDIT LOGS
// ----------------------------------------------------------------------

export const receipts = pgTable(
  'receipts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    templeId: uuid('temple_id').notNull(),
    donationId: uuid('donation_id').notNull(),
    receiptNumber: varchar('receipt_number', { length: 63 }).notNull(),
    issuingLegalEntity: varchar('issuing_legal_entity', { length: 255 }).notNull(),
    receiptDate: timestamp('receipt_date', { withTimezone: true })
      .notNull()
      .defaultNow(),
    amountMinor: integer('amount_minor').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    status: varchar('status', { length: 31 })
      .notNull()
      .default('issued'), // 'issued' | 'voided' | 'corrected'
    voidReason: text('void_reason'),
    previousReceiptId: uuid('previous_receipt_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    fkReceiptsTemple: foreignKey({
      columns: [table.tenantId, table.templeId],
      foreignColumns: [temples.tenantId, temples.id],
      name: 'fk_receipts_temple',
    }).onDelete('cascade'),
    fkReceiptsDonation: foreignKey({
      columns: [table.tenantId, table.donationId],
      foreignColumns: [donations.tenantId, donations.id],
      name: 'fk_receipts_donation',
    }).onDelete('cascade'),
    uqReceiptsTenantNumber: unique('uq_receipts_tenant_number').on(
      table.tenantId,
      table.receiptNumber
    ),
    statusCheck: check(
      'chk_receipt_status',
      sql`${table.status} IN ('issued', 'voided', 'corrected')`
    ),
  })
);

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id'),
  actorUserId: uuid('actor_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  actorRole: varchar('actor_role', { length: 63 }).notNull(),
  action: varchar('action', { length: 127 }).notNull(),
  resourceType: varchar('resource_type', { length: 63 }).notNull(),
  resourceId: varchar('resource_id', { length: 255 }).notNull(),
  requestId: varchar('request_id', { length: 63 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  changeSummary: jsonb('change_summary').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reconciliationExceptions = pgTable(
  'reconciliation_exceptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'cascade',
    }),
    provider: varchar('provider', { length: 31 }).notNull(),
    providerReference: varchar('provider_reference', { length: 255 }),
    internalReference: varchar('internal_reference', { length: 255 }),
    payableType: varchar('payable_type', { length: 31 }),
    payableId: uuid('payable_id'),
    exceptionType: varchar('exception_type', { length: 63 }).notNull(), // 'amount_mismatch' | 'currency_mismatch' | 'late_payment_expired_slot' | 'orphan_payment' | 'signature_failure'
    details: jsonb('details').notNull().default({}),
    resolved: boolean('resolved').notNull().default(false),
    resolvedBy: uuid('resolved_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    exceptionTypeCheck: check(
      'chk_reconciliation_exception_type',
      sql`${table.exceptionType} IN ('amount_mismatch', 'currency_mismatch', 'late_payment_expired_slot', 'orphan_payment', 'signature_failure')`
    ),
  })
);

// ----------------------------------------------------------------------
// 9. P1 EXPANSIONS: CUSTOM DOMAINS, RECURRING PUJAS, FESTIVALS, SUBSCRIPTIONS
// ----------------------------------------------------------------------

export const customDomains = pgTable(
  'custom_domains',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    templeId: uuid('temple_id').notNull(),
    domain: varchar('domain', { length: 255 }).notNull().unique(),
    verificationToken: varchar('verification_token', { length: 255 }).notNull(),
    verificationType: varchar('verification_type', { length: 31 })
      .notNull()
      .default('cname'), // 'cname' | 'txt'
    status: varchar('status', { length: 31 })
      .notNull()
      .default('pending_verification'), // 'pending_verification' | 'verified' | 'active' | 'failed'
    tlsStatus: varchar('tls_status', { length: 31 })
      .notNull()
      .default('pending'), // 'pending' | 'issued' | 'failed' | 'renewing'
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    fkDomainTemple: foreignKey({
      columns: [table.tenantId, table.templeId],
      foreignColumns: [temples.tenantId, temples.id],
      name: 'fk_domain_temple',
    }).onDelete('cascade'),
    statusCheck: check(
      'chk_domain_status',
      sql`${table.status} IN ('pending_verification', 'verified', 'active', 'failed')`
    ),
    tlsStatusCheck: check(
      'chk_domain_tls_status',
      sql`${table.tlsStatus} IN ('pending', 'issued', 'failed', 'renewing')`
    ),
  })
);

export const recurringPujaSchedules = pgTable(
  'recurring_puja_schedules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    templeId: uuid('temple_id').notNull(),
    pujaId: uuid('puja_id').notNull(),
    frequency: varchar('frequency', { length: 31 })
      .notNull()
      .default('daily'), // 'daily' | 'weekly'
    dayOfWeek: integer('day_of_week'), // 0 (Sunday) to 6 (Saturday) for weekly
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    capacity: integer('capacity').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    fkRecurringPuja: foreignKey({
      columns: [table.tenantId, table.pujaId],
      foreignColumns: [pujas.tenantId, pujas.id],
      name: 'fk_recurring_puja',
    }).onDelete('cascade'),
    frequencyCheck: check(
      'chk_recurring_freq',
      sql`${table.frequency} IN ('daily', 'weekly')`
    ),
    capacityCheck: check('chk_recurring_capacity', sql`${table.capacity} > 0`),
  })
);

export const festivalExceptions = pgTable(
  'festival_exceptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    templeId: uuid('temple_id').notNull(),
    pujaId: uuid('puja_id').notNull(),
    festivalName: varchar('festival_name', { length: 255 }).notNull(),
    exceptionDate: date('exception_date').notNull(),
    isClosed: boolean('is_closed').notNull().default(false),
    customCapacity: integer('custom_capacity'),
    customStartTime: time('custom_start_time'),
    customEndTime: time('custom_end_time'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    fkFestivalPuja: foreignKey({
      columns: [table.tenantId, table.pujaId],
      foreignColumns: [pujas.tenantId, pujas.id],
      name: 'fk_festival_puja',
    }).onDelete('cascade'),
  })
);

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 127 }).notNull(),
  priceMinor: integer('price_minor').notNull(), // in paise / cents
  currency: varchar('currency', { length: 3 }).notNull().default('INR'),
  billingInterval: varchar('billing_interval', { length: 31 })
    .notNull()
    .default('monthly'), // 'monthly' | 'yearly'
  maxTemples: integer('max_temples').notNull().default(1),
  maxBookingsPerMonth: integer('max_bookings_per_month').notNull().default(1000),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tenantSubscriptions = pgTable(
  'tenant_subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id')
      .notNull()
      .references(() => subscriptionPlans.id),
    status: varchar('status', { length: 31 })
      .notNull()
      .default('active'), // 'active' | 'past_due' | 'cancelled' | 'renewing'
    currentPeriodStart: timestamp('current_period_start', { withTimezone: true })
      .notNull()
      .defaultNow(),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    statusCheck: check(
      'chk_tenant_sub_status',
      sql`${table.status} IN ('active', 'past_due', 'cancelled', 'renewing')`
    ),
  })
);
