import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const {
  DB_HOST = "aws-1-ap-southeast-1.pooler.supabase.com",
  DB_PORT = "6543",
  DB_USER = "postgres.npepikzrelfxymfwmhgu",
  DB_PASSWORD,
  DB_NAME = "postgres",
} = process.env;

console.log('Testing database connection with:');
console.log('Host:', DB_HOST);
console.log('Port:', DB_PORT);
console.log('User:', DB_USER);
console.log('Database:', DB_NAME);
console.log('Has Password:', !!DB_PASSWORD);

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

async function testConnection() {
  try {
    console.log('\nAttempting to connect to database...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('Current time:', result.rows[0].current_time);
    console.log('Database version:', result.rows[0].db_version);
    
    // Test if users table exists
    try {
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'admin', 'challenges')
      `);
      console.log('Available tables:', tableCheck.rows.map(row => row.table_name));
    } catch (e) {
      console.log('Could not check tables:', e.message);
    }
    
    client.release();
    console.log('✅ Connection test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    if (error.code === 'ENOTFOUND') {
      console.error('This usually means the hostname is incorrect or DNS resolution failed.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('This usually means the database server is not running or the port is incorrect.');
    } else if (error.code === '28P01') {
      console.error('This usually means the password is incorrect.');
    }
  } finally {
    await pool.end();
  }
}

testConnection();