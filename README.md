# 🛕 Shiri Mandir — Temple Puja, Prasad & Seva Booking Platform

> **A high-trust, production-grade spiritual tech platform engineered with legal and ethical compliance embedded directly into the database schema and business logic, not patched on later.**

---

## 🏛️ System Architecture & Ethical Compliance Charter

In religious tech platforms, trust and consumer protection are paramount. **Shiri Mandir** embeds statutory compliance at the database engine level (`CHECK` constraints) and cryptographic verification layers:

| Compliance Dimension | Statutory Requirement | Database & Business Logic Enforcement |
|---|---|---|
| **Temple Verification** | No false claims of official affiliation | `temples.verification_status` (`independent`, `partnered`, `official`). Database `CHECK` constraint strictly forbids setting `partnered` or `official` unless a signed `affiliation_proof_doc` is on file with admin verification audit trail. |
| **Prasad Food Safety** | Mandatory 14-digit FSSAI License | `prasad_items.fssai_license_no` is mandatory for any `is_edible` item. Database constraint forbids `is_active = true` until FSSAI license is verified by an admin (`fssai_verified_at IS NOT NULL`). |
| **Proof of Service** | Devotee ritual fulfillment guarantee | `bookings.proof_media_url` is mandatory. A puja booking can **only** transition to status `'completed'` if authentic photo/video proof is attached for the devotee. |
| **Transparent Pricing** | Zero hidden charges at checkout | Money stored exclusively as **integer paise** (never floating point). Full itemized breakdown (`base + shipping + platform fee = total`) verified mathematically by DB constraint and returned before payment. |
| **Server-Side Payments** | Never trust client-reported success | `payments.verified_server_side` defaults to `false`. Can **only** be set to `true` via server-side webhook signature validation using timing-safe `HMAC SHA-256`. |
| **Devotee Privacy** | Explicit data sharing opt-in | `users.consent_data_sharing` defaults to `false` (unchecked). Temple partner portal automatically masks devotee identifiers during ritual records unless explicit consent was granted. |
| **Statutory Refunds** | Auto-enforced cancellation terms | Auto-evaluates refund eligibility based on hours remaining before scheduled puja (>48h = 100% less gateway fee; 24-48h = 50%; <24h = non-refundable) and food dispatch state. |
| **Real Inventory** | Zero fake urgency counters | Real `stock_qty` with atomic SQL decrement transactions (`UPDATE ... WHERE stock_qty >= ?`). No artificial countdown timers. |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Tailwind CSS, Lucide Icons, Vite, mobile-first responsive architecture.
  - Deep indigo/gold sanctum theme (`#0f0a21` / `#161130` / radiant gold `#d4a34b` / `#f59e0b`).
  - Serif typography (`Playfair Display` / `Cinzel`), trust badges, floating info cards, swipeable marquee panchang ticker.
- **Backend:** Node.js 24+, Express REST API, ES Modules (`import/export`).
- **Database:** PostgreSQL (production) & Node.js built-in SQLite (zero-config local development).
- **Authentication:** JWT with Role-Based Access Control (`devotee`, `temple_partner`, `admin`) and bcrypt password hashing.
- **Payments:** Razorpay / PayU pattern with timing-safe HMAC SHA-256 server-side webhook validation.
- **Storage:** S3-compatible object storage (AWS S3, Cloudflare R2, MinIO) with local fallback.

---

## 📁 Repository Folder Structure

```text
shirimandir/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── index.js                      # Environment configuration
│   │   ├── controllers/
│   │   │   ├── authController.js             # Devotee auth & privacy consent opt-in
│   │   │   ├── templeController.js           # Verification status & affiliation doc review
│   │   │   ├── pujaController.js             # Offerings, packages & pricing in paise
│   │   │   ├── prasadController.js           # 14-digit FSSAI validation & real inventory
│   │   │   ├── bookingController.js          # Itemized booking & mandatory proof-of-service
│   │   │   ├── orderController.js            # Transparent pre-checkout & stock reservation
│   │   │   ├── paymentController.js          # HMAC SHA-256 webhook signature validator
│   │   │   ├── refundController.js           # Auto-enforced statutory cancellation tiers
│   │   │   └── adminController.js            # Platform telemetry & compliance audit
│   │   ├── database/
│   │   │   ├── db.js                         # Unified PostgreSQL / SQLite connector
│   │   │   ├── schema.sql                    # PostgreSQL DDL with CHECK constraints
│   │   │   ├── schema_sqlite.sql             # SQLite local dev DDL
│   │   │   └── seed.js                       # Compliant seed data for 3 temples
│   │   ├── middleware/
│   │   │   ├── auth.js                       # JWT & RBAC guards (devotee, partner, admin)
│   │   │   └── errorHandler.js               # Structured compliance error handling
│   │   ├── routes/                           # Express modular REST routers
│   │   ├── services/
│   │   │   ├── paymentWebhookService.js      # Timing-safe HMAC SHA-256 validator
│   │   │   └── storageService.js             # S3 bucket / local media upload handler
│   │   └── app.js                            # Express app configuration & raw body capture
│   ├── tests/
│   │   └── compliance.test.js                # Automated suite testing all 8 compliance rules
│   ├── server.js                             # Backend bootstrapper & auto-seeder
│   ├── package.json                          # Backend dependencies & script runners
│   └── .env.example                          # Environment variable blueprint
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VerificationBadge.jsx         # Legal affiliation status modal (Official/Partnered/Indep)
│   │   │   ├── ProofMediaViewerModal.jsx     # Consecrated photo/video proof viewer
│   │   │   ├── RefundRequestModal.jsx        # Code-enforced cancellation payout calculator
│   │   │   ├── PrasadCheckoutModal.jsx       # Real inventory cart, FSSAI badge & itemized bill
│   │   │   ├── TempleDirectory.jsx           # Filter by deity, state, verification tier
│   │   │   ├── TempleDetailModal.jsx         # Sanctum details, affiliation proof doc link
│   │   │   ├── PujaBookingModal.jsx          # Explicit privacy opt-in, itemized pricing in paise
│   │   │   ├── UnifiedPaymentModal.jsx       # HMAC webhook signature verification simulation
│   │   │   ├── UserAccountDashboard.jsx      # Proof viewer, orders, refunds, privacy toggle
│   │   │   ├── AdminDashboard.jsx            # Affiliation review, FSSAI queue, proof uploader
│   │   │   ├── HeroSanctum.jsx               # Deep indigo/gold hero with floating info cards
│   │   │   ├── VerifiedTrustBadges.jsx       # Statutory transparency badges
│   │   │   └── Navbar.jsx & Footer.jsx       # Navigation & footer
│   │   ├── services/
│   │   │   └── api.js                        # REST client with JWT handling
│   │   ├── App.jsx                           # Application state orchestrator
│   │   ├── main.jsx                          # React root
│   │   └── index.css                         # Tailwind CSS design system tokens
│   ├── public/                               # Sacred assets, audio, mandalas
│   ├── vite.config.js                        # Vite proxy configured for /api & /uploads
│   └── package.json                          # Client dependencies
│
├── README.md                                 # Architecture documentation & setup guide
└── package.json                              # Root workspace runner
```

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- **Node.js**: v20+ or v24+ (Node 24 includes built-in SQLite, requiring zero native compiler tools on Windows/macOS/Linux).
- **npm**: v10+.

### 1. Backend Setup
```bash
cd backend
npm install

# Initialize schema and seed sample compliant temples (Kashi, Tirupati, Siddhivinayak)
npm run seed

# Run the 8-rule compliance test suite
npm test

# Start the REST API server on port 5000
npm run dev
```

### 2. Frontend Setup
```bash
# In another terminal window:
npm install

# Start Vite dev server on port 2323
npm run dev
```
Open **`http://localhost:2323`** in your browser. The Vite server automatically proxies `/api` and `/uploads` requests to `http://localhost:5000`.

---

## 🔐 Environment Variables (`backend/.env`)

```ini
# Server Port & Environment
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:2323

# JWT Authentication
JWT_SECRET=shirimandir_sacred_jwt_secret_key_2026
JWT_EXPIRES_IN=7d

# Payment Webhook Cryptographic Security (HMAC SHA-256)
# Kept strictly server-side. Used to verify x-razorpay-signature
PAYMENT_WEBHOOK_SECRET=rzp_test_webhook_secret_key_9921

# Database Configuration
# Leave empty to use zero-setup embedded SQLite (data/shirimandir.sqlite).
# For production PostgreSQL (Railway/Render/RDS/Supabase):
# DATABASE_URL=postgresql://postgres:password@localhost:5432/shirimandir

# Media Storage Configuration
STORAGE_PROVIDER=local
# For AWS S3 / Cloudflare R2 / MinIO in production:
# STORAGE_PROVIDER=s3
# S3_ENDPOINT=https://s3.ap-south-1.amazonaws.com
# S3_BUCKET=shirimandir-proofs
# S3_ACCESS_KEY=your_aws_key
# S3_SECRET_KEY=your_aws_secret
# PUBLIC_STORAGE_URL=https://shirimandir-proofs.s3.ap-south-1.amazonaws.com
```

---

## 📡 Complete REST API Route Catalog

### 1. Authentication & Devotee Privacy
| Method | Endpoint | Description & Compliance Rule |
|---|---|---|
| `POST` | `/api/auth/register` | Devotee registration. `consent_data_sharing` defaults to `false`. |
| `POST` | `/api/auth/login` | Issues signed JWT token. |
| `GET` | `/api/auth/me` | Fetches active profile with privacy consent status. |
| `PUT` | `/api/auth/consent` | Toggles `consent_data_sharing` with IP and cryptographic timestamp logging. |

#### Request Shape (`POST /api/auth/register`):
```json
{
  "name": "Kaushal Singh",
  "email": "kaushal@example.com",
  "password": "Password@123",
  "phone": "+919876543210",
  "gotra": "Kashyap",
  "rashi": "Dhanu",
  "nakshatra": "Moola",
  "consent_data_sharing": false
}
```

#### Response Shape:
```json
{
  "success": true,
  "message": "Account successfully registered with privacy preferences recorded",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Kaushal Singh",
      "email": "kaushal@example.com",
      "role": "devotee",
      "consent_data_sharing": false
    }
  }
}
```

---

### 2. Temples & Affiliation Transparency
| Method | Endpoint | Description & Compliance Rule |
|---|---|---|
| `GET` | `/api/temples` | List temples with filters: `deity`, `state`, `verification_status` (`official`, `partnered`, `independent`), `search`. |
| `GET` | `/api/temples/:slug` | Temple details, available pujas, active FSSAI prasad items, live stream queue. |
| `POST` | `/api/temples` | Creates temple. **Enforces:** `partnered`/`official` requires signed `affiliation_proof_doc`. |
| `PUT` | `/api/temples/:id/verification` | Admin upgrades verification tier with document audit. |

#### Response Shape (`GET /api/temples/kashi-vishwanath`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "kashi-vishwanath",
    "name": "Shri Kashi Vishwanath Temple",
    "deity": "Lord Shiva",
    "location": "Varanasi, Uttar Pradesh",
    "verification_status": "official",
    "affiliation_proof_doc": "https://storage.shirimandir.org/compliance/docs/kashi_vishwanath_trust_mou_2024.pdf",
    "trust_registration_no": "TRUST-KV-UP-7819",
    "current_wait_minutes": 20,
    "pujas": [...],
    "prasad_items": [...]
  }
}
```

---

### 3. Puja Seva Bookings & Proof of Service
| Method | Endpoint | Description & Compliance Rule |
|---|---|---|
| `POST` | `/api/bookings` | Creates booking. Stored in **integer paise**. Pre-payment cancellation terms returned. |
| `GET` | `/api/bookings/my` | Devotee's bookings with consecrated proof-of-service media URLs. |
| `GET` | `/api/bookings/:id` | Booking details. If viewed by priest and devotee didn't consent, personal contact is masked. |
| `PUT` | `/api/bookings/:id/proof` | Priest uploads photo/video proof. **Puja can only be marked completed once proof is attached.** |

#### Request Shape (`POST /api/bookings`):
```json
{
  "puja_id": 1,
  "package_id": 1,
  "scheduled_date": "2026-10-15",
  "scheduled_time_slot": "Morning (07:00 AM - 09:00 AM)",
  "sankalp_name": "Kaushal Singh",
  "sankalp_gotra": "Kashyap",
  "sankalp_nakshatra": "Moola",
  "consent_data_shared": true,
  "addons": [
    { "id": "1", "price_paise": 25100 }
  ]
}
```

#### Response Shape (Zero Hidden Charges):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "booking_code": "BK-KAS-2026-F981",
    "status": "pending_payment",
    "itemized_breakdown": {
      "base_amount_inr": 2100,
      "addons_amount_inr": 251,
      "platform_fee_inr": 50,
      "tax_inr": 0,
      "total_amount_inr": 2401,
      "currency": "INR"
    },
    "cancellation_policy_pre_payment": {
      "notice_above_48_hours": "100% refund minus 2% payment gateway fee",
      "notice_24_to_48_hours": "50% refund",
      "notice_under_24_hours": "Non-refundable (samagri & priests consecrated)"
    }
  }
}
```

---

### 4. Prasad Store & Real Inventory
| Method | Endpoint | Description & Compliance Rule |
|---|---|---|
| `GET` | `/api/prasad` | List active prasad items. Returns genuine `stock_qty` and 14-digit FSSAI licenses. |
| `POST` | `/api/prasad` | Register prasad offering. Edible items strictly require 14-digit FSSAI. Enters as `is_active = 0`. |
| `PUT` | `/api/prasad/:id/approve-fssai` | Admin inspects FSSAI license and activates item for public store. |

---

### 5. Orders & Transparent Checkout
| Method | Endpoint | Description & Compliance Rule |
|---|---|---|
| `POST` | `/api/orders/calculate` | Pre-checkout calculation: `base + shipping + platform fee = total`. |
| `POST` | `/api/orders` | Creates order with atomic inventory reservation (`stock_qty = stock_qty - qty`). |
| `GET` | `/api/orders/my` | Devotee orders with tracking codes and itemized receipts. |

---

### 6. Payments & Cryptographic Webhook Security
| Method | Endpoint | Description & Compliance Rule |
|---|---|---|
| `POST` | `/api/payments/intent` | Creates pending payment in `'created'` state. `verified_server_side = 0`. |
| `POST` | `/api/payments/webhook` | **Server-side webhook.** Verifies HMAC SHA-256 signature using raw body buffer and secret. Only point of truth for setting `verified_server_side = 1`. |
| `POST` | `/api/payments/simulate-webhook` | Developer testing harness generating valid HMAC signatures. |

#### Webhook Cryptographic Verification Implementation:
```javascript
import crypto from 'node:crypto';

export function verifyWebhookSignature(rawPayload, signatureHeader, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawPayload)
    .digest('hex');

  // Timing-safe comparison prevents side-channel timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(signatureHeader, 'utf8')
  );
}
```

---

### 7. Statutory Refunds & Cancellation Policies
| Method | Endpoint | Description & Compliance Rule |
|---|---|---|
| `GET` | `/api/refunds/policy` | Public disclosure of pre-payment cancellation rules. |
| `POST` | `/api/refunds/request` | Devotee files refund. Auto-evaluates policy tier and eligible payout mathematically. |
| `GET` | `/api/refunds/my` | Devotee refund request history and payout statuses. |
| `GET` | `/api/admin/refunds` | Admin refund queue. |
| `PUT` | `/api/admin/refunds/:id/review` | Admin approves/rejects refund with audit log. |

---

## 🗄️ Seed Data for 3 Sample Temples

1. **Shri Kashi Vishwanath Temple (Varanasi, UP)**
   - Verification Status: `'official'` (MOU on file: `kashi_vishwanath_trust_mou_2024.pdf`, Trust Reg: `TRUST-KV-UP-7819`).
   - Pujas: Maha Rudrabhishek with Ganga Jal & Bilva Patra (₹2,100), Special Sandhya Aarti (₹1,100).
   - Prasad: Pure Cow Ghee Peda & Dry Fruit Box (FSSAI License `12723999000142`, real stock: 120 units).
2. **Sri Venkateswara Swamy Temple (Tirupati Balaji, AP)**
   - Verification Status: `'partnered'` (Agreement on file: `tirumala_archaka_seva_agreement_2024.pdf`, Trust Reg: `AP-TTD-ARCH-2023`).
   - Pujas: Kalyanotsavam & Suprabhata Seva (₹3,100), Sahasra Deepalankarana Seva (₹1,800).
   - Prasad: Authentic GI-tagged Tirupati Laddu Mahaprasad (FSSAI License `10118028000451`, real stock: 45 units).
3. **Shree Siddhivinayak Temple (Mumbai, Maharashtra)**
   - Verification Status: `'independent'` (Consumer protection compliance: no official affiliation claimed; sevas facilitated via independent traditional priests; Trust Reg: `MH-BOM-TRUST-1801`).
   - Pujas: Shri Ganesh Atharvashirsha Sahasra Avartan (₹1,500).
   - Prasad: Pure Ghee Modak Box (FSSAI License `11521018000892`, real stock: 30 units).

---

## 🚀 Deployment Guide

### A. Deploy Frontend to Vercel
1. Push this repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com), click **Add New Project** and select your repository.
3. Configure settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (or `frontend/`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Set Environment Variables:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://shirimandir-backend.up.railway.app/api`)
5. Click **Deploy**.

### B. Deploy Backend to Railway or Render
1. In [Railway](https://railway.app) or [Render](https://render.com), click **New Service** from GitHub repo.
2. Configure settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Provision a **PostgreSQL Database** addon.
4. Set Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: A secure 64-character random string.
   - `PAYMENT_WEBHOOK_SECRET`: Your Razorpay / PayU webhook secret.
   - `CORS_ORIGIN`: Your Vercel frontend URL.
5. The backend will automatically apply `backend/src/database/schema.sql` and run `seedDatabase()` on initial boot.

---

## 🧪 Compliance Test Execution Report

Run the built-in test suite:
```bash
npm run test:backend
```
Expected output:
```text
✔ Rule 1: Temple verification status requires affiliation proof document for partnered/official
✔ Rule 2: Prasad edible items require 14-digit FSSAI and stay inactive until approved
✔ Rule 3: Puja booking cannot be marked completed without proof-of-service media
✔ Rule 4: Orders enforce arithmetic breakdown math (base + shipping + platform = total)
✔ Rule 5: Payment webhook signature verification with HMAC SHA-256
✔ Rule 6: Devotee data sharing defaults to false (explicit opt-in only)
✔ Rule 7: Real inventory stock cannot be negative (no fake urgency)
✔ Shiri Mandir Compliance & Data Integrity Suite (129ms)
```

---

## 📜 License & Compliance Attribution
Licensed under the ISC License. Engineered in accordance with the Food Safety and Standards Act (FSSAI 2006) and the Consumer Protection (E-Commerce) Rules 2020.
