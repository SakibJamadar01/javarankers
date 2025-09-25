import { pool } from "../db.js";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

// Simple rate limiting store
const rateLimitStore = new Map();

function checkRateLimit(key, maxAttempts, windowMs) {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
  
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  return true;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>\"'&]/g, '');
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export async function register(req, res) {
  if (!checkRateLimit(`register_${req.ip}`, 5, 300000)) {
    return res.status(429).json({ error: "Too many registration attempts" });
  }

  const { username, password, email } = req.body;
  
  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.status(400).json({ error: "Invalid input" });
  }
  
  const sanitizedUsername = sanitizeInput(username);
  const sanitizedEmail = email ? sanitizeInput(email) : null;
  
  let conn;
  try {
    conn = await pool.connect();
    await conn.query('BEGIN');
    
    const result = await conn.query(
      "SELECT id FROM users WHERE username = $1 OR (email IS NOT NULL AND email = $2)",
      [username, email || null]
    );
    
    if (result.rows.length > 0) {
      await conn.query('ROLLBACK');
      return res.status(409).json({ error: "Username or email already exists" });
    }

    const password_hash = await hashPassword(password);
    await conn.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)",
      [sanitizedUsername, sanitizedEmail, password_hash]
    );
    await conn.query('COMMIT');
    return res.json({ ok: true, user: { username: sanitizedUsername } });
  } catch (e) {
    console.error('Registration error:', e);
    try { if (conn) await conn.query('ROLLBACK'); } catch {}
    return res.status(503).json({ error: "Database unavailable", details: e.message });
  } finally {
    try { if (conn) conn.release(); } catch {}
  }
}

export async function login(req, res) {
  if (!checkRateLimit(`login_${req.ip}`, 10, 300000)) {
    return res.status(429).json({ error: "Too many login attempts" });
  }

  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Invalid input" });
  }
  
  const sanitizedUsername = sanitizeInput(username);

  let conn;
  try {
    conn = await pool.connect();
    const result = await conn.query(
      "SELECT id, password_hash FROM users WHERE username = $1",
      [sanitizedUsername]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = result.rows[0];
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const photoResult = await conn.query("SELECT profile_photo FROM users WHERE id = $1", [user.id]);
    const profilePhoto = photoResult.rows[0]?.profile_photo || null;
    
    return res.json({ ok: true, user: { username: sanitizedUsername, profilePhoto } });
  } catch {
    // Dev fallback when DB is unreachable
    const expectedUsername = Buffer.from("sakib01", "utf8");
    const providedUsername = Buffer.from(sanitizedUsername, "utf8");
    const expectedPassword = Buffer.from("sakib123", "utf8");
    const providedPassword = Buffer.from(password, "utf8");
    
    if (expectedUsername.length === providedUsername.length && 
        expectedPassword.length === providedPassword.length &&
        crypto.timingSafeEqual(expectedUsername, providedUsername) &&
        crypto.timingSafeEqual(expectedPassword, providedPassword)) {
      return res.json({ ok: true, user: { username: sanitizedUsername, profilePhoto: null } });
    }
    return res.status(503).json({ error: "Database unavailable" });
  } finally {
    try { if (conn) conn.release(); } catch {}
  }
}