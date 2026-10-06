import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';

import authRoutes from './routes/authRoutes.js';
import templeRoutes from './routes/templeRoutes.js';
import pujaRoutes from './routes/pujaRoutes.js';
import prasadRoutes from './routes/prasadRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import refundRoutes from './routes/refundRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Capture raw body for HMAC signature verification in webhooks
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

app.use(express.urlencoded({ extended: true }));

// Serve uploaded media statically
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Shiri Mandir Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Complete API Route Manifest
app.get('/api/docs', (req, res) => {
  res.json({
    platform: 'Shiri Mandir REST API Documentation',
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
      { method: 'POST', path: '/api/auth/register', description: 'Devotee registration with consent opt-in' },
      { method: 'POST', path: '/api/auth/login', description: 'Authentication and JWT token issuance' },
      { method: 'GET', path: '/api/auth/me', description: 'Get authenticated devotee profile' },
      { method: 'PUT', path: '/api/auth/consent', description: 'Toggle devotee data sharing consent' },
      { method: 'GET', path: '/api/temples', description: 'List temples with deity, state, verification filters' },
      { method: 'GET', path: '/api/temples/:slug', description: 'Temple details, live queue, pujas, and prasad' },
      { method: 'POST', path: '/api/temples', description: 'Create temple (requires affiliation doc for partnered/official)' },
      { method: 'PUT', path: '/api/temples/:id/verification', description: 'Admin verification & affiliation approval' },
      { method: 'GET', path: '/api/pujas', description: 'List pujas by category, temple, deity' },
      { method: 'GET', path: '/api/pujas/:id', description: 'Puja details and family/individual packages' },
      { method: 'GET', path: '/api/prasad', description: 'Active prasad store with real inventory & FSSAI licenses' },
      { method: 'GET', path: '/api/prasad/:id', description: 'Prasad item details' },
      { method: 'POST', path: '/api/prasad', description: 'Register prasad offering (mandatory FSSAI for food)' },
      { method: 'PUT', path: '/api/prasad/:id/approve-fssai', description: 'Admin FSSAI verification & publishing' },
      { method: 'POST', path: '/api/bookings', description: 'Create puja booking with itemized breakdown in paise' },
      { method: 'GET', path: '/api/bookings/my', description: 'Devotee bookings with proof-of-service media' },
      { method: 'GET', path: '/api/bookings/:id', description: 'Booking details (with privacy mask if unconsented)' },
      { method: 'PUT', path: '/api/bookings/:id/proof', description: 'Priest proof media upload to complete puja' },
      { method: 'POST', path: '/api/orders/calculate', description: 'Pre-checkout itemized calculation with zero hidden fees' },
      { method: 'POST', path: '/api/orders', description: 'Create order with atomic stock deduction' },
      { method: 'GET', path: '/api/orders/my', description: 'Devotee prasad orders and tracking' },
      { method: 'POST', path: '/api/payments/intent', description: 'Create pending payment session' },
      { method: 'POST', path: '/api/payments/webhook', description: 'Server-side HMAC SHA-256 webhook signature validation' },
      { method: 'POST', path: '/api/payments/simulate-webhook', description: 'Local test harness for webhook validation' },
      { method: 'GET', path: '/api/refunds/policy', description: 'Pre-payment cancellation policy disclosure' },
      { method: 'POST', path: '/api/refunds/request', description: 'File refund with auto-enforced eligibility calculation' },
      { method: 'GET', path: '/api/refunds/my', description: 'Devotee refund request history' },
      { method: 'GET', path: '/api/admin/metrics', description: 'Admin overview: bookings, FSSAI queue, proof audit' },
      { method: 'GET', path: '/api/admin/refunds', description: 'Admin refund request queue' },
      { method: 'PUT', path: '/api/admin/refunds/:id/review', description: 'Approve or reject refund request' }
    ]
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/temples', templeRoutes);
app.use('/api/pujas', pujaRoutes);
app.use('/api/prasad', prasadRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/admin', adminRoutes);

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
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl} - Route not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

export default app;
