import { executeScript } from './index';

export const INIT_SCHEMA_SQL = `
-- 1. TENANTS
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(63) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(31) NOT NULL DEFAULT 'pending_approval' 
        CHECK (status IN ('pending_approval', 'active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. TEMPLES
CREATE TABLE IF NOT EXISTS temples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    slug VARCHAR(63) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    timezone VARCHAR(63) NOT NULL DEFAULT 'Asia/Kolkata',
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(31) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    branding JSONB NOT NULL DEFAULT '{"logoUrl": null, "primaryColor": "#e11d48", "secondaryColor": "#f59e0b", "bannerUrl": null}'::jsonb,
    status VARCHAR(31) NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'published', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_temples_tenant_slug UNIQUE (tenant_id, slug),
    CONSTRAINT uq_temples_tenant_id UNIQUE (tenant_id, id)
);

-- 3. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(31),
    mfa_secret VARCHAR(255),
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    platform_role VARCHAR(31) NOT NULL DEFAULT 'none' 
        CHECK (platform_role IN ('none', 'platform_super_admin', 'platform_support', 'platform_finance')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. TENANT MEMBERSHIPS (RBAC)
CREATE TABLE IF NOT EXISTS tenant_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(31) NOT NULL 
        CHECK (role IN ('trust_admin', 'temple_admin', 'puja_manager', 'priest', 'temple_accountant', 'devotee')),
    assigned_temple_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_user UNIQUE (tenant_id, user_id),
    CONSTRAINT fk_membership_temple FOREIGN KEY (tenant_id, assigned_temple_id) 
        REFERENCES temples(tenant_id, id) ON DELETE SET NULL
);

-- 5. PAYMENT CONFIGURATIONS (DIRECT SETTLEMENT)
CREATE TABLE IF NOT EXISTS payment_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    temple_id UUID NOT NULL,
    provider VARCHAR(31) NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'mock')),
    merchant_account_id VARCHAR(255) NOT NULL,
    onboarding_status VARCHAR(31) NOT NULL DEFAULT 'pending' 
        CHECK (onboarding_status IN ('pending', 'active', 'suspended')),
    credentials_encrypted JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payconfig_temple FOREIGN KEY (tenant_id, temple_id) 
        REFERENCES temples(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_payconfig_temple UNIQUE (tenant_id, temple_id)
);

-- 6. PUJAS
CREATE TABLE IF NOT EXISTS pujas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    temple_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    price_minor INTEGER NOT NULL CHECK (price_minor >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(31) NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pujas_temple FOREIGN KEY (tenant_id, temple_id) 
        REFERENCES temples(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_pujas_tenant_id UNIQUE (tenant_id, id)
);

-- 7. PUJA SLOTS
CREATE TABLE IF NOT EXISTS puja_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    temple_id UUID NOT NULL,
    puja_id UUID NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    booked_capacity INTEGER NOT NULL DEFAULT 0 CHECK (booked_capacity >= 0),
    status VARCHAR(31) NOT NULL DEFAULT 'available' 
        CHECK (status IN ('available', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_slot_capacity CHECK (booked_capacity <= total_capacity),
    CONSTRAINT fk_slots_puja FOREIGN KEY (tenant_id, puja_id) 
        REFERENCES pujas(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_slots_tenant_id UNIQUE (tenant_id, id)
);

-- 8. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    temple_id UUID NOT NULL,
    puja_id UUID NOT NULL,
    slot_id UUID NOT NULL,
    devotee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    devotee_name VARCHAR(255) NOT NULL,
    devotee_email VARCHAR(255) NOT NULL,
    devotee_phone VARCHAR(31) NOT NULL,
    devotee_gotra VARCHAR(127),
    devotee_sankalp TEXT,
    participant_count INTEGER NOT NULL CHECK (participant_count > 0),
    price_snapshot_minor INTEGER NOT NULL CHECK (price_snapshot_minor >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(31) NOT NULL DEFAULT 'pending_payment' 
        CHECK (status IN ('pending_payment', 'confirmed', 'cancelled', 'expired', 'completed')),
    expires_at TIMESTAMPTZ NOT NULL,
    check_in_status VARCHAR(31) NOT NULL DEFAULT 'pending' 
        CHECK (check_in_status IN ('pending', 'checked_in')),
    check_in_at TIMESTAMPTZ,
    check_in_by UUID REFERENCES users(id) ON DELETE SET NULL,
    booking_reference VARCHAR(63) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_temple FOREIGN KEY (tenant_id, temple_id) 
        REFERENCES temples(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_slot FOREIGN KEY (tenant_id, slot_id) 
        REFERENCES puja_slots(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_bookings_tenant_ref UNIQUE (tenant_id, booking_reference),
    CONSTRAINT uq_bookings_tenant_id UNIQUE (tenant_id, id)
);

-- 9. DONATION CAMPAIGNS
CREATE TABLE IF NOT EXISTS donation_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    temple_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    legal_entity_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(31) NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'published', 'closed')),
    min_amount_minor INTEGER NOT NULL DEFAULT 1000 CHECK (min_amount_minor > 0),
    max_amount_minor INTEGER CHECK (max_amount_minor >= min_amount_minor),
    target_amount_minor INTEGER,
    collected_amount_minor INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    tax_exempt_eligible BOOLEAN NOT NULL DEFAULT FALSE,
    tax_exemption_ref VARCHAR(127),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_campaigns_temple FOREIGN KEY (tenant_id, temple_id) 
        REFERENCES temples(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_campaigns_tenant_id UNIQUE (tenant_id, id)
);

-- 10. DONATIONS
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    temple_id UUID NOT NULL,
    campaign_id UUID NOT NULL,
    devotee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(31),
    donor_pan VARCHAR(15),
    amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(31) NOT NULL DEFAULT 'pending_payment' 
        CHECK (status IN ('pending_payment', 'paid', 'failed', 'refunded')),
    paid_at TIMESTAMPTZ,
    donation_reference VARCHAR(63) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_donations_temple FOREIGN KEY (tenant_id, temple_id) 
        REFERENCES temples(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_donations_campaign FOREIGN KEY (tenant_id, campaign_id) 
        REFERENCES donation_campaigns(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_donations_tenant_ref UNIQUE (tenant_id, donation_reference),
    CONSTRAINT uq_donations_tenant_id UNIQUE (tenant_id, id)
);

-- 11. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    temple_id UUID NOT NULL,
    payable_type VARCHAR(31) NOT NULL CHECK (payable_type IN ('booking', 'donation')),
    payable_id UUID NOT NULL,
    provider VARCHAR(31) NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'mock')),
    provider_payment_id VARCHAR(255),
    provider_order_id VARCHAR(255) NOT NULL,
    amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(31) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refund_pending', 'refunded', 'reconciliation_required')),
    provider_fee_minor INTEGER DEFAULT 0,
    settlement_status VARCHAR(31) NOT NULL DEFAULT 'unsettled' 
        CHECK (settlement_status IN ('unsettled', 'settled')),
    settlement_amount_minor INTEGER,
    settled_at TIMESTAMPTZ,
    raw_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_temple FOREIGN KEY (tenant_id, temple_id) 
        REFERENCES temples(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_payments_tenant_id UNIQUE (tenant_id, id)
);

-- 12. WEBHOOK EVENTS (IDEMPOTENCY)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(31) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(127) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    payload JSONB NOT NULL,
    status VARCHAR(31) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processed', 'duplicate', 'failed', 'quarantined')),
    failure_reason TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_webhook_provider_event UNIQUE (provider, event_id)
);

-- 13. REFUNDS
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    requested_by_user_id UUID NOT NULL REFERENCES users(id),
    amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    reason TEXT NOT NULL,
    provider_refund_id VARCHAR(255),
    status VARCHAR(31) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'succeeded', 'failed')),
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. RECEIPTS
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    temple_id UUID NOT NULL,
    donation_id UUID NOT NULL,
    receipt_number VARCHAR(63) NOT NULL,
    issuing_legal_entity VARCHAR(255) NOT NULL,
    receipt_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(31) NOT NULL DEFAULT 'issued' 
        CHECK (status IN ('issued', 'voided', 'corrected')),
    void_reason TEXT,
    previous_receipt_id UUID REFERENCES receipts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_receipts_temple FOREIGN KEY (tenant_id, temple_id) 
        REFERENCES temples(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_receipts_donation FOREIGN KEY (tenant_id, donation_id) 
        REFERENCES donations(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_receipts_tenant_number UNIQUE (tenant_id, receipt_number)
);

-- 15. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role VARCHAR(63) NOT NULL,
    action VARCHAR(127) NOT NULL,
    resource_type VARCHAR(63) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    request_id VARCHAR(63) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    change_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 16. RECONCILIATION EXCEPTIONS
CREATE TABLE IF NOT EXISTS reconciliation_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    provider VARCHAR(31) NOT NULL,
    provider_reference VARCHAR(255),
    internal_reference VARCHAR(255),
    payable_type VARCHAR(31),
    payable_id UUID,
    exception_type VARCHAR(63) NOT NULL 
        CHECK (exception_type IN ('amount_mismatch', 'currency_mismatch', 'late_payment_expired_slot', 'orphan_payment', 'signature_failure')),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 17. CUSTOM DOMAINS (FR-TEN-006, FR-WL-005, AT-09)
CREATE TABLE IF NOT EXISTS custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    temple_id UUID NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    verification_token VARCHAR(255) NOT NULL,
    verification_type VARCHAR(31) NOT NULL DEFAULT 'cname' CHECK (verification_type IN ('cname', 'txt')),
    status VARCHAR(31) NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'active', 'failed')),
    tls_status VARCHAR(31) NOT NULL DEFAULT 'pending' CHECK (tls_status IN ('pending', 'issued', 'failed', 'renewing')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_domain_temple FOREIGN KEY (tenant_id, temple_id) REFERENCES temples(tenant_id, id) ON DELETE CASCADE
);

-- 18. RECURRING PUJA SCHEDULES (FR-PUJA-007)
CREATE TABLE IF NOT EXISTS recurring_puja_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    temple_id UUID NOT NULL,
    puja_id UUID NOT NULL,
    frequency VARCHAR(31) NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
    day_of_week INTEGER,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recurring_puja FOREIGN KEY (tenant_id, puja_id) REFERENCES pujas(tenant_id, id) ON DELETE CASCADE
);

-- 19. FESTIVAL EXCEPTIONS (FR-PUJA-007)
CREATE TABLE IF NOT EXISTS festival_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    temple_id UUID NOT NULL,
    puja_id UUID NOT NULL,
    festival_name VARCHAR(255) NOT NULL,
    exception_date DATE NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    custom_capacity INTEGER,
    custom_start_time TIME,
    custom_end_time TIME,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_festival_puja FOREIGN KEY (tenant_id, puja_id) REFERENCES pujas(tenant_id, id) ON DELETE CASCADE
);

-- 20. SUBSCRIPTION PLANS (FR-REP-006, FR-AUD-006)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(127) NOT NULL,
    price_minor INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    billing_interval VARCHAR(31) NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'yearly')),
    max_temples INTEGER NOT NULL DEFAULT 1,
    max_bookings_per_month INTEGER NOT NULL DEFAULT 1000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 21. TENANT SUBSCRIPTIONS (FR-REP-006, FR-AUD-006)
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(31) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'renewing')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

export const INIT_RLS_SQL = `
-- Helper function to extract current transaction tenant id
CREATE OR REPLACE FUNCTION current_app_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable Row-Level Security
ALTER TABLE temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE puja_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pujas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_puja_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS rls_temples ON temples;
DROP POLICY IF EXISTS rls_pujas ON pujas;
DROP POLICY IF EXISTS rls_puja_slots ON puja_slots;
DROP POLICY IF EXISTS rls_bookings ON bookings;
DROP POLICY IF EXISTS rls_donation_campaigns ON donation_campaigns;
DROP POLICY IF EXISTS rls_donations ON donations;
DROP POLICY IF EXISTS rls_payments ON payments;
DROP POLICY IF EXISTS rls_receipts ON receipts;
DROP POLICY IF EXISTS rls_custom_domains ON custom_domains;
DROP POLICY IF EXISTS rls_recurring_puja_schedules ON recurring_puja_schedules;
DROP POLICY IF EXISTS rls_festival_exceptions ON festival_exceptions;
DROP POLICY IF EXISTS rls_tenant_subscriptions ON tenant_subscriptions;

-- Create Tenant Isolation Policies
CREATE POLICY rls_temples ON temples FOR ALL
    USING (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
    WITH CHECK (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY rls_pujas ON pujas FOR ALL
    USING (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
    WITH CHECK (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY rls_puja_slots ON puja_slots FOR ALL
    USING (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
    WITH CHECK (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY rls_bookings ON bookings FOR ALL
    USING (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
    WITH CHECK (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY rls_donation_campaigns ON donation_campaigns FOR ALL
    USING (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
    WITH CHECK (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY rls_donations ON donations FOR ALL
    USING (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
    WITH CHECK (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY rls_payments ON payments FOR ALL
    USING (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
    WITH CHECK (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY rls_receipts ON receipts FOR ALL
    USING (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
    WITH CHECK (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY rls_custom_domains ON custom_domains FOR ALL
    USING (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
    WITH CHECK (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY rls_recurring_puja_schedules ON recurring_puja_schedules FOR ALL
    USING (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
    WITH CHECK (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY rls_festival_exceptions ON festival_exceptions FOR ALL
    USING (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
    WITH CHECK (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY rls_tenant_subscriptions ON tenant_subscriptions FOR ALL
    USING (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true')
    WITH CHECK (tenant_id = current_app_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');
`;

export async function runMigrations(): Promise<void> {
  await executeScript(INIT_SCHEMA_SQL);
  try {
    await executeScript(INIT_RLS_SQL);
  } catch (err: any) {
    console.warn('[DB MIGRATION] RLS policy notice:', err.message);
  }
}
