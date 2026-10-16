import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isPostgres = Boolean(process.env.DATABASE_URL);
let pgPool = null;
let sqliteDb = null;

if (isPostgres) {
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  pgPool.on('error', (err) => {
    console.warn('[DB] Unexpected error on idle PostgreSQL client:', err.message);
  });
} else {
  // Local SQLite database file in backend root or local data directory
  const dbDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'shirimandir.sqlite');
  sqliteDb = new DatabaseSync(dbPath);
  sqliteDb.exec('PRAGMA foreign_keys = ON;');
}

/**
 * Universal Query Runner
 * Handles parameter translation: converts $1, $2, ... to ? for SQLite.
 */
export async function query(sqlText, params = []) {
  if (isPostgres) {
    let pgSql = sqlText
      .replace(/datetime\('now',\s*'-(\d+)\s*days'\)/gi, "CURRENT_TIMESTAMP - INTERVAL '$1 days'")
      .replace(/datetime\('now'\)/gi, 'CURRENT_TIMESTAMP')
      .replace(/\bis_active\s*=\s*1\b/gi, 'is_active = TRUE')
      .replace(/\bis_active\s*=\s*0\b/gi, 'is_active = FALSE')
      .replace(/\bis_edible\s*=\s*1\b/gi, 'is_edible = TRUE')
      .replace(/\bis_edible\s*=\s*0\b/gi, 'is_edible = FALSE')
      .replace(/\bconsent_data_sharing\s*=\s*1\b/gi, 'consent_data_sharing = TRUE')
      .replace(/\bconsent_data_sharing\s*=\s*0\b/gi, 'consent_data_sharing = FALSE')
      .replace(/\bconsent_data_shared\s*=\s*1\b/gi, 'consent_data_shared = TRUE')
      .replace(/\bconsent_data_shared\s*=\s*0\b/gi, 'consent_data_shared = FALSE')
      .replace(/\bverified_server_side\s*=\s*1\b/gi, 'verified_server_side = TRUE')
      .replace(/\bverified_server_side\s*=\s*0\b/gi, 'verified_server_side = FALSE');

    // Auto-cast parameter placeholders for boolean columns in PostgreSQL
    if (/INSERT INTO users/i.test(pgSql)) {
      pgSql = pgSql
        .replace(/\$5\b/g, '($5::boolean)')
        .replace(/\$6\b/g, '($6::boolean)')
        .replace(/\$9\b/g, '($9::boolean)')
        .replace(/\$10\b/g, '($10::boolean)');
    }
    if (/UPDATE users/i.test(pgSql) && /consent_data_sharing\s*=\s*\$1/i.test(pgSql)) {
      pgSql = pgSql.replace(/consent_data_sharing\s*=\s*\$1/i, 'consent_data_sharing = ($1::boolean)');
    }
    if (/INSERT INTO bookings/i.test(pgSql)) {
      pgSql = pgSql.replace(/\$13\b/g, '($13::boolean)');
    }
    if (/INSERT INTO prasad_items/i.test(pgSql)) {
      pgSql = pgSql.replace(/\$10\b/g, '($10::boolean)').replace(/\$12\b/g, '($12::boolean)');
    }

    const res = await pgPool.query(pgSql, params);
    return { rows: res.rows, rowCount: res.rowCount };
  }

  // SQLite execution
  try {
    // Translate $1, $2 to ? for compatibility
    const translatedSql = sqlText.replace(/\$(\d+)/g, '?');
    const trimmed = translatedSql.trim();
    const isSelect = /^SELECT|^PRAGMA/i.test(trimmed);
    const hasReturning = /RETURNING/i.test(translatedSql);

    // Convert booleans to 1 / 0 for SQLite binding compatibility
    const sqliteParams = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);

    // Prepare statement
    const stmt = sqliteDb.prepare(translatedSql);

    if (isSelect || hasReturning) {
      const rows = stmt.all(...sqliteParams);
      return { rows, rowCount: rows.length };
    } else {
      const result = stmt.run(...sqliteParams);
      return {
        rows: [],
        rowCount: result.changes,
        lastInsertRowid: Number(result.lastInsertRowid)
      };
    }
  } catch (err) {
    console.error('Database query error:', err.message, '\nSQL:', sqlText, '\nParams:', params);
    throw err;
  }
}

/**
 * Initialize Database Tables and Migrations
 */
export async function initDb() {
  if (isPostgres) {
    // 1. Apply base schema defensively
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pgPool.query(schemaSql);
    } catch (schemaErr) {
      console.warn('[DB] Notice while executing schema.sql:', schemaErr.message);
    }

    // 2. Incremental column migrations for existing instances
    try {
      await pgPool.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_data_sharing BOOLEAN NOT NULL DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_ip_address VARCHAR(45);
      `);
    } catch (colErr) {
      console.warn('[DB] Column migration notice:', colErr.message);
    }

    // 3. Relax name column requirements if present
    try {
      await pgPool.query(`ALTER TABLE users ALTER COLUMN name SET DEFAULT '';`);
      await pgPool.query(`ALTER TABLE users ALTER COLUMN name DROP NOT NULL;`);
    } catch {
      // already nullable or default set
    }

    // 4. Update role constraint to include 'super_admin'
    try {
      await pgPool.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;`);
      await pgPool.query(`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('devotee', 'admin', 'super_admin', 'temple_partner'));`);
    } catch (constErr) {
      console.warn('[DB] Role constraint migration notice:', constErr.message);
    }

    // 5. Resync sequences to avoid duplicate key conflicts after explicit ID seeds
    try {
      const tables = [
        'users', 'temples', 'pujas', 'puja_packages', 'prasad_items',
        'bookings', 'orders', 'order_items', 'payments', 'refund_requests',
        'donation_campaigns', 'donations', 'receipts', 'audit_logs', 'reconciliation_exceptions'
      ];
      for (const tbl of tables) {
        await pgPool.query(`SELECT setval(pg_get_serial_sequence('${tbl}', 'id'), COALESCE((SELECT MAX(id) FROM ${tbl}), 1), true);`).catch(() => {});
      }
    } catch (seqErr) {
      console.warn('[DB] Sequence sync notice:', seqErr.message);
    }

    console.log('PostgreSQL schema and migrations verified and applied.');
  } else {
    const schemaPath = path.join(__dirname, 'schema_sqlite.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    sqliteDb.exec(schemaSql);
    try {
      sqliteDb.exec('ALTER TABLE users ADD COLUMN profile_completed INTEGER NOT NULL DEFAULT 0;');
    } catch {
      // column already exists
    }
    console.log('SQLite schema verified and applied successfully.');
  }
}

export function getDbEngine() {
  return isPostgres ? 'postgresql' : 'sqlite';
}
