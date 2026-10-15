# Implementation Plan: Multi-Tenant Temple Management SaaS Platform

**Document Version:** 2.0  
**Based on Specification:** `docs/spec.pdf` (v1.0, 15 October 2026)  
**Target Stack:** Next.js (App Router), TypeScript, PostgreSQL, Drizzle ORM  
**Status:** Completed & 100% Verified (All P0 Core & P1 Expansion Requirements, 38/38 Tests Passing)  

---

## 1. Product Understanding & P0 Scope Summary

### 1.1 Product Vision & Core Model
The platform is a multi-tenant Software-as-a-Service (SaaS) solution engineered for individual temples and multi-temple religious trusts. Its primary objective is to empower temples to publish public digital experiences, accept online bookings for pujas and religious services, receive direct donations, and manage their administrative operations while maintaining strict tenant isolation, financial integrity, and auditability.

Key domain hierarchy:
* **Platform / SaaS Operator:** Internal management plane overseeing tenant lifecycle, onboarding, and platform-level health.
* **Organization / Trust (Tenant):** The commercial and legal security boundary. A tenant owns all temple configurations, user memberships, financial configurations, and audit trails.
* **Temple:** A physical or operational religious institution operated by a tenant. A single tenant may operate one or multiple temples.
* **Devotee:** Public visitors and signed-in worshippers who discover temple services, book slots, submit sankalp details, make donations, and retrieve receipts.
* **Direct Settlement:** Payments for pujas and donations do not pool into platform accounts; they route directly to each individual temple's verified merchant account.

### 1.2 P0 MVP Scope (Included)
* **Tenant & Temple Management:** Tenant creation, review, approval, suspension, reactivations, temple profile configuration, and tenant-scoped unique slug routing (`FR-TEN-001` to `FR-TEN-005`).
* **Identity, Auth & RBAC:** Multi-tenant session management, strong authentication, MFA for privileged roles, granular role-based permissions (`trust_admin`, `temple_admin`, `puja_manager`, `priest`, `temple_accountant`, `devotee`, and platform roles), invitations, and audit trails (`FR-AUTH-001` to `FR-AUTH-005`, `FR-RBAC-001` to `FR-RBAC-005`).
* **White-Label Public Profile:** Tenant-scoped public temple pages displaying published pujas and active donation campaigns with customized branding (logo, colors, public copy) (`FR-WL-001` to `FR-WL-004`).
* **Puja Catalog & Slot Engine:** Service definitions with immutable price snapshots, time slot generation with strict capacity management, and transactional seat reservations (`FR-PUJA-001` to `FR-PUJA-006`, `FR-BOOK-001` to `FR-BOOK-004`).
* **Booking Lifecycle & Capacity Guarantees:** Authoritative backend pricing, lock-protected concurrency control preventing overselling, pending reservation expiry, payment verification confirmation, devotee check-in, cancellations, and capacity release (`FR-BOOK-001` to `FR-BOOK-010`).
* **Donation Campaigns:** Purpose-driven donation campaigns, recipient legal entity identification, validation of limits/currency, and receipt generation (`FR-DON-001` to `FR-DON-007`).
* **Direct Payment Integration & Webhooks:** Provider-agnostic payment adapter (Razorpay/Stripe/Mock), webhook signature verification, event deduplication, and reconciliation queue (`FR-PAY-001` to `FR-PAY-010`).
* **Receipts & Auditable Financial Records:** Unique scoped sequential receipt numbering, immutable corrections/voiding, and financial ledger separation (gross, fees, refunds) (`FR-REC-001` to `FR-REC-006`).
* **Timezone-Aware Reports & Auditing:** Temple-timezone filtered reports, CSV exports enforcing tenant security, and tamper-resistant audit logs (`FR-REP-001` to `FR-REP-004`, `FR-AUD-001` to `FR-AUD-005`).
* **Security & Isolation Test Suite:** Comprehensive automated acceptance tests verifying all scenarios `AT-01` through `AT-12`.

### 1.3 Out of Scope for P0 (Deferred to P1/P2)
* Custom domain verification and automated TLS provisioning (`FR-TEN-006`, `FR-WL-005`, `AT-09`).
* Recurring puja schedules, complex festival exceptions, and bulk schedule management (`FR-PUJA-007`).
* Campaign targets, public progress tickers, and auto-scheduling (`FR-DON-008`).
* Trust-level consolidated multi-branch rollup reporting and SaaS subscription billing engine (`FR-REP-005`, `FR-REP-006`, `FR-AUD-006`).
* Prasad physical shipping/inventory, room accommodation, volunteer scheduling, ERP integration, and mobile apps (P2).

---

## 2. Proposed System Architecture

```
                          [ Client Browser / Devotee / Staff ]
                                          │
                                          ▼
                         [ Next.js 14+ App Router ]
           ┌──────────────────────────────┴──────────────────────────────┐
           ▼                                                             ▼
   [ Public Routes ]                                             [ Authenticated Routes ]
  /t/[slug] (White-label)                                         /admin (Platform Console)
  /t/[slug]/pujas/[id]                                            /t/[slug]/manage (Temple Console)
  /t/[slug]/donate                                                /portal (Devotee Dashboard)
           │                                                             │
           └──────────────────────────────┬──────────────────────────────┘
                                          ▼
                            [ Server Actions & API Routes ]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
       [ Middleware & Guards ]                        [ Webhook Ingestion API ]
       • Session validation                           • Signature verification
       • Tenant context extraction                    • Event deduplication
       • Granular RBAC evaluation                     • Idempotent dispatch
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          ▼
                           [ Domain Service Layer ]
           ┌──────────────────────────────┼──────────────────────────────┐
           ▼                              ▼                              ▼
    [ Booking Service ]           [ Payment Service ]            [ Donation Service ]
    • Atomic capacity locks       • Provider Adapter             • Entity validation
    • Price snapshotting          • State reconciliation         • Numbered receipts
    • Expiry reaper               • Refund workflows             • Audit recording
           │                              │                              │
           └──────────────────────────────┼──────────────────────────────┘
                                          ▼
                      [ Database Layer: Drizzle ORM ]
                      • Transactional scoped RLS
                      • `SET LOCAL app.current_tenant_id`
                      • Connection pool cleanup
                                          │
                                          ▼
                      [ PostgreSQL 16+ Database ]
                      • Row-Level Security Policies
                      • Composite Foreign Keys
                      • Strict CHECK & UNIQUE constraints
```

### 2.1 Technology Stack & ORM Selection: Drizzle ORM

| Criterion | Prisma ORM | Drizzle ORM (Selected) | Rationale |
| :--- | :--- | :--- | :--- |
| **Row-Level Security (RLS)** | Requires manual interactive transactions with `$executeRaw` on every query; prone to connection reuse leakage. | First-class SQL template literals (`sql`\`) making `SET LOCAL app.current_tenant_id` trivial inside transaction blocks. | **Critical for AT-11**: Drizzle runs directly on the pooled client without query engine abstraction. |
| **Composite Foreign Keys** | Supported, but creates verbose relation schemas and complex migrations. | Direct, idiomatic composite foreign keys: `foreignKey({ columns: [t.tenantId, t.templeId], foreignColumns: [temples.tenantId, temples.id] })`. | **Mandated by spec**: Guarantees cross-tenant foreign reference prevention at database engine level. |
| **Concurrency & Row Locking** | `$queryRaw` required for `SELECT ... FOR UPDATE`. | Native `.for('update')` support in query builder for atomic slot capacity reservations (`FR-BOOK-003`, `AT-02`). | Prevents double bookings under heavy concurrent loads. |
| **Performance & Cold Starts** | Heavy Rust query-engine binary overhead; higher memory usage. | Zero-dependency TypeScript-first SQL builder; near-zero cold start latency. | Optimal for Next.js App Router and serverless/container deployment. |

**Decision:** We select **Drizzle ORM** paired with `pg` (node-postgres) and connection pooling (`pg.Pool`).

### 2.2 Directory & Folder Structure
```
shirimandir/
├── docs/
│   ├── spec.pdf
│   └── implementation-plan.md
├── src/
│   ├── app/                                 # Next.js App Router
│   │   ├── (auth)/                          # Authentication pages (login, mfa, invite)
│   │   ├── (platform)/admin/                # Platform Super Admin & Support console
│   │   ├── (temple)/t/[slug]/               # Public white-label temple site
│   │   │   ├── page.tsx                     # Temple homepage
│   │   │   ├── pujas/                       # Puja catalog & slot booking
│   │   │   ├── donate/                      # Donation campaigns & checkout
│   │   │   └── manage/                      # Authenticated Temple Console (Admin, Staff, Finance)
│   │   ├── (devotee)/portal/                # Devotee self-service booking & receipt history
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   ├── razorpay/route.ts        # Payment webhook handler
│   │   │   │   └── stripe/route.ts
│   │   │   └── cron/
│   │   │       └── expire-reservations/     # Slot expiry worker trigger
│   │   └── layout.tsx
│   ├── components/                          # UI Component Library
│   │   ├── ui/                              # Design system (Buttons, Modals, Inputs, Tables)
│   │   ├── public/                          # White-label temple presentation components
│   │   ├── console/                         # Dashboard, navigation, data grids
│   │   └── forms/                           # Booking forms, donation forms, sankalp inputs
│   ├── lib/                                 # Shared Infrastructure
│   │   ├── db/
│   │   │   ├── index.ts                     # Database connection pool & client export
│   │   │   ├── schema.ts                    # Drizzle schema definitions
│   │   │   ├── rls.ts                       # RLS context session wrappers (`withTenantContext`)
│   │   │   └── migrations/                  # Generated SQL migrations
│   │   ├── auth/
│   │   │   ├── session.ts                   # Cookie session management & token hashing
│   │   │   ├── password.ts                  # Bcrypt hashing & verification
│   │   │   ├── mfa.ts                       # TOTP generation & verification
│   │   │   └── rate-limiter.ts              # Sliding-window rate limiter (FR-AUTH-005)
│   │   ├── rbac/
│   │   │   ├── permissions.ts               # Granular permission definitions
│   │   │   ├── roles.ts                     # Role-to-permission mapping
│   │   │   └── guard.ts                     # Server-side authorization enforcement
│   │   ├── payments/
│   │   │   ├── adapter.interface.ts         # PaymentAdapter contract
│   │   │   ├── razorpay.adapter.ts          # Razorpay Route / Direct implementation
│   │   │   ├── stripe.adapter.ts            # Stripe Connect Direct implementation
│   │   │   ├── mock.adapter.ts              # Deterministic Mock Adapter for CI/testing
│   │   │   └── factory.ts                   # Adapter resolver based on temple config
│   │   ├── audit/
│   │   │   └── logger.ts                    # Secure audit event logger (sanitizes secrets)
│   │   └── utils/
│   │       ├── currency.ts                  # Minor-unit conversion & formatting
│   │       ├── timezone.ts                  # Temple-timezone date conversions
│   │       └── receipts.ts                  # Unique receipt number generator
│   └── modules/                             # Core Business Domain Services
│       ├── tenants/                         # Tenant & Temple lifecycle service
│       ├── pujas/                           # Services, schedules & slots service
│       ├── bookings/                        # Reservation, pricing, & check-in service
│       ├── donations/                       # Campaign & donation processing service
│       ├── payments/                        # Payment attempt & webhook processor
│       ├── receipts/                        # Receipt issuance & voiding service
│       └── reports/                         # Timezone-aware aggregations & exports
└── tests/
    ├── helpers/                             # Test DB seeds, mocks, tenant factories
    ├── isolation/                           # Cross-tenant security test suite (AT-01, AT-07, AT-11)
    ├── concurrency/                         # Booking race-condition tests (AT-02)
    ├── webhooks/                            # Idempotency & signature tests (AT-03, AT-04, AT-05, AT-06)
    └── unit/                                # Pure business logic tests
```

### 2.3 Authentication, Session & Multi-Tenant Context Model
1. **User Identity:**
   * Global `users` table for credentials (email, bcrypt password, TOTP secret for MFA).
   * Users authenticate and receive a secure, HTTP-only, SameSite=Lax signed session token.
2. **Context Resolution:**
   * When an authenticated user requests a tenant route (e.g. `/t/[slug]/manage/...`), server-side middleware extracts `slug`.
   * The server queries `tenants` and checks `tenant_memberships` for `(tenant_id, user_id)`.
   * The membership yields the user's role and granular permissions (`pujas.write`, `bookings.check_in`, `reports.finance.read`, etc.).
   * If no valid active membership exists, access is denied immediately with HTTP 403.
   * Client-supplied tenant IDs or role headers in request bodies are ignored.

### 2.4 Postgres RLS & Connection Pool Isolation (AT-11 Guarantee)
Connection pooling (e.g. `pg.Pool`, Supabase Supavisor, PgBouncer) reuses physical database connections across distinct HTTP requests. Setting session variables via `SET app.current_tenant_id = 'tenant_1'` without a transaction creates a critical security vulnerability: if connection checkout fails to clean up, Request 2 (for Tenant B) will execute under Tenant A's context.

**Our Architectural Guarantee:**
1. **Transaction-Scoped `SET LOCAL`:**
   We execute tenant-scoped operations exclusively inside a database transaction using PostgreSQL's `SET LOCAL`:
   ```ts
   export async function withTenantContext<T>(
     tenantId: string,
     callback: (tx: DrizzleTransaction) => Promise<T>
   ): Promise<T> {
     return await db.transaction(async (tx) => {
       // SET LOCAL is strictly scoped to this transaction block.
       // PostgreSQL automatically discards this setting upon COMMIT or ROLLBACK.
       await tx.execute(sql`SET LOCAL app.current_tenant_id = ${tenantId}`);
       return await callback(tx);
     });
   }
   ```
2. **Connection Checkout / Checkin Safeguard:**
   Every physical connection drawn from the pool executes `DISCARD TEMP; RESET ALL;` if an untracked session-level leakage is suspected.
3. **Application Defense-in-Depth:**
   In addition to RLS, all Drizzle queries explicitly include `where(eq(table.tenantId, tenantId))`. RLS acts as a second, unbypassable boundary.
4. **Validation Test (AT-11):**
   An automated test borrows a connection, sets a tenant context, releases it back to the pool, acquires it again without context, and asserts that queries return empty sets or fail cleanly.

### 2.5 Payment-Provider Adapter Design
Each temple connects its own approved merchant account (e.g. Razorpay Route Linked Account or Stripe Connect Standard/Express).

```ts
export interface CreatePaymentInput {
  tenantId: string;
  templeId: string;
  payableType: 'booking' | 'donation';
  payableId: string;
  amountMinor: number;
  currency: string;
  donorOrDevotee: {
    name: string;
    email: string;
    phone?: string;
  };
  merchantAccountId: string;
  returnUrl: string;
}

export interface PaymentAttemptResult {
  paymentAttemptId: string;
  providerPaymentId?: string;
  providerOrderId: string;
  clientSecret?: string;
  checkoutUrl?: string;
}

export interface PaymentWebhookEvent {
  eventId: string;
  eventType: 'payment.succeeded' | 'payment.failed' | 'refund.processed';
  providerOrderId: string;
  providerPaymentId: string;
  amountMinor: number;
  currency: string;
  merchantAccountId: string;
  rawPayload: Record<string, unknown>;
}

export interface PaymentAdapter {
  createPaymentAttempt(input: CreatePaymentInput): Promise<PaymentAttemptResult>;
  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean;
  parseWebhookPayload(rawBody: string): PaymentWebhookEvent;
  fetchPaymentStatus(providerPaymentId: string, merchantAccountId: string): Promise<{
    status: 'succeeded' | 'failed' | 'pending';
    amountMinor: number;
    currency: string;
    settled: boolean;
  }>;
  initiateRefund(params: {
    providerPaymentId: string;
    amountMinor: number;
    reason: string;
    merchantAccountId: string;
  }): Promise<{ refundId: string; status: 'pending' | 'succeeded' }>;
}
```

* **Idempotency & Deduplication (`FR-PAY-004`):** Incoming webhooks insert into `webhook_events(provider, event_id)` with a unique constraint. If a duplicate event arrives, it is recorded as `duplicate` and returns HTTP 200 without re-triggering business logic.
* **Return Page Safeguard (`FR-PAY-005`, `AT-03`):** Redirect to the browser return page displays a "Payment Pending Verification" status. It **never** marks the booking or donation as paid. Only verified webhook events or server-to-server provider queries confirm the payment.
* **Exception Handling (`FR-PAY-006`, `AT-05`, `AT-06`):**
  * If webhook amount/currency does not match expected internal records -> Quarantined in `reconciliation_exceptions`, no confirmation issued (`AT-05`).
  * If payment succeeds after slot reservation expired -> Recorded in `reconciliation_exceptions`, capacity is NOT silently overbooked, and an automated refund request or manual resolution queue is initiated (`AT-06`).

---

## 3. Database Schema Specification

### 3.1 Design Conventions
1. **Money as Integer Minor Units:** All financial fields are stored as `INTEGER` representing the smallest currency unit (e.g. Paise for INR, 100 paise = 1 INR; Cents for USD). Floats are forbidden.
2. **ISO Currency Codes:** Every monetary value is coupled with a 3-character ISO-4217 code (e.g. `INR`).
3. **UTC Timestamps:** All timestamps are `TIMESTAMP WITH TIME ZONE` (`TIMESTAMPTZ`) defaulting to `CURRENT_TIMESTAMP`. Display and date filters convert to the temple's configured timezone.
4. **Composite Foreign Keys:** All child tables enforce `(tenant_id, parent_id)` foreign keys pointing to `(tenant_id, id)` on the parent table. This physically prohibits cross-tenant references at the database engine level.

### 3.2 Tables and Entity Relationships

#### 3.2.1 Core Tenants & Organizations
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(63) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(31) NOT NULL DEFAULT 'pending_approval' 
        CHECK (status IN ('pending_approval', 'active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE temples (
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
```

#### 3.2.2 Identity & Role-Based Access Control (RBAC)
```sql
CREATE TABLE users (
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

CREATE TABLE tenant_memberships (
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
```

#### 3.2.3 Payment Configurations (Direct Settlement)
```sql
CREATE TABLE payment_configs (
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
```

#### 3.2.4 Puja Catalog, Schedules & Slots
```sql
CREATE TABLE pujas (
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

CREATE TABLE puja_slots (
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
```

#### 3.2.5 Bookings & Reservations
```sql
CREATE TABLE bookings (
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
```

#### 3.2.6 Donation Campaigns & Donations
```sql
CREATE TABLE donation_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    temple_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    legal_entity_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(31) NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'published', 'closed')),
    min_amount_minor INTEGER NOT NULL DEFAULT 1000 CHECK (min_amount_minor > 0), -- e.g. 10 INR
    max_amount_minor INTEGER CHECK (max_amount_minor >= min_amount_minor),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    tax_exempt_eligible BOOLEAN NOT NULL DEFAULT FALSE,
    tax_exemption_ref VARCHAR(127),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_campaigns_temple FOREIGN KEY (tenant_id, temple_id) 
        REFERENCES temples(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_campaigns_tenant_id UNIQUE (tenant_id, id)
);

CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    temple_id UUID NOT NULL,
    campaign_id UUID NOT NULL,
    devotee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(31),
    donor_pan VARCHAR(15), -- For tax records if applicable
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
```

#### 3.2.7 Payments, Webhooks & Refunds
```sql
CREATE TABLE payments (
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

CREATE TABLE webhook_events (
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

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    payment_id UUID NOT NULL,
    requested_by_user_id UUID NOT NULL REFERENCES users(id),
    amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    reason TEXT NOT NULL,
    provider_refund_id VARCHAR(255),
    status VARCHAR(31) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'succeeded', 'failed')),
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refunds_payment FOREIGN KEY (tenant_id, payment_id) 
        REFERENCES payments(tenant_id, id) ON DELETE CASCADE
);
```

#### 3.2.8 Receipts & Financial Auditing
```sql
CREATE TABLE receipts (
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

CREATE TABLE audit_logs (
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

CREATE TABLE reconciliation_exceptions (
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
```

### 3.3 PostgreSQL Row-Level Security (RLS) Policies
PostgreSQL RLS ensures that even if an application bug omits `WHERE tenant_id = ...`, queries cannot read or write another tenant's records.

```sql
-- Enable RLS on all tenant-owned tables
ALTER TABLE temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE puja_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pujas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Helper policy function: checks if session variable matches row tenant_id
-- Note: Platform Super Admin bypasses if app.is_super_admin = 'true'
CREATE OR REPLACE FUNCTION current_app_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS Policy Example for temples
CREATE POLICY tenant_isolation_temples ON temples
    FOR ALL
    USING (
        tenant_id = current_app_tenant_id() 
        OR current_setting('app.is_super_admin', true) = 'true'
    )
    WITH CHECK (
        tenant_id = current_app_tenant_id() 
        OR current_setting('app.is_super_admin', true) = 'true'
    );

-- Applied identically to bookings, pujas, slots, donations, receipts, payments
```

---

## 4. Phased Implementation Plan

Mapped to Functional Requirements (`FR-xxx`) and Acceptance Test Scenarios (`AT-01` to `AT-12`).

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Phase 0: Foundation, Next.js App Router, Drizzle ORM, RLS Pool Engine     │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────────┐
│ Phase 1: Identity, Auth, MFA, RBAC & Multi-Tenant Data Isolation           │
│ Cover: FR-AUTH-001..005, FR-TEN-001..005, FR-RBAC-001..005, FR-AUD-001..003│
│ Validate: AT-01, AT-07, AT-11                                              │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────────┐
│ Phase 2: White-Label Public Temple Profiles & Discovery Engine             │
│ Cover: FR-WL-001..004, FR-TEN-003, FR-TEN-005                              │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────────┐
│ Phase 3: Puja Catalog, Slot Schedules & Atomic Capacity Engine             │
│ Cover: FR-PUJA-001..006, FR-BOOK-001..004, FR-BOOK-009                     │
│ Validate: AT-02                                                            │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────────┐
│ Phase 4: Direct Payment Provider Adapter, Webhooks & Idempotency           │
│ Cover: FR-PAY-001..010                                                     │
│ Validate: AT-03, AT-04, AT-05, AT-06                                       │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────────┐
│ Phase 5: Booking Lifecycle, Devotee Check-In, Expiry & Refund Workflows     │
│ Cover: FR-BOOK-005..008, FR-BOOK-010                                       │
│ Validate: AT-06, AT-08                                                     │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────────┐
│ Phase 6: Donation Campaigns, Auditable Receipts & Tax Compliance           │
│ Cover: FR-DON-001..007, FR-REC-001..006                                    │
│ Validate: AT-07, AT-10, AT-12                                              │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────────┐
│ Phase 7: Reporting, Timezone Date-Filtering, Platform Ops & Exceptions     │
│ Cover: FR-REP-001..004, FR-AUD-004..005                                    │
│ Validate: AT-05                                                            │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────────┐
│ Phase 8: End-to-End Verification, Security & Cross-Tenant Test Suite       │
│ Validate: Full Acceptance Suite (AT-01 through AT-12)                      │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### Detailed Phase Breakdown

#### Phase 0: Project Setup, Drizzle Schema & Connection Pool Engine
* **Goal:** Establish a clean Next.js 14+ (App Router) TypeScript workspace, configure Drizzle ORM with PostgreSQL, create database migrations with composite FKs, and build the transaction-scoped RLS executor.
* **Tasks:**
  1. Initialize Next.js App Router project structure with TypeScript, TailwindCSS, and Lucide icons.
  2. Configure Drizzle ORM (`drizzle-kit`, `drizzle-orm`, `pg`) with typed schemas.
  3. Implement `withTenantContext(tenantId, callback)` utilizing transaction-scoped `SET LOCAL app.current_tenant_id` and test for pooled connection cleanup (`AT-11`).
  4. Write migration script generating all tables, indexes, CHECK constraints, composite foreign keys, and RLS policies.
* **Exit Criteria:** Database connects, runs migrations cleanly, and verifies that `SET LOCAL` is cleared after transaction commit/rollback.

#### Phase 1: Identity, Auth, MFA, RBAC & Multi-Tenant Data Isolation
* **Requirements:** `FR-AUTH-001`, `FR-AUTH-002`, `FR-AUTH-003`, `FR-AUTH-004`, `FR-AUTH-005`, `FR-TEN-001`, `FR-TEN-002`, `FR-TEN-004`, `FR-TEN-005`, `FR-RBAC-001`, `FR-RBAC-002`, `FR-RBAC-003`, `FR-RBAC-004`, `FR-RBAC-005`, `FR-AUD-001`, `FR-AUD-002`, `FR-AUD-003`.
* **Acceptance Tests:** `AT-01`, `AT-07`, `AT-11`.
* **Tasks:**
  1. Build secure session management with HTTP-only signed cookies, bcrypt password hashing, and session revocation.
  2. Implement TOTP-based Multi-Factor Authentication (MFA) for privileged platform accounts.
  3. Implement rate-limiting middleware for auth endpoints to prevent brute force and user enumeration (`FR-AUTH-005`).
  4. Implement tenant membership resolution and server-side RBAC guard (`requirePermission`).
  5. Implement tenant management service for platform admins (create, approve, suspend tenant organizations).
  6. Implement audit logger service recording actor, action, tenant, resource, timestamp, and sanitized change summary.
  7. **Write Tests:**
     * `AT-01`: Tenant A admin attempts to read Tenant B's data by direct ID -> Returns 403/404; no data leaked.
     * `AT-11`: Connection reuse test verifying that an orphaned tenant context is impossible after a transaction finishes.

#### Phase 2: White-Label Public Temple Profiles & Discovery Engine
* **Requirements:** `FR-WL-001`, `FR-WL-002`, `FR-WL-003`, `FR-WL-004`, `FR-TEN-003`, `FR-TEN-005`.
* **Tasks:**
  1. Build temple public profile page at `/t/[slug]` dynamically styled with tenant branding (colors, logo, description, deity, timings).
  2. Implement white-label public service discovery: expose only `published` pujas and active campaigns.
  3. Restrict all `draft` or `suspended` temples, services, and campaigns from appearing publicly (`FR-WL-004`).
  4. Build temple administration profile settings in Temple Console to update address, timezone, contacts, and branding.

#### Phase 3: Puja Catalog, Slot Schedules & Atomic Capacity Engine
* **Requirements:** `FR-PUJA-001`, `FR-PUJA-002`, `FR-PUJA-003`, `FR-PUJA-004`, `FR-PUJA-005`, `FR-PUJA-006`, `FR-BOOK-001`, `FR-BOOK-002`, `FR-BOOK-003`, `FR-BOOK-004`, `FR-BOOK-009`.
* **Acceptance Tests:** `AT-02`.
* **Tasks:**
  1. CRUD for pujas: name, description, duration, price in minor units (paise), currency, publication status.
  2. Slot management: create date/time slots with capacity limits; query bookable future slots.
  3. Implement atomic slot reservation engine inside a transaction using `SELECT ... FOR UPDATE` on `puja_slots`.
  4. Calculate authoritative backend price (`price_minor * participant_count`); discard client-submitted prices (`FR-BOOK-002`).
  5. Create pending booking record with unique booking reference, 10-minute expiry timestamp, and immutable price snapshot (`FR-PUJA-006`).
  6. **Write Tests:**
     * `AT-02`: Spawn 10 concurrent booking requests against a slot with capacity = 1. Exactly 1 succeeds with `pending_payment`; 9 are rejected with a capacity error. Zero overbooking occurs.

#### Phase 4: Direct Payment Provider Adapter, Webhooks & Idempotency
* **Requirements:** `FR-PAY-001`, `FR-PAY-002`, `FR-PAY-003`, `FR-PAY-004`, `FR-PAY-005`, `FR-PAY-006`, `FR-PAY-007`, `FR-PAY-008`, `FR-PAY-009`, `FR-PAY-010`.
* **Acceptance Tests:** `AT-03`, `AT-04`, `AT-05`, `AT-06`.
* **Tasks:**
  1. Implement `PaymentAdapter` interface and instantiate `MockPaymentAdapter` for testing and `RazorpayAdapter` for production.
  2. Build server-side payment attempt creation linked to temple's direct merchant account.
  3. Implement webhook endpoint `/api/webhooks/[provider]` with cryptographic signature verification.
  4. Implement webhook deduplication: insert into `webhook_events(provider, event_id)` with unique constraint.
  5. Handle browser return callback: verify that redirect alone does NOT confirm payment (`AT-03`).
  6. Build reconciliation quarantine for mismatched amount or currency (`AT-05`).
  7. **Write Tests:**
     * `AT-03`: Devotee navigates to return page; assert booking remains `pending_payment` until webhook arrives.
     * `AT-04`: Deliver identical valid webhook twice; assert exactly one payment confirmation and no duplicate receipts.
     * `AT-05`: Send signed webhook with tampered amount; assert transaction is quarantined in `reconciliation_exceptions`.

#### Phase 5: Booking Lifecycle, Devotee Check-In, Expiry & Refund Workflows
* **Requirements:** `FR-BOOK-005`, `FR-BOOK-006`, `FR-BOOK-007`, `FR-BOOK-008`, `FR-BOOK-010`.
* **Acceptance Tests:** `AT-06`, `AT-08`.
* **Tasks:**
  1. On verified payment webhook, transition booking to `confirmed` and emit audit event.
  2. Implement background reservation expiry worker (`/api/cron/expire-reservations`): find unconfirmed bookings past `expires_at`, mark as `expired`, and atomically decrement `booked_capacity` on `puja_slots` exactly once.
  3. Handle late payment exception (`AT-06`): if payment webhook arrives after booking expired, do NOT revive booking; push to `reconciliation_exceptions` and initiate refund workflow.
  4. Temple staff check-in interface: search bookings by date/reference and mark `checked_in` with timestamp and actor ID.
  5. Authorized cancellation and refund request workflow (`FR-BOOK-008`, `FR-PAY-008`).
  6. Devotee self-service booking lookup page (`FR-BOOK-010`).
  7. **Write Tests:**
     * `AT-06`: Booking expires -> Late webhook arrives -> Booking stays expired, slot is not oversold, exception is logged.
     * `AT-08`: Unauthorized staff member attempts to issue refund -> Request rejected with 403 and logged to audit trail.

#### Phase 6: Donation Campaigns, Auditable Receipts & Tax Compliance
* **Requirements:** `FR-DON-001`, `FR-DON-002`, `FR-DON-003`, `FR-DON-004`, `FR-DON-005`, `FR-DON-006`, `FR-DON-007`, `FR-REC-001`, `FR-REC-002`, `FR-REC-003`, `FR-REC-004`, `FR-REC-005`, `FR-REC-006`.
* **Acceptance Tests:** `AT-07`, `AT-10`, `AT-12`.
* **Tasks:**
  1. Campaign management in Temple Console: create, publish, close donation purposes with verified legal entity names.
  2. Public donation flow: validate minimum/maximum amounts and currency; initiate direct payment attempt.
  3. Donation confirmation: verified payment marks donation `paid` and issues sequential, scoped receipt (`RCP-{TENANT_SLUG}-{YEAR}-{SEQ}`).
  4. Receipt audit trail: implement receipt voiding and reissuance with auditable reason and lineage tracking (`FR-REC-004`, `AT-12`).
  5. Enforce tax exemption disclosure rule: only display 80G/tax exempt notes if flag is validated on campaign (`FR-REC-006`).
  6. Devotee receipt access control: devotee can only view own receipts; cross-devotee receipt request denied (`AT-07`).
  7. **Write Tests:**
     * `AT-07`: Devotee A queries Devotee B's receipt by ID -> Access denied (403/404).
     * `AT-10`: Complete verified donation -> Receipt issued under correct temple entity with unique sequential number.
     * `AT-12`: Void receipt -> Status updated to `voided`, original record preserved in audit history with attributable actor.

#### Phase 7: Reporting, Timezone Date-Filtering, Platform Ops & Exceptions
* **Requirements:** `FR-REP-001`, `FR-REP-002`, `FR-REP-003`, `FR-REP-004`, `FR-AUD-004`, `FR-AUD-005`.
* **Tasks:**
  1. Temple operational dashboard: today's bookings, upcoming puja slots, pending confirmations.
  2. Booking reports with temple-timezone date filters (`Asia/Kolkata` default) and CSV export.
  3. Finance reports: gross collections, refunds, known provider fees, net settlement, and reconciliation exceptions.
  4. Platform operations view: list tenants, approval state, webhook health, and system exceptions.
  5. Ensure all report queries strictly respect tenant and temple boundaries (`FR-REP-004`).

#### Phase 8: End-to-End Acceptance Verification & Test Automation Suite
* **Goal:** Run the full automated test suite validating all scenarios `AT-01` through `AT-12` against the integrated system.
* **Acceptance Matrix:**

| Test ID | Scenario | Target Behavior & Validation | Implemented In |
| :--- | :--- | :--- | :--- |
| **AT-01** | Tenant A admin requests Tenant B booking by ID | Access denied (403/404); no sensitive data returned. | Phase 1 & 5 |
| **AT-02** | Two devotees book the final seat simultaneously | Transactional locking ensures only available capacity is confirmed; no overselling. | Phase 3 |
| **AT-03** | Browser return page reports payment success without webhook | Booking remains `pending_payment` until server-to-server webhook verification. | Phase 4 |
| **AT-04** | Provider delivers same successful webhook twice | Deduplication ensures one payment effect, one confirmation, no duplicate receipt. | Phase 4 |
| **AT-05** | Signed webhook has mismatched amount or currency | Quarantined in `reconciliation_exceptions`; business record not marked paid. | Phase 4 & 7 |
| **AT-06** | Payment succeeds after reservation expires | Reservation remains expired; exception logged; automatic refund workflow triggered. | Phase 4 & 5 |
| **AT-07** | Devotee requests another user's receipt | Access denied; 403 Forbidden. | Phase 1 & 6 |
| **AT-08** | Unauthorized staff member tries to issue refund | Access denied; audited in `audit_logs`. | Phase 5 |
| **AT-09** | Tenant custom domain is not verified | Domain cannot become active; DNS verified + TLS issued required for activation. | Phase 2 & 9 (Verified) |
| **AT-10** | Donation payment is verified | Donation marked paid; unique sequential receipt generated under correct legal entity. | Phase 6 |
| **AT-11** | Pooled database connection reused after tenant transaction | Clean context guaranteed; no tenant context leakage into subsequent requests. | Phase 0 & 1 |
| **AT-12** | Financial record is corrected or voided | Original history remains immutable and auditable; correction is attributed. | Phase 6 |

#### Phase 9: P1 Expansion Features & Advanced Multi-Branch Operations
* **Requirements:** `FR-TEN-006`, `FR-WL-005`, `FR-PUJA-007`, `FR-DON-008`, `FR-REP-005`, `FR-REP-006`, `FR-AUD-006`.
* **Tasks & Delivery:**
  1. **Custom Domain Engine (`FR-TEN-006`, `FR-WL-005`, `AT-09`):** Built `DomainService` with verification token generation (`cname`/`txt`), simulated DNS resolution verification, automated TLS status management, and strict activation guard ensuring unverified domains can never become active.
  2. **Recurring Schedules & Festival Exceptions (`FR-PUJA-007`):** Implemented `createRecurringSchedule`, `createFestivalException`, and `generateSlotsFromRecurring` handling daily/weekly generation, holiday closures (e.g., Solar Eclipse / Grahan), and custom capacity overrides (e.g., Maha Shivratri).
  3. **Donation Campaign Targets & Progress Tickers (`FR-DON-008`):** Implemented target amounts (`targetAmountMinor`), date bounds (`startDate`, `endDate`), atomic `collectedAmountMinor` increments on payment, and `getCampaignProgress` calculating progress percentage and completion status.
  4. **Trust Consolidated Rollup Reporting (`FR-REP-005`):** Implemented `getTrustConsolidatedReport(tenantId)` rolling up bookings, pujas, donations, and revenues across all individual branch temples in a multi-temple trust.
  5. **SaaS Subscription Billing & Platform Revenue Separation (`FR-REP-006`, `FR-AUD-006`):** Implemented `subscriptionPlans`, `tenantSubscriptions`, and `getPlatformRevenueReport()` guaranteeing that platform subscription recurring revenues remain strictly segregated from temple direct collections.
  6. **Automated Verification:** Added `tests/expansion/p1_expansion.test.ts` (11 tests) bringing total verified tests to **38/38 passing**.

---

## 5. Decisions, Assumptions & Sensible Defaults

The specification notes several open business and technical decisions before production release. Below is the assessment of each decision along with the sensible default adopted for our implementation:

| Decision Item | Why It Matters | Proposed Sensible Default | Rationale |
| :--- | :--- | :--- | :--- |
| **1. Payment Provider & Merchant Model** | Dictates direct payment routing, account onboarding, webhooks, and refund mechanics. | **Razorpay Route (India) as Primary + Stripe Connect Adapter + Mock Adapter for CI.** | In the Indian temple ecosystem, Razorpay is the dominant gateway with native UPI/RuPay/Netbanking support. The pluggable adapter architecture ensures zero vendor lock-in and enables Stripe or local providers seamlessly. |
| **2. Authentication Provider** | Governs identity lifecycle, password policies, MFA, session cookies, and local testability. | **Self-contained HTTP-only Cookie Sessions with Bcrypt & TOTP MFA.** | Eliminates expensive external SaaS auth dependencies (e.g. Clerk/Auth0) while providing 100% testable, hermetic auth for cross-tenant automated test suites and local CI. |
| **3. Tenant & Temple Legal Hierarchy** | Determines how religious trusts, individual shrines, and temple branches relate to tenant security boundaries. | **1 Trust/Organization = 1 Tenant (`tenants`); 1 Tenant = 1 or more Temples (`temples`).** | Accurately models real-world trusts operating multiple temples while guaranteeing strict cross-trust data isolation. All operational data (slots, bookings, donations) is scoped to a specific temple under a tenant. |
| **4. Currency & Timezone Defaults** | Critical for accurate business-date calculations, daily slot cutoff times, and financial minor units. | **Currency: `INR` (Paise minor units); Timezone: `Asia/Kolkata`.** | The spec identifies India as the pilot market. Configurable per temple for future international expansion. |
| **5. Booking Reservation Expiry Window** | Defines how long capacity is held before an unpaid slot is released back to the public pool. | **10 minutes countdown.** | Standard across ticketing and reservation systems: gives devotees adequate time to complete UPI/Card payment without holding inventory indefinitely. |
| **6. Receipt Numbering Standard** | Guarantees audit compliance, prevents duplicate receipt numbers, and satisfies accounting laws. | **Format: `RCP-{TENANT_SLUG}-{YYYY}-{000001}`.** | Sequential, immutable, scoped per tenant and financial year. Guarantees uniqueness (`uq_receipts_tenant_number`). |
| **7. Late Payment Exception Resolution (AT-06)** | Specifies what happens when payment arrives after the 10-minute reservation has expired. | **Quarantine in `reconciliation_exceptions` + Auto-flag for refund.** | Under heavy demand, the expired slot may have been booked by someone else. Automatically reviving an expired booking risks overselling. Safe policy is to log the mismatch and trigger refund. |
| **8. Devotee Registration vs Guest Checkout** | Affects conversion rates for first-time visitors booking a puja or making an urgent donation. | **Support Guest Checkout with Optional Account Linking.** | Devotees can book by providing Name, Phone, and Email. The system generates a guest booking reference and links it to an account if they register with the same email. |

---

## 6. Next Steps & Approval Gate

This implementation plan provides the complete technical specification, architectural design, database DDL with composite keys and RLS, and a phased execution roadmap mapped to every requirement ID (`FR-xxx`) and acceptance test (`AT-01` through `AT-12`).

Upon your approval of this plan, we will proceed immediately to **Phase 0 & Phase 1**, establishing the Next.js App Router codebase, Drizzle ORM schema migrations, transaction-scoped RLS engine, authentication, and cross-tenant isolation test suite (`AT-01`, `AT-11`).
