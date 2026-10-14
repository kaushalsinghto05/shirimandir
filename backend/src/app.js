import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { registerModules, ModulithManifest } from './modules/index.js';
import { errorHandler, notFoundHandler } from './core/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS with Credentials
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || true);
  },
  credentials: true
}));

// Capture raw body for HMAC SHA-256 signature verification in payment webhooks
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

app.use(express.urlencoded({ extended: true }));

// Serve uploaded media statically
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint with Modulith architecture telemetry
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Shiri Mandir Backend API',
    architecture: 'Modular Monolith (Modulith)',
    version: '1.0.0',
    modules: ModulithManifest.map(m => m.name),
    timestamp: new Date().toISOString()
  });
});

// Complete API Route Manifest & Architecture Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    platform: 'Shiri Mandir REST API Documentation',
    architecture: 'Modular Monolith (Modulith)',
    modules: ModulithManifest,
    compliance_standards: [
      'temples.verification_status strictly requires signed affiliation_proof_doc for partnered/official tiers',
      'prasad_items.fssai_license_no strictly mandatory for edible offerings; remains inactive until admin approved',
      'bookings.proof_media_url mandatory to transition puja booking to completed status',
      'orders return full itemized breakdown (base + shipping + platform fee = total in integer paise) with zero hidden fees',
      'payments.verified_server_side only set via cryptographic HMAC SHA-256 webhook verification',
      'users.consent_data_sharing requires explicit opt-in, defaults to false, masks privacy if omitted',
      'refund_requests auto-enforces cancellation policies based on scheduled puja hours and dispatch state'
    ],
    routes: [
      { method: 'POST', path: '/api/auth/register', description: 'Devotee registration with consent opt-in', module: 'identity' },
      { method: 'POST', path: '/api/auth/login', description: 'Authentication and JWT token issuance', module: 'identity' },
      { method: 'GET', path: '/api/auth/me', description: 'Get authenticated devotee profile', module: 'identity' },
      { method: 'PUT', path: '/api/auth/consent', description: 'Toggle devotee data sharing consent', module: 'identity' },
      { method: 'GET', path: '/api/temples', description: 'List temples with deity, state, verification filters', module: 'temple' },
      { method: 'GET', path: '/api/temples/:slug', description: 'Temple details, live queue, pujas, and prasad', module: 'temple' },
      { method: 'POST', path: '/api/temples', description: 'Create temple (requires affiliation doc for partnered/official)', module: 'temple' },
      { method: 'PUT', path: '/api/temples/:id/verification', description: 'Admin verification & affiliation approval', module: 'temple' },
      { method: 'GET', path: '/api/pujas', description: 'List pujas by category, temple, deity', module: 'puja' },
      { method: 'GET', path: '/api/pujas/:id', description: 'Puja details and family/individual packages', module: 'puja' },
      { method: 'GET', path: '/api/prasad', description: 'Active prasad store with real inventory & FSSAI licenses', module: 'prasad' },
      { method: 'GET', path: '/api/prasad/:id', description: 'Prasad item details', module: 'prasad' },
      { method: 'POST', path: '/api/prasad', description: 'Register prasad offering (mandatory FSSAI for food)', module: 'prasad' },
      { method: 'PUT', path: '/api/prasad/:id/approve-fssai', description: 'Admin FSSAI verification & publishing', module: 'prasad' },
      { method: 'POST', path: '/api/bookings', description: 'Create puja booking with itemized breakdown in paise', module: 'booking' },
      { method: 'GET', path: '/api/bookings/my', description: 'Devotee bookings with proof-of-service media', module: 'booking' },
      { method: 'GET', path: '/api/bookings/:id', description: 'Booking details (with privacy mask if unconsented)', module: 'booking' },
      { method: 'PUT', path: '/api/bookings/:id/proof', description: 'Priest proof media upload to complete puja', module: 'booking' },
      { method: 'POST', path: '/api/orders/calculate', description: 'Pre-checkout itemized calculation with zero hidden fees', module: 'order' },
      { method: 'POST', path: '/api/orders', description: 'Create order with atomic stock deduction', module: 'order' },
      { method: 'GET', path: '/api/orders/my', description: 'Devotee prasad orders and tracking', module: 'order' },
      { method: 'POST', path: '/api/payments/intent', description: 'Create pending payment session', module: 'payment' },
      { method: 'POST', path: '/api/payments/verify', description: 'Direct checkout verification with HMAC SHA-256 validation', module: 'payment' },
      { method: 'POST', path: '/api/payments/webhook', description: 'Server-side HMAC SHA-256 webhook signature validation', module: 'payment' },
      { method: 'POST', path: '/api/payments/simulate-webhook', description: 'Local test harness for webhook validation', module: 'payment' },
      { method: 'GET', path: '/api/payments/my', description: 'Devotee payment and transaction history', module: 'payment' },
      { method: 'GET', path: '/api/payments/:payment_code', description: 'Get payment status and server verification details', module: 'payment' },
      { method: 'GET', path: '/api/refunds/policy', description: 'Pre-payment cancellation policy disclosure', module: 'refund' },
      { method: 'POST', path: '/api/refunds/request', description: 'File refund with auto-enforced eligibility calculation', module: 'refund' },
      { method: 'GET', path: '/api/refunds/my', description: 'Devotee refund request history', module: 'refund' },
      { method: 'GET', path: '/api/admin/metrics', description: 'Admin overview: bookings, FSSAI queue, proof audit', module: 'admin' },
      { method: 'GET', path: '/api/admin/refunds', description: 'Admin refund request queue', module: 'admin' },
      { method: 'PUT', path: '/api/admin/refunds/:id/review', description: 'Approve or reject refund request', module: 'admin' }
    ]
  });
});

// Mount all Modulith domain modules & event bus subscriptions
registerModules(app);

// Full-Stack Static Production Asset Serving (Render single web-service deployment)
const possibleDistPaths = [
  path.join(__dirname, '../../dist'),
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, '../dist')
];

let activeDistPath = null;
for (const p of possibleDistPaths) {
  if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
    activeDistPath = p;
    break;
  }
}

if (activeDistPath) {
  app.use(express.static(activeDistPath));
  
  // SPA Catch-All fallback for client routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(activeDistPath, 'index.html'));
  });
}

// 404 Route Handler for unmatched API routes
app.use(notFoundHandler);

// Centralized Modulith Error Handler
app.use(errorHandler);

export default app;
