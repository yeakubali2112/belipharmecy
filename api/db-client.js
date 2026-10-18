import postgres from 'postgres';
import 'dotenv/config';

const rawDbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || '';

/**
 * Validates whether the DATABASE_URL is configured with an actual password
 */
export const isDbConfigured = () => {
  if (!rawDbUrl) return false;
  if (rawDbUrl.includes('[YOUR-PASSWORD]') || rawDbUrl.includes('[PASSWORD]')) {
    return false;
  }
  return true;
};

let sqlInstance = null;

/**
 * Returns a pooled Postgres connection instance
 */
export const getDb = () => {
  if (!isDbConfigured()) {
    throw new Error('DATABASE_URL is not configured with a valid password. Please update your .env file with your Supabase database password.');
  }

  if (!sqlInstance) {
    const connectionString = rawDbUrl.trim();
    sqlInstance = postgres(connectionString, {
      ssl: 'require',
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false // Required for pgbouncer transaction mode!
    });
  }

  return sqlInstance;
};

/**
 * Executes a function with automatic database connection handling
 */
export const withDb = async (fn) => {
  const sql = getDb();
  return await fn(sql);
};
