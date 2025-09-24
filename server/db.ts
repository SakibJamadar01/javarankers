import mysql from "mysql2/promise";

const {
  DB_HOST = "127.0.0.1",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = process.env.DB_PASSWORD || "sakib@777",
  DB_NAME = "javarank_app",
} = process.env;

export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function pingDb() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.ping();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
}
