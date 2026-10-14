-- ============================================================================
-- SHIRI MANDIR — PRODUCTION POSTGRESQL DATABASE SCHEMA
-- Ethical & Legal Compliance Embedded at the Data Model Level
-- Money is stored exclusively in INTEGER PAISE (1 INR = 100 paise)
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & DEVOTEES
-- Compliance: users.consent_data_sharing defaults to false (explicit opt-in only)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL DEFAULT '',
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL DEFAULT 'devotee' CHECK (role IN ('devotee', 'admin', 'super_admin', 'temple_partner')),
    gotra VARCHAR(100),
    rashi VARCHAR(100),
    nakshatra VARCHAR(100),
    profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- COMPLIANCE: Explicit opt-in for personal data sharing with temple partners
    consent_data_sharing BOOLEAN NOT NULL DEFAULT FALSE,
    consent_timestamp TIMESTAMP WITH TIME ZONE,
    consent_ip_address VARCHAR(45),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TEMPLES
-- Compliance: verification_status can ONLY be 'partnered' or 'official' if affiliation_proof_doc is present.
CREATE TABLE IF NOT EXISTS temples (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    deity VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    history TEXT,
    significance TEXT,
    timings VARCHAR(255),
    image_url TEXT NOT NULL,
    banner_url TEXT,
    darshan_stream_url TEXT,
    darshan_stream_status VARCHAR(50) DEFAULT 'offline' CHECK (darshan_stream_status IN ('live', 'scheduled', 'offline')),
    current_wait_minutes INTEGER DEFAULT 15 CHECK (current_wait_minutes >= 0),
    
    -- COMPLIANCE: Temple Affiliation Transparency
    verification_status VARCHAR(30) NOT NULL DEFAULT 'independent' 
        CHECK (verification_status IN ('independent', 'partnered', 'official')),
    affiliation_proof_doc TEXT,
    affiliation_verified_at TIMESTAMP WITH TIME ZONE,
    affiliation_verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    affiliation_notes TEXT,
    trust_registration_no VARCHAR(100),
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- ENFORCED BY DB ENGINE: Cannot claim partnered/official status without documented legal proof
    CONSTRAINT chk_temple_affiliation_proof CHECK (
        verification_status = 'independent' OR 
        (verification_status IN ('partnered', 'official') AND affiliation_proof_doc IS NOT NULL AND length(trim(affiliation_proof_doc)) > 0)
    )
);

-- 3. PUJAS / SEVAS OFFERED
CREATE TABLE IF NOT EXISTS pujas (
    id SERIAL PRIMARY KEY,
    temple_id INTEGER NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    deity VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    significance TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    base_price_paise INTEGER NOT NULL CHECK (base_price_paise > 0),
    category VARCHAR(80) NOT NULL DEFAULT 'special_puja' 
        CHECK (category IN ('maha_puja', 'rudrabhishek', 'archana', 'havan', 'aarti', 'special_puja')),
    max_slots_per_day INTEGER NOT NULL DEFAULT 25 CHECK (max_slots_per_day > 0),
    includes_prasad BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PUJA PACKAGES (e.g. Individual, Couple, Family of 4)
CREATE TABLE IF NOT EXISTS puja_packages (
    id SERIAL PRIMARY KEY,
    puja_id INTEGER NOT NULL REFERENCES pujas(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    max_devotees INTEGER NOT NULL DEFAULT 1 CHECK (max_devotees > 0),
    price_paise INTEGER NOT NULL CHECK (price_paise > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRASAD ITEMS
-- Compliance: is_edible items MUST have a valid 14-digit FSSAI license no and admin approval before activation.
-- Inventory: Real stock only, no fake urgency.
CREATE TABLE IF NOT EXISTS prasad_items (
    id SERIAL PRIMARY KEY,
    temple_id INTEGER NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price_paise INTEGER NOT NULL CHECK (price_paise > 0),
    weight_grams INTEGER CHECK (weight_grams > 0),
    ingredients TEXT,
    shelf_life_days INTEGER,
    image_url TEXT NOT NULL,
    
    -- COMPLIANCE: Real inventory, no fake urgency
    stock_qty INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    
    -- COMPLIANCE: Food Safety & Standards Authority of India (FSSAI)
    is_edible BOOLEAN NOT NULL DEFAULT TRUE,
    fssai_license_no VARCHAR(50),
    fssai_verified_at TIMESTAMP WITH TIME ZONE,
    fssai_verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- ENFORCED BY DB ENGINE: Edible items must provide FSSAI license
    CONSTRAINT chk_edible_fssai_mandatory CHECK (
        NOT is_edible OR (is_edible AND fssai_license_no IS NOT NULL AND length(trim(fssai_license_no)) >= 14)
    ),
    -- ENFORCED BY DB ENGINE: Cannot be active without admin FSSAI verification
    CONSTRAINT chk_edible_active_verified CHECK (
        NOT (is_edible AND is_active) OR (fssai_license_no IS NOT NULL AND fssai_verified_at IS NOT NULL)
    )
);

-- 6. PUJA BOOKINGS
-- Compliance: Status 'completed' requires proof_media_url to guarantee service delivery.
-- Consent: Devotee data sharing opt-in tracked per booking.
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_code VARCHAR(32) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    puja_id INTEGER NOT NULL REFERENCES pujas(id) ON DELETE RESTRICT,
    package_id INTEGER REFERENCES puja_packages(id) ON DELETE RESTRICT,
    temple_id INTEGER NOT NULL REFERENCES temples(id) ON DELETE RESTRICT,
    
    scheduled_date DATE NOT NULL,
    scheduled_time_slot VARCHAR(50) NOT NULL,
    
    -- Devotee Sankalp Ritual Info
    sankalp_name VARCHAR(150) NOT NULL,
    sankalp_gotra VARCHAR(100),
    sankalp_nakshatra VARCHAR(100),
    sankalp_rashi VARCHAR(100),
    sankalp_intentions TEXT,
    
    -- COMPLIANCE: Explicit consent to transmit personal ritual details to temple partner
    consent_data_shared BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Itemized Monetary Values in PAISE
    base_amount_paise INTEGER NOT NULL CHECK (base_amount_paise >= 0),
    addons_amount_paise INTEGER NOT NULL DEFAULT 0 CHECK (addons_amount_paise >= 0),
    platform_fee_paise INTEGER NOT NULL DEFAULT 0 CHECK (platform_fee_paise >= 0),
    tax_paise INTEGER NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
    total_amount_paise INTEGER NOT NULL CHECK (total_amount_paise >= 0),

    status VARCHAR(30) NOT NULL DEFAULT 'confirmed' 
        CHECK (status IN ('pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded')),
    
    -- COMPLIANCE: Proof-of-Service media required to mark completed
    proof_media_url TEXT,
    proof_media_type VARCHAR(30) DEFAULT 'none' CHECK (proof_media_type IN ('none', 'photo', 'video', 'livestream_archive')),
    proof_uploaded_at TIMESTAMP WITH TIME ZONE,
    proof_uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    proof_notes TEXT,

    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- ENFORCED BY DB ENGINE: Itemized sum arithmetic
    CONSTRAINT chk_booking_total_math CHECK (
        total_amount_paise = base_amount_paise + addons_amount_paise + platform_fee_paise + tax_paise
    ),
    -- ENFORCED BY DB ENGINE: Proof required for completion
    CONSTRAINT chk_booking_proof_completion CHECK (
        status != 'completed' OR (status = 'completed' AND proof_media_url IS NOT NULL AND length(trim(proof_media_url)) > 0)
    )
);

-- 7. ORDERS (PRASAD & SACRED SEVA MERCHANDISE)
-- Compliance: Full itemized breakdown returned & shown before payment. No hidden charges.
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(32) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Itemized Pricing in Integer PAISE
    base_amount_paise INTEGER NOT NULL CHECK (base_amount_paise >= 0),
    shipping_fee_paise INTEGER NOT NULL DEFAULT 0 CHECK (shipping_fee_paise >= 0),
    platform_fee_paise INTEGER NOT NULL DEFAULT 0 CHECK (platform_fee_paise >= 0),
    tax_paise INTEGER NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
    total_amount_paise INTEGER NOT NULL CHECK (total_amount_paise >= 0),
    
    -- Shipping Details
    shipping_name VARCHAR(150) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address_line1 TEXT NOT NULL,
    shipping_address_line2 TEXT,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    
    status VARCHAR(30) NOT NULL DEFAULT 'pending_payment'
        CHECK (status IN ('pending_payment', 'paid', 'preparing', 'dispatched', 'delivered', 'cancelled', 'refunded')),
    
    tracking_number VARCHAR(100),
    courier_partner VARCHAR(100),
    dispatched_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- ENFORCED BY DB ENGINE: Itemized sum arithmetic
    CONSTRAINT chk_order_breakdown_math CHECK (
        total_amount_paise = base_amount_paise + shipping_fee_paise + platform_fee_paise + tax_paise
    )
);

-- 8. ORDER ITEMS (Itemized lines)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    prasad_item_id INTEGER NOT NULL REFERENCES prasad_items(id) ON DELETE RESTRICT,
    item_name VARCHAR(200) NOT NULL,
    unit_price_paise INTEGER NOT NULL CHECK (unit_price_paise > 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal_paise INTEGER NOT NULL CHECK (subtotal_paise > 0),
    fssai_license_no VARCHAR(50),
    
    CONSTRAINT chk_order_item_subtotal CHECK (subtotal_paise = unit_price_paise * quantity)
);

-- 9. PAYMENTS
-- Compliance: verified_server_side is ONLY true after webhook HMAC signature validation.
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_code VARCHAR(32) UNIQUE NOT NULL,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    gateway VARCHAR(30) NOT NULL DEFAULT 'razorpay' CHECK (gateway IN ('razorpay', 'payu', 'upi_direct')),
    
    gateway_order_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    gateway_signature VARCHAR(255),
    
    -- COMPLIANCE: Never trusted from client. Set solely via server-side webhook signature validation.
    verified_server_side BOOLEAN NOT NULL DEFAULT FALSE,
    webhook_event_id VARCHAR(150),
    signature_verified_at TIMESTAMP WITH TIME ZONE,
    raw_webhook_payload TEXT,
    
    status VARCHAR(30) NOT NULL DEFAULT 'created' 
        CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. REFUND REQUESTS & CANCELLATION POLICIES
-- Compliance: Structured refund management with policy auto-enforcement and audit log.
CREATE TABLE IF NOT EXISTS refund_requests (
    id SERIAL PRIMARY KEY,
    refund_code VARCHAR(32) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
    
    requested_amount_paise INTEGER NOT NULL CHECK (requested_amount_paise > 0),
    eligible_amount_paise INTEGER NOT NULL CHECK (eligible_amount_paise >= 0),
    deduction_fee_paise INTEGER NOT NULL DEFAULT 0 CHECK (deduction_fee_paise >= 0),
    
    reason TEXT NOT NULL,
    policy_tier VARCHAR(80) NOT NULL, -- e.g. '>48h_full_refund', '24-48h_partial_50', '<24h_non_refundable', 'pre_dispatch_prasad'
    cancellation_rules_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    
    status VARCHAR(30) NOT NULL DEFAULT 'requested' 
        CHECK (status IN ('requested', 'approved', 'rejected', 'processed')),
    
    admin_notes TEXT,
    processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    gateway_refund_id VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR FAST AUDIT & QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_temples_verification ON temples(verification_status);
CREATE INDEX IF NOT EXISTS idx_prasad_fssai ON prasad_items(fssai_license_no);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_verified ON payments(verified_server_side);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refund_requests(status);
