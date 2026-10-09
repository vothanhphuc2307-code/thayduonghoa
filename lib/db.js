import pg from 'pg';

const { Pool } = pg;
let pool;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Copy .env.example to .env and configure PostgreSQL.');
  }
  if (!pool) {
    const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isLocal ? false : true,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
      allowExitOnIdle: true
    });
  }
  return pool;
}

export async function query(text, params = []) {
  return getPool().query(text, params);
}
