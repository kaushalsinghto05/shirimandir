-- ============================================================================
-- SHIRI MANDIR — SQLITE SCHEMA (LOCAL DEVELOPMENT & EMBEDDED TESTING)
-- Identical legal and ethical constraints embedded directly into table definitions
-- Storing money as INTEGER PAISE, NEVER FLOATS
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. USERS & DEVOTEES
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'devotee' CHECK (role IN ('devotee', 'temple_partner', 'admin')),
    gotra TEXT,
    rashi TEXT,
    nakshatra TEXT,
    
    -- COMPLIANCE: Explicit opt-in for personal data sharing with temple partners
    consent_data_sharing INTEGER NOT NULL DEFAULT 0 CHECK (consent_data_sharing IN (0, 1)),
    consent_timestamp TEXT,
    consent_ip_address TEXT,
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. TEMPLES
CREATE TABLE IF NOT EXISTS temples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    deity TEXT NOT NULL,
    location TEXT NOT NULL,
    state TEXT NOT NULL,
    description TEXT NOT NULL,
    history TEXT,
    significance TEXT,
    timings TEXT,
    image_url TEXT NOT NULL,
    banner_url TEXT,
    darshan_stream_url TEXT,
    darshan_stream_status TEXT DEFAULT 'offline' CHECK (darshan_stream_status IN ('live', 'scheduled', 'offline')),
    current_wait_minutes INTEGER DEFAULT 15 CHECK (current_wait_minutes >= 0),
    
    -- COMPLIANCE: Verification status and affiliation document requirement
    verification_status TEXT NOT NULL DEFAULT 'independent' CHECK (verification_status IN ('independent', 'partnered', 'official')),
    affiliation_proof_doc TEXT,
    affiliation_verified_at TEXT,
    affiliation_verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    affiliation_notes TEXT,
    trust_registration_no TEXT,
    
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    -- DB ENFORCEMENT: 'partnered' or 'official' requires signed affiliation proof doc on file
    CHECK (
        verification_status = 'independent' OR 
        (verification_status IN ('partnered', 'official') AND affiliation_proof_doc IS NOT NULL AND length(trim(affiliation_proof_doc)) > 0)
    )
);

-- 3. PUJAS / SEVAS
CREATE TABLE IF NOT EXISTS pujas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temple_id INTEGER NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    deity TEXT NOT NULL,
    description TEXT NOT NULL,
    significance TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    base_price_paise INTEGER NOT NULL CHECK (base_price_paise > 0),
    category TEXT NOT NULL DEFAULT 'special_puja' CHECK (category IN ('maha_puja', 'rudrabhishek', 'archana', 'havan', 'aarti', 'special_puja')),
    max_slots_per_day INTEGER NOT NULL DEFAULT 25 CHECK (max_slots_per_day > 0),
    includes_prasad INTEGER NOT NULL DEFAULT 1 CHECK (includes_prasad IN (0, 1)),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 4. PUJA PACKAGES
CREATE TABLE IF NOT EXISTS puja_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    puja_id INTEGER NOT NULL REFERENCES pujas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    max_devotees INTEGER NOT NULL DEFAULT 1 CHECK (max_devotees > 0),
    price_paise INTEGER NOT NULL CHECK (price_paise > 0),
    created_at TEXT DEFAULT (datetime('now'))
);

-- 5. PRASAD ITEMS
CREATE TABLE IF NOT EXISTS prasad_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temple_id INTEGER NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_paise INTEGER NOT NULL CHECK (price_paise > 0),
    weight_grams INTEGER CHECK (weight_grams > 0),
    ingredients TEXT,
    shelf_life_days INTEGER,
    image_url TEXT NOT NULL,
    
    -- COMPLIANCE: Real inventory only, no fake urgency
    stock_qty INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    
    -- COMPLIANCE: Mandatory 14-digit FSSAI license for edible items
    is_edible INTEGER NOT NULL DEFAULT 1 CHECK (is_edible IN (0, 1)),
    fssai_license_no TEXT,
    fssai_verified_at TEXT,
    fssai_verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1)),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    -- DB ENFORCEMENT: Mandatory FSSAI for edible items
    CHECK (NOT is_edible OR (is_edible AND fssai_license_no IS NOT NULL AND length(trim(fssai_license_no)) >= 14)),
    -- DB ENFORCEMENT: Cannot be active without admin FSSAI approval
    CHECK (NOT (is_edible AND is_active = 1) OR (fssai_license_no IS NOT NULL AND fssai_verified_at IS NOT NULL))
);

-- 6. PUJA BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_code TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    puja_id INTEGER NOT NULL REFERENCES pujas(id) ON DELETE RESTRICT,
    package_id INTEGER REFERENCES puja_packages(id) ON DELETE RESTRICT,
    temple_id INTEGER NOT NULL REFERENCES temples(id) ON DELETE RESTRICT,
    
    scheduled_date TEXT NOT NULL,
    scheduled_time_slot TEXT NOT NULL,
    
    sankalp_name TEXT NOT NULL,
    sankalp_gotra TEXT,
    sankalp_nakshatra TEXT,
    sankalp_rashi TEXT,
    sankalp_intentions TEXT,
    
    -- COMPLIANCE: Explicit opt-in consent for temple partner data transmission
    consent_data_shared INTEGER NOT NULL DEFAULT 0 CHECK (consent_data_shared IN (0, 1)),
    
    -- Itemized Monetary Values in PAISE
    base_amount_paise INTEGER NOT NULL CHECK (base_amount_paise >= 0),
    addons_amount_paise INTEGER NOT NULL DEFAULT 0 CHECK (addons_amount_paise >= 0),
    platform_fee_paise INTEGER NOT NULL DEFAULT 0 CHECK (platform_fee_paise >= 0),
    tax_paise INTEGER NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
    total_amount_paise INTEGER NOT NULL CHECK (total_amount_paise >= 0),

    status TEXT NOT NULL DEFAULT 'confirmed' 
        CHECK (status IN ('pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded')),
    
    -- COMPLIANCE: Proof media required for completion
    proof_media_url TEXT,
    proof_media_type TEXT DEFAULT 'none' CHECK (proof_media_type IN ('none', 'photo', 'video', 'livestream_archive')),
    proof_uploaded_at TEXT,
    proof_uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    proof_notes TEXT,

    cancellation_reason TEXT,
    cancelled_at TEXT,
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    -- DB ENFORCEMENT: Itemized sum arithmetic
    CHECK (total_amount_paise = base_amount_paise + addons_amount_paise + platform_fee_paise + tax_paise),
    -- DB ENFORCEMENT: Cannot mark completed without photo/video proof
    CHECK (status != 'completed' OR (status = 'completed' AND proof_media_url IS NOT NULL AND length(trim(proof_media_url)) > 0))
);

-- 7. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_code TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Itemized Pricing in Integer PAISE
    base_amount_paise INTEGER NOT NULL CHECK (base_amount_paise >= 0),
    shipping_fee_paise INTEGER NOT NULL DEFAULT 0 CHECK (shipping_fee_paise >= 0),
    platform_fee_paise INTEGER NOT NULL DEFAULT 0 CHECK (platform_fee_paise >= 0),
    tax_paise INTEGER NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
    total_amount_paise INTEGER NOT NULL CHECK (total_amount_paise >= 0),
    
    shipping_name TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_address_line1 TEXT NOT NULL,
    shipping_address_line2 TEXT,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_postal_code TEXT NOT NULL,
    
    status TEXT NOT NULL DEFAULT 'pending_payment'
        CHECK (status IN ('pending_payment', 'paid', 'preparing', 'dispatched', 'delivered', 'cancelled', 'refunded')),
    
    tracking_number TEXT,
    courier_partner TEXT,
    dispatched_at TEXT,
    delivered_at TEXT,
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    -- DB ENFORCEMENT: Total must equal sum of base + shipping + platform + tax
    CHECK (total_amount_paise = base_amount_paise + shipping_fee_paise + platform_fee_paise + tax_paise)
);

-- 8. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    prasad_item_id INTEGER NOT NULL REFERENCES prasad_items(id) ON DELETE RESTRICT,
    item_name TEXT NOT NULL,
    unit_price_paise INTEGER NOT NULL CHECK (unit_price_paise > 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal_paise INTEGER NOT NULL CHECK (subtotal_paise > 0),
    fssai_license_no TEXT,
    
    CHECK (subtotal_paise = unit_price_paise * quantity)
);

-- 9. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_code TEXT UNIQUE NOT NULL,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    gateway TEXT NOT NULL DEFAULT 'razorpay' CHECK (gateway IN ('razorpay', 'payu', 'upi_direct')),
    
    gateway_order_id TEXT,
    gateway_payment_id TEXT,
    gateway_signature TEXT,
    
    -- COMPLIANCE: Verified solely via server-side webhook signature
    verified_server_side INTEGER NOT NULL DEFAULT 0 CHECK (verified_server_side IN (0, 1)),
    webhook_event_id TEXT,
    signature_verified_at TEXT,
    raw_webhook_payload TEXT,
    
    status TEXT NOT NULL DEFAULT 'created' 
        CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 10. REFUND REQUESTS
CREATE TABLE IF NOT EXISTS refund_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    refund_code TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
    
    requested_amount_paise INTEGER NOT NULL CHECK (requested_amount_paise > 0),
    eligible_amount_paise INTEGER NOT NULL CHECK (eligible_amount_paise >= 0),
    deduction_fee_paise INTEGER NOT NULL DEFAULT 0 CHECK (deduction_fee_paise >= 0),
    
    reason TEXT NOT NULL,
    policy_tier TEXT NOT NULL,
    cancellation_rules_accepted INTEGER NOT NULL DEFAULT 1 CHECK (cancellation_rules_accepted IN (0, 1)),
    
    status TEXT NOT NULL DEFAULT 'requested' 
        CHECK (status IN ('requested', 'approved', 'rejected', 'processed')),
    
    admin_notes TEXT,
    processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    processed_at TEXT,
    gateway_refund_id TEXT,
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
