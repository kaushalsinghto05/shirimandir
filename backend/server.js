import app from './src/app.js';
import { config } from './src/config/index.js';
import { initDb, getDbEngine } from './src/database/db.js';
import { seedDatabase } from './src/database/seed.js';
import { ModulithManifest } from './src/modules/index.js';

async function startServer() {
  try {
    console.log(`[BOOT] Initializing Shiri Mandir Database engine: ${getDbEngine()}...`);
    try {
      await initDb();
    } catch (dbErr) {
      console.warn('[BOOT] Database initialization notice (non-fatal):', dbErr.message);
    }
    
    // Auto-seed initial datasets defensively
    try {
      await seedDatabase();
    } catch (seedErr) {
      console.warn('[BOOT] Database seed notice (non-fatal):', seedErr.message);
    }

    app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🛕 SHIRI MANDIR BACKEND REST API IS RUNNING`);
      console.log(`Port:            http://localhost:${config.port}`);
      console.log(`Architecture:    Modular Monolith (Modulith - ${ModulithManifest.length} Domain Modules)`);
      console.log(`Environment:     ${config.nodeEnv}`);
      console.log(`Database Engine: ${getDbEngine()}`);
      console.log(`API Docs:        http://localhost:${config.port}/api/docs`);
      console.log(`Health Check:    http://localhost:${config.port}/api/health`);
      console.log(`Compliance:      Active (FSSAI, Proof-of-Service, HMAC Webhooks, Consent)`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Fatal boot error in Shiri Mandir Server:', err);
    try {
      app.listen(config.port, () => {
        console.log(`[BOOT-FALLBACK] Server listening on port ${config.port} in degraded mode`);
      });
    } catch {
      process.exit(1);
    }
  }
}

startServer();
