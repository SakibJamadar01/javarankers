import { Pool } from 'pg';

const {
  DB_HOST = "aws-1-ap-southeast-1.pooler.supabase.com",
  DB_PORT = "6543",
  DB_USER = "postgres.npepikzrelfxymfwmhgu",
  DB_PASSWORD,
  DB_NAME = "postgres",
} = process.env;

export const pool = new Pool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function pingDb() {
  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT 1');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
}