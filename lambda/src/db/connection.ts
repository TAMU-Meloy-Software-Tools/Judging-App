import { Pool, PoolClient } from 'pg';
import { DbCredentials } from '../types';
import { getSecret } from '../utils/secrets';

let pool: Pool | null = null;
let credentials: DbCredentials | null = null;

/**
 * Get database credentials from Secrets Manager
 */
async function getCredentials(): Promise<DbCredentials> {
  if (credentials) return credentials;

  const secretArn = process.env.RDS_SECRET_ARN;
  if (!secretArn) {
    throw new Error('RDS_SECRET_ARN environment variable not set');
  }

  const secret = await getSecret(secretArn);
  credentials = secret as DbCredentials;
  return credentials;
}

/**
 * Get or create database connection pool
 * IMPORTANT: Use max: 1 for Lambda to avoid connection exhaustion
 */
export async function getDbPool(): Promise<Pool> {
  if (pool) return pool;

  const creds = await getCredentials();

  pool = new Pool({
    host: creds.host,
    port: creds.port,
    user: creds.username,
    password: creds.password,
    database: creds.dbname,
    max: 1, // CRITICAL: Lambda should use 1 connection per container
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: {
      rejectUnauthorized: false, // Set to true in production with proper CA
    },
  });

  // Handle connection errors
  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    pool = null; // Force reconnection on next invocation
    credentials = null;
  });

  return pool;
}

/**
 * Execute a query with automatic error handling
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const pool = await getDbPool();
  
  try {
    const result = await pool.query(text, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a query and return a single row
 */
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get a client for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = await getDbPool();
  return await pool.connect();
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the connection pool (for testing)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    credentials = null;
  }
}
