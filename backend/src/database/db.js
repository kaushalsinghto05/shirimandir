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
      pgSql = pgSql.replace(/\$9\b/g, '($9::boolean)');
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
 * Initialize Database Tables
 */
export async function initDb() {
  if (isPostgres) {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pgPool.query(schemaSql);
    try {
      await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT FALSE;');
    } catch {
      // column already exists
    }
    console.log('PostgreSQL schema verified and applied.');
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
