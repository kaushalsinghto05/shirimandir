import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

export type DrizzleDb = ReturnType<typeof drizzlePg<typeof schema>>;
export type DrizzleDbOrTx = DrizzleDb | any;

let dbInstance: any = null;
let rawPool: pg.Pool | null = null;
let pgliteInstance: PGlite | null = null;

export async function getDb(): Promise<{ db: any; isPostgres: boolean; pglite: PGlite | null; pool: pg.Pool | null }> {
  if (dbInstance) {
    return {
      db: dbInstance,
      isPostgres: Boolean(process.env.DATABASE_URL),
      pglite: pgliteInstance,
      pool: rawPool,
    };
  }

  if (process.env.DATABASE_URL) {
    rawPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    dbInstance = drizzlePg(rawPool, { schema });
    return {
      db: dbInstance,
      isPostgres: true,
      pglite: null,
      pool: rawPool,
    };
  }

  // Fallback to embedded PGlite for zero-setup real PostgreSQL 16
  pgliteInstance = new PGlite();
  dbInstance = drizzlePglite(pgliteInstance, { schema });
  return {
    db: dbInstance,
    isPostgres: false,
    pglite: pgliteInstance,
    pool: null,
  };
}

/**
 * Execute a multi-statement DDL/DML script on either pg or pglite
 */
export async function executeScript(script: string): Promise<void> {
  const { pool, pglite, db } = await getDb();
  if (pool) {
    await pool.query(script);
  } else if (pglite) {
    await pglite.exec(script);
  } else {
    await db.execute(sql.raw(script));
  }
}

/**
 * Execute operations strictly scoped to a tenant using transaction-level SET LOCAL (AT-11 guarantee)
 * Any subsequent query executed within this transaction is bounded by the tenant RLS policies.
 * When the transaction commits or rolls back, PostgreSQL automatically resets app.current_tenant_id.
 */
export async function withTenantContext<T>(
  tenantId: string,
  callback: (tx: any) => Promise<T>
): Promise<T> {
  const { db } = await getDb();

  return await db.transaction(async (tx: any) => {
    // Transaction-scoped local setting using set_config(..., true) (cleared automatically on COMMIT/ROLLBACK)
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
    return await callback(tx);
  });
}

/**
 * Reset pool connections if needed
 */
export async function closeDb(): Promise<void> {
  if (rawPool) {
    await rawPool.end();
    rawPool = null;
  }
  if (pgliteInstance) {
    await pgliteInstance.close();
    pgliteInstance = null;
  }
  dbInstance = null;
}
