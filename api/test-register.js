import { Pool } from 'pg';

export default async function handler(req, res) {
  try {
    // Test database connection directly
    const {
      DB_HOST = "aws-1-ap-southeast-1.pooler.supabase.com",
      DB_PORT = "6543",
      DB_USER = "postgres.npepikzrelfxymfwmhgu",
      DB_PASSWORD,
      DB_NAME = "postgres",
    } = process.env;

    const pool = new Pool({
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

    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    client.release();
    
    res.status(200).json({
      dbConnection: 'OK',
      dbTime: result.rows[0].time,
      message: 'Database connection successful',
      env: {
        hasDbHost: !!process.env.DB_HOST,
        hasDbPassword: !!process.env.DB_PASSWORD,
        dbHost: DB_HOST,
        dbUser: DB_USER
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}