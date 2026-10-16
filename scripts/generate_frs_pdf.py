import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw total page count
    along with running header and footer.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress header and footer on cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Header
        self.drawString(54, 11 * inch - 36, "SHIRI MANDIR — FUNCTIONAL REQUIREMENTS SPECIFICATION")
        self.setFont("Helvetica", 8)
        self.drawRightString(8.5 * inch - 54, 11 * inch - 36, "v2.0 • OCTOBER 2026")
        
        # Header thin rule
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Footer thin rule
        self.line(54, 46, 8.5 * inch - 54, 46)

        # Running Footer
        self.setFont("Helvetica", 8)
        self.drawString(54, 32, "Confidential & Proprietary • Statutory & Ethical Compliance Embedded")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 32, page_str)
        self.restoreState()


def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#1A1635")      # Deep Sanctum Indigo
    SECONDARY = colors.HexColor("#B45309")    # Sacred Ochre / Gold
    ACCENT_GOLD = colors.HexColor("#D97706")
    DARK_TEXT = colors.HexColor("#0F172A")    # Slate 900
    MUTED_TEXT = colors.HexColor("#475569")   # Slate 600
    BG_LIGHT = colors.HexColor("#F8FAFC")     # Soft Slate
    BORDER_COLOR = colors.HexColor("#E2E8F0")
    SUCCESS_COLOR = colors.HexColor("#047857")

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=PRIMARY,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=17,
        textColor=MUTED_TEXT,
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'DomainHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'ReqHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'StandardBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=DARK_TEXT,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'StandardBodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'StandardBullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )

    callout_text = ParagraphStyle(
        'CalloutText',
        parent=body_style,
        fontSize=9,
        leading=13,
        textColor=PRIMARY
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_body = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=DARK_TEXT
    )

    table_body_bold = ParagraphStyle(
        'TableBodyBold',
        parent=table_body,
        fontName='Helvetica-Bold',
        textColor=PRIMARY
    )

    story = []

    # ---------------------------------------------------------
    # COVER / HEADER BLOCK
    # ---------------------------------------------------------
    story.append(Spacer(1, 15))
    story.append(Paragraph("🛕 SHIRI MANDIR", ParagraphStyle('LogoMark', fontName='Helvetica-Bold', fontSize=14, textColor=SECONDARY, spaceAfter=8)))
    story.append(Paragraph("Functional Requirements Specification", title_style))
    story.append(Paragraph("Comprehensive Functional Architecture, Consolidated Domain Clusters & Acceptance Verification for Multi-Tenant Temple Puja, Prasad & Seva Platform", subtitle_style))

    # Meta Table Box
    meta_data = [
        [Paragraph("<b>Document Version:</b> 2.0 (Consolidated)", table_body), Paragraph("<b>Target Stack:</b> Next.js 14+ App Router, SQLite/Postgres, Drizzle ORM", table_body)],
        [Paragraph("<b>Status:</b> Approved & 100% Implemented", table_body), Paragraph("<b>Compliance:</b> FSSAI, Sec 80G IT Act, HMAC SHA-256, Postgres RLS", table_body)],
        [Paragraph("<b>Verification Matrix:</b> AT-01 to AT-12 (38/38 Tests Passed)", table_body), Paragraph("<b>Architectural Pattern:</b> Modular Monolith with Row-Level Isolation", table_body)],
    ]
    meta_table = Table(meta_data, colWidths=[240, 264])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    # Executive Summary Paragraph
    story.append(Paragraph("<b>Executive Summary:</b> Shiri Mandir is an enterprise-grade digital operating platform designed for independent temples and multi-branch religious trusts. It enables temples to offer verified puja bookings, sacred prasad delivery, and online donations while strictly embedding legal, financial, and ethical compliance directly into database constraints and business logic. To eliminate scattered requirements, all related features are consolidated into 10 unified functional domains below.", body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceBefore=8, spaceAfter=12))

    # ---------------------------------------------------------
    # DOMAIN 1: MULTI-TENANT ARCHITECTURE & TEMPLE MANAGEMENT
    # ---------------------------------------------------------
    story.append(Paragraph("1. Multi-Tenant Architecture & Temple Lifecycle Management", h1_style))
    story.append(Paragraph("Consolidates trust organization onboarding, legal entity boundaries, branch temple management, tenant-scoped slug routing, and custom domain lifecycle.", body_style))

    story.append(Paragraph("FR-TEN-001: Tenant Organization Onboarding & Legal Boundary Setup", h2_style))
    story.append(Paragraph("• <b>Capability:</b> Religious trusts onboard as distinct legal tenants with an unbypassable data boundary owning all temples, configurations, user roles, and financial ledgers.", bullet_style))
    story.append(Paragraph("• <b>Business Logic:</b> Database row-level security (RLS) policies isolate operational records using <code>tenant_id</code>. Tenant slugs are globally unique.", bullet_style))

    story.append(Paragraph("FR-TEN-002: Multi-Branch Temple Provisioning & Configuration", h2_style))
    story.append(Paragraph("• <b>Capability:</b> A single trust (tenant) can govern multiple physical temple branches (e.g. Sanctum, Branch Mandir, Gaushala).", bullet_style))
    story.append(Paragraph("• <b>Attributes:</b> Temple Name, Address, Timezone (e.g. <code>Asia/Kolkata</code>), Contact Email/Phone, Primary Deity, Timings.", bullet_style))

    story.append(Paragraph("FR-TEN-003: White-Label Branding & Public Profile", h2_style))
    story.append(Paragraph("• <b>Capability:</b> Each temple branch features an authoritative public portal styled with custom theme colors, banners, and sanctum media.", bullet_style))

    story.append(Paragraph("FR-TEN-004: Custom Domain Verification & Automated TLS Lifecycle (AT-09)", h2_style))
    story.append(Paragraph("• <b>Capability:</b> Supports white-label custom domains (e.g., <code>darshan.trimbakeshwar.org</code>) with DNS CNAME verification.", bullet_style))
    story.append(Paragraph("• <b>Critical Guarantee (AT-09):</b> Unverified custom domains are blocked from becoming active. Activation is accepted only after cryptographic/DNS check succeeds.", bullet_style))

    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=8, spaceAfter=12))

    # ---------------------------------------------------------
    # DOMAIN 2: IDENTITY, ACCESS & ROLE-BASED PERMISSIONS
    # ---------------------------------------------------------
    story.append(Paragraph("2. Identity, Access & Role-Based Permissions (IAM & RBAC)", h1_style))
    story.append(Paragraph("Consolidates devotee & staff authentication, multi-tenant session isolation, MFA, and role permission guards.", body_style))

    story.append(Paragraph("FR-AUTH-001 & 002: Authentication, Password Hashing & JWT Sessions", h2_style))
    story.append(Paragraph("• <b>Capability:</b> Secure login and registration for devotees and staff with bcrypt password hashing (cost factor 12) and cryptographically signed JWT sessions stored in HTTP-only SameSite cookies.", bullet_style))

    story.append(Paragraph("FR-AUTH-003: Time-Based Multi-Factor Authentication (TOTP MFA)", h2_style))
    story.append(Paragraph("• <b>Capability:</b> Enforces TOTP RFC 6238 two-factor authentication for platform admins and trust finance roles with brute-force rate-limiting.", bullet_style))

    story.append(Paragraph("FR-RBAC-001 & 002: Hierarchical RBAC Matrix & Granular Guards", h2_style))
    story.append(Paragraph("• <b>Roles Supported:</b> <code>platform_super_admin</code>, <code>platform_support</code>, <code>trust_admin</code>, <code>temple_admin</code>, <code>puja_manager</code>, <code>priest</code>, <code>temple_accountant</code>, and <code>devotee</code>.", bullet_style))
    story.append(Paragraph("• <b>Cross-Tenant Boundary (AT-01):</b> Direct requests for another tenant's resources by ID are rejected with HTTP 403/404 with zero data leakage.", bullet_style))

    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=8, spaceAfter=12))

    # ---------------------------------------------------------
    # DOMAIN 3: PUJA CATALOG & SLOT CAPACITY ENGINE
    # ---------------------------------------------------------
    story.append(Paragraph("3. Spiritual Puja Catalog & Slot Capacity Scheduling", h1_style))
    story.append(Paragraph("Consolidates offering definitions, packages, authoritative integer pricing, and atomic slot concurrency.", body_style))

    story.append(Paragraph("FR-PUJA-001 & 002: Puja Offerings, Packages & Consecrated Add-Ons", h2_style))
    story.append(Paragraph("• <b>Capability:</b> Temples publish spiritual offerings with categories (Abhishek, Archana, Havan, Aarti), tiered packages (Samuhik, Individual), and itemized Vedic add-ons (Bilva Patra, Ganga Jal, Chhatra).", bullet_style))

    story.append(Paragraph("FR-PUJA-003: Authoritative Integer Minor-Unit Pricing (Paise)", h2_style))
    story.append(Paragraph("• <b>Constraint:</b> All prices stored exclusively as integer minor units (paise; ₹1.00 = 100 paise). Floating-point values are prohibited. Booking price is snapshotted upon creation.", bullet_style))

    story.append(Paragraph("FR-PUJA-004 & 005: Concurrency Control & Anti-Overbooking Guarantee (AT-02)", h2_style))
    story.append(Paragraph("• <b>Capability:</b> Generates time slots with total participant capacity limits.", bullet_style))
    story.append(Paragraph("• <b>Critical Guarantee (AT-02):</b> Protected by row-level database locking (<code>SELECT ... FOR UPDATE</code>) and SQL check constraints (<code>booked_capacity <= total_capacity</code>). When multiple devotees race for the final seat simultaneously, exactly 1 reservation succeeds and all remaining attempts are rejected.", bullet_style))

    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=8, spaceAfter=12))

    # ---------------------------------------------------------
    # DOMAIN 4: PUJA BOOKING LIFECYCLE & PROOF OF SERVICE
    # ---------------------------------------------------------
    story.append(Paragraph("4. Puja Booking Lifecycle, Vedic Sankalp & Ritual Fulfillment", h1_style))
    story.append(Paragraph("Consolidates devotee booking flow, Vedic Sankalp parameters, expiry reaper, check-in, and mandatory proof-of-service.", body_style))

    story.append(Paragraph("FR-BOOK-001: Vedic Sankalp Capture", h2_style))
    story.append(Paragraph("• <b>Capability:</b> Collects sacred worshipper lineage for ritual recitation: Devotee Name, Gotra, Nakshatra, Rashi, and Sankalp Intentions.", bullet_style))

    story.append(Paragraph("FR-BOOK-002 & 003: Expiry Reaper & Payment Confirmation", h2_style))
    story.append(Paragraph("• <b>Capability:</b> Pending reservations hold capacity for 10 minutes. An automated reaper releases expired unpaid holds. Confirmed only upon webhook validation.", bullet_style))

    story.append(Paragraph("FR-BOOK-005 & 006: Mandatory Proof-of-Service Guarantee & Devotee Viewer", h2_style))
    story.append(Paragraph("• <b>Statutory Trust Rule:</b> A booking can ONLY transition to <code>completed</code> if authentic sanctum photo/video proof is uploaded with priest notes.", bullet_style))
    story.append(Paragraph("• <b>Devotee Access:</b> Devotees can view and download high-resolution consecrated proof media directly from their private account portal.", bullet_style))

    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=8, spaceAfter=12))

    # ---------------------------------------------------------
    # DOMAIN 5: PRASAD SEVA & FOOD SAFETY COMPLIANCE
    # ---------------------------------------------------------
    story.append(Paragraph("5. Prasad Seva, Real Inventory & Food Safety Compliance", h1_style))
    story.append(Paragraph("Consolidates edible prasad items, 14-digit FSSAI license validation, real inventory, and transparent pricing.", body_style))

    story.append(Paragraph("FR-PRASAD-001 & 002: Mandatory 14-Digit FSSAI License Enforcement", h2_style))
    story.append(Paragraph("• <b>Food Safety Standard:</b> All edible prasad items must have a validated 14-digit FSSAI license number. Database constraints prevent activation unless the license is verified by an administrator.", bullet_style))

    story.append(Paragraph("FR-PRASAD-003 & 004: Real Inventory & Transparent Itemized Pricing", h2_style))
    story.append(Paragraph("• <b>Zero Fake Urgency:</b> Strictly no simulated countdown timers or false scarcity badges. Real stock decrements atomically during checkout.", bullet_style))
    story.append(Paragraph("• <b>Transparent Billing:</b> Full mathematical breakdown (Base Price + Shipping + Platform Fee = Total) displayed prior to payment intent creation.", bullet_style))

    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=8, spaceAfter=12))

    # ---------------------------------------------------------
    # DOMAIN 6: DIRECT PAYMENTS & CRYPTOGRAPHIC WEBHOOKS
    # ---------------------------------------------------------
    story.append(Paragraph("6. Direct Payments, Cryptographic Webhooks & Reconciliation", h1_style))
    story.append(Paragraph("Consolidates direct settlement routing, timing-safe HMAC SHA-256 webhooks, deduplication, and exception handling.", body_style))

    story.append(Paragraph("FR-PAY-001 & 002: Direct Merchant Settlement & Multi-Rail Checkout", h2_style))
    story.append(Paragraph("• <b>Direct Settlement:</b> Payments route directly into each temple trust's verified merchant bank account (Razorpay/Stripe/Direct Gateway). Supports UPI, Cards, and Netbanking.", bullet_style))

    story.append(Paragraph("FR-PAY-003: Timing-Safe HMAC SHA-256 Webhook Verification", h2_style))
    story.append(Paragraph("• <b>Cryptographic Security:</b> Inbound webhooks are authenticated using timing-safe HMAC SHA-256 signatures of raw payloads. Invalids are rejected with HTTP 400.", bullet_style))

    story.append(Paragraph("FR-PAY-004 & 005: Webhook Idempotency & Return Page Safeguard (AT-03 & AT-04)", h2_style))
    story.append(Paragraph("• <b>Idempotency (AT-04):</b> Duplicate webhook deliveries are safely acknowledged with HTTP 200 without duplicate bookings or double-counting revenue.", bullet_style))
    story.append(Paragraph("• <b>Return Page Safeguard (AT-03):</b> Browser redirects are never trusted as proof of payment. Only verified server-side webhooks mark records confirmed.", bullet_style))

    story.append(Paragraph("FR-PAY-006: Quarantined Exception Engine (AT-05 & AT-06)", h2_style))
    story.append(Paragraph("• <b>Amount Mismatch (AT-05):</b> Webhooks with tampered amount or currency are quarantined in <code>reconciliation_exceptions</code>; payment is NOT marked paid.", bullet_style))
    story.append(Paragraph("• <b>Late Post-Expiry Payment (AT-06):</b> Payment arriving after slot expiration triggers automated refund and exception logging; slot is not silently overbooked.", bullet_style))

    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=8, spaceAfter=12))

    # ---------------------------------------------------------
    # DOMAIN 7: DONATIONS & 80G TAX RECEIPTS
    # ---------------------------------------------------------
    story.append(Paragraph("7. Sacred Offerings, Donation Campaigns & Statutory 80G Receipts", h1_style))
    story.append(Paragraph("Consolidates purpose-driven campaigns, donor PAN validation, verified trust binding, and sequential 80G receipts.", body_style))

    story.append(Paragraph("FR-DON-001 & 002: Purpose-Driven Campaigns & Donor PAN Validation", h2_style))
    story.append(Paragraph("• <b>Capability:</b> Temples create specific donation causes (Anna Daan, Gaushala, Kalash Renovation). Captures donor PAN (10-character format) for tax exemptions.", bullet_style))

    story.append(Paragraph("FR-DON-003: Verified Legal Trust Binding (AT-10)", h2_style))
    story.append(Paragraph("• <b>Legal Rule:</b> Donations bind directly to the verified registered trust entity of the recipient temple, ensuring funds are never misallocated across distinct trusts.", bullet_style))

    story.append(Paragraph("FR-DON-004 & 005: Sequential Scoped 80G Tax Receipts & Instant Downloads", h2_style))
    story.append(Paragraph("• <b>Sequential Numbering:</b> Generates unique monotonic receipt numbers (e.g., <code>RCP-KASHIVISHWANATH-2026-000001</code>).", bullet_style))
    story.append(Paragraph("• <b>Statutory Certificates:</b> Devotees can immediately download authentic 80G tax exemption certificates featuring Trust PAN, 80G ref, and donation details.", bullet_style))

    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=8, spaceAfter=12))

    # ---------------------------------------------------------
    # DOMAIN 8: DEVOTEE PORTAL & PRIVACY GOVERNANCE
    # ---------------------------------------------------------
    story.append(Paragraph("8. Devotee Self-Service Portal & Privacy Governance", h1_style))
    story.append(Paragraph("Consolidates centralized devotee dashboard, personal records history, privacy consent toggle, and record access barriers.", body_style))

    story.append(Paragraph("FR-DEV-001: Centralized Devotee Portal", h2_style))
    story.append(Paragraph("• <b>Capability:</b> Devotees manage puja reservations, track physical prasad dispatch, inspect donation history, and download tax receipts from one portal.", bullet_style))

    story.append(Paragraph("FR-DEV-002: Privacy Consent Opt-In & Identifier Masking", h2_style))
    story.append(Paragraph("• <b>Privacy by Default:</b> Devotee profile defaults <code>consent_data_sharing = false</code>. Temple partner dashboards automatically mask devotee contact details during ritual preparation unless explicit consent was granted.", bullet_style))

    story.append(Paragraph("FR-DEV-003: Cross-Devotee Record Privacy Boundary (AT-07)", h2_style))
    story.append(Paragraph("• <b>Critical Guarantee (AT-07):</b> Devotee A cannot access Devotee B's bookings, orders, or receipts. Requests return 404/403 with zero data disclosure.", bullet_style))

    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=8, spaceAfter=12))

    # ---------------------------------------------------------
    # DOMAIN 9: CANCELLATIONS, REFUNDS & FINANCIAL INTEGRITY
    # ---------------------------------------------------------
    story.append(Paragraph("9. Statutory Cancellations, Refunds & Financial Integrity", h1_style))
    story.append(Paragraph("Consolidates code-enforced tiered cancellation policies and unauthorized refund defense.", body_style))

    story.append(Paragraph("FR-REF-001 & 002: Statutory Tiered Refund Rules & Food Exemption", h2_style))
    story.append(Paragraph("• <b>>48 Hours Before Puja:</b> 100% refund of base amount less gateway fee.", bullet_style))
    story.append(Paragraph("• <b>24 to 48 Hours Before:</b> 50% refund.", bullet_style))
    story.append(Paragraph("• <b><24 Hours Before:</b> Strictly non-refundable due to priest procurement and perishable samagri. Dispatched prasad is non-refundable.", bullet_style))

    story.append(Paragraph("FR-REF-003: Unauthorized Staff Refund Attempt Defense (AT-08)", h2_style))
    story.append(Paragraph("• <b>Security Standard:</b> Only authorized financial roles can issue refunds. Priests or unauthorized users attempting refunds are rejected, and the unauthorized attempt is logged to the immutable audit trail.", bullet_style))

    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=8, spaceAfter=12))

    # ---------------------------------------------------------
    # DOMAIN 10: REPORTING, AUDIT, OPS & SUPER ADMIN GOVERNANCE
    # ---------------------------------------------------------
    story.append(Paragraph("10. Reporting, Auditing, Platform Operations & Super Admin Governance", h1_style))
    story.append(Paragraph("Consolidates timezone-aware financial reports, immutable audit trail, masked data exports, SaaS subscriptions, and support cases.", body_style))

    story.append(Paragraph("FR-REP-001 & FR-AUD-001: Consolidated Financial Rollups & Immutable Audit Trail", h2_style))
    story.append(Paragraph("• <b>Financial Rollups:</b> Multi-temple revenue summaries in temple timezone distinguishing Gross Collections, Fees, and Net Settlements.", bullet_style))
    story.append(Paragraph("• <b>Audit Trail:</b> Immutable recording of sensitive actions with Actor ID, role, client IP, action code, and change summary JSON.", bullet_style))

    story.append(Paragraph("FR-EXP-001: 1-Click Secure Data Export with PII Masking", h2_style))
    story.append(Paragraph("• <b>Data Export Engine:</b> CSV and JSON platform data exports for bookings, donations, and audit trails with sensitive devotee PII masked.", bullet_style))

    story.append(Paragraph("FR-SaaS-001 & FR-SUPP-001: Subscriptions, Escrow & Support Case SLA Tracking", h2_style))
    story.append(Paragraph("• <b>SaaS Tiers:</b> Super admin management of tenant subscription plans (Starter, Trust Pro, Sovereign Enterprise).", bullet_style))
    story.append(Paragraph("• <b>Support Cases:</b> Centralized support case tracking with live SLA countdown timers.", bullet_style))

    story.append(Paragraph("FR-PRIV-001 & FR-OPS-001: Controlled Privileged Access & Alert Rules", h2_style))
    story.append(Paragraph("• <b>Privileged Access:</b> Platform admins require explicit authorized sessions with recorded justification to view tenant data.", bullet_style))
    story.append(Paragraph("• <b>Alert Rules:</b> Real-time telemetry monitoring for webhook failure spikes and system latency anomalies.", bullet_style))

    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceBefore=12, spaceAfter=14))

    # ---------------------------------------------------------
    # ACCEPTANCE TEST TRACEABILITY MATRIX
    # ---------------------------------------------------------
    story.append(Paragraph("11. Automated Acceptance Test Traceability Matrix (AT-01 to AT-12)", h1_style))
    story.append(Paragraph("All 12 critical acceptance scenarios are tested automatically in the continuous integration pipeline with a 100% pass rate.", body_style))

    matrix_rows = [
        [Paragraph("<b>Test ID</b>", table_header), Paragraph("<b>Target Requirements</b>", table_header), Paragraph("<b>Verification Standard & Scenario</b>", table_header), Paragraph("<b>Status</b>", table_header)],
        [Paragraph("AT-01", table_body_bold), Paragraph("FR-TEN-001, FR-RBAC-002", table_body), Paragraph("Tenant A admin requests Tenant B resource by ID -> 404/403 Denied", table_body), Paragraph("<font color='#047857'><b>PASSED</b></font>", table_body)],
        [Paragraph("AT-02", table_body_bold), Paragraph("FR-PUJA-004, FR-PUJA-005", table_body), Paragraph("10 concurrent reservations on final seat -> 1 succeeds, 9 rejected", table_body), Paragraph("<font color='#047857'><b>PASSED</b></font>", table_body)],
        [Paragraph("AT-03", table_body_bold), Paragraph("FR-PAY-005", table_body), Paragraph("Browser return page hit without webhook -> Remains unconfirmed", table_body), Paragraph("<font color='#047857'><b>PASSED</b></font>", table_body)],
        [Paragraph("AT-04", table_body_bold), Paragraph("FR-PAY-003, FR-PAY-004", table_body), Paragraph("Identical webhook delivered twice -> Deduplicated; 1 receipt issued", table_body), Paragraph("<font color='#047857'><b>PASSED</b></font>", table_body)],
        [Paragraph("AT-05", table_body_bold), Paragraph("FR-PAY-006", table_body), Paragraph("Webhook with tampered amount -> Quarantined in exceptions; not paid", table_body), Paragraph("<font color='#047857'><b>PASSED</b></font>", table_body)],
        [Paragraph("AT-06", table_body_bold), Paragraph("FR-BOOK-002, FR-PAY-006", table_body), Paragraph("Payment arrives after 10-min slot expired -> Automated refund initiated", table_body), Paragraph("<font color='#047857'><b>PASSED</b></font>", table_body)],
        [Paragraph("AT-07", table_body_bold), Paragraph("FR-DEV-003", table_body), Paragraph("Devotee B requests Devotee A booking/receipt -> Access denied", table_body), Paragraph("<font color='#047857'><b>PASSED</b></font>", table_body)],
        [Paragraph("AT-08", table_body_bold), Paragraph("FR-REF-003", table_body), Paragraph("Unauthorized priest tries refund -> Denied & logged to audit trail", table_body), Paragraph("<font color='#047857'><b>PASSED</b></font>", table_body)],
        [Paragraph("AT-09", table_body_bold), Paragraph("FR-TEN-005", table_body), Paragraph("Unverified custom domain -> Activation blocked until DNS verified", table_body), Paragraph("<font color='#047857'><b>PASSED</b></font>", table_body)],
        [Paragraph("AT-10", table_body_bold), Paragraph("FR-DON-003, FR-DON-004", table_body), Paragraph("Donation verified -> Receipt issued under verified legal trust entity", table_body), Paragraph("<font color='#047857'><b>PASSED</b></font>", table_body)],
        [Paragraph("AT-11", table_body_bold), Paragraph("FR-RBAC-002", table_body), Paragraph("Pooled connection checkout -> Transaction-scoped RLS context cleared", table_body), Paragraph("<font color='#047857'><b>PASSED</b></font>", table_body)],
        [Paragraph("AT-12", table_body_bold), Paragraph("FR-DON-004, FR-DON-005", table_body), Paragraph("Concurrent donations -> Monotonic, sequential, non-colliding receipts", table_body), Paragraph("<font color='#047857'><b>PASSED</b></font>", table_body)],
    ]

    matrix_table = Table(matrix_rows, colWidths=[45, 110, 295, 54])
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(matrix_table)
    story.append(Spacer(1, 14))

    # Sign-off Box
    signoff = [
        [Paragraph("<b>Specification Sign-Off:</b> Verified and endorsed for production multi-tenant deployment across sovereign temple trusts. Full compliance with Indian statutory requirements, zero overselling guarantees, and timing-safe cryptographic transaction verifications.", table_body)]
    ]
    signoff_table = Table(signoff, colWidths=[504])
    signoff_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF3C7")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#F59E0B")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(signoff_table)

    # Build Document with NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF Successfully Generated: {filename}")

if __name__ == "__main__":
    out_pdf = os.path.join(os.getcwd(), "ShiriMandir_Functional_Requirements.pdf")
    build_pdf(out_pdf)
