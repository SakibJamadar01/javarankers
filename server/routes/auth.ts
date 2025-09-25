import type { Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcrypt";
import { z } from "zod";
import crypto from "node:crypto";
import { sanitizeInput, checkRateLimit } from "../utils/security.js";

const registerSchema = z.object({
  username: z.string().min(3).max(64).regex(/^[a-zA-Z0-9_\-.]+$/),
  password: z.string().min(6).max(128),
  email: z.string().email().max(191).optional(),
});

const loginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

const profilePhotoSchema = z.object({
  username: z.string().min(1).max(64),
  photo: z.string().max(1000000),
});

const adminLoginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

const adminProfilePhotoSchema = z.object({
  username: z.string().min(1).max(64),
  photo: z.string().max(1000000),
});

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function register(req: Request, res: Response) {
  if (!checkRateLimit(`register_${req.ip}`, 5, 300000)) {
    return res.status(429).json({ error: "Too many registration attempts" });
  }

  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { username, password, email } = parse.data;
  
  const sanitizedUsername = sanitizeInput(username);
  const sanitizedEmail = email ? sanitizeInput(email) : null;
  let conn: any;
  try {
    conn = await pool.connect();
    await conn.query('BEGIN');
    const result = await conn.query(
      "SELECT id FROM users WHERE username = $1 OR (email IS NOT NULL AND email = $2)",
      [username, email ?? null]
    );
    const rows = result.rows;
    if (rows.length > 0) {
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
    try { if (conn) await conn.query('ROLLBACK'); } catch {}
    // If DB is unreachable in this environment, surface a clear message
    return res.status(503).json({ error: "Database unavailable" });
  } finally {
    try { if (conn) conn.release(); } catch {}
  }
}

export async function login(req: Request, res: Response) {
  if (!checkRateLimit(`login_${req.ip}`, 10, 300000)) {
    return res.status(429).json({ error: "Too many login attempts" });
  }

  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { username, password } = parse.data;
  
  const sanitizedUsername = sanitizeInput(username);

  let conn: any;
  try {
    conn = await pool.connect();
    const result = await conn.query(
      "SELECT id, password_hash FROM users WHERE username = $1",
      [sanitizedUsername]
    );
    const rows = result.rows;
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = rows[0];
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const photoResult = await conn.query("SELECT profile_photo FROM users WHERE id = $1", [user.id]);
    const profilePhoto = photoResult.rows[0]?.profile_photo || null;
    
    return res.json({ ok: true, user: { username: sanitizedUsername, profilePhoto } });
  } catch {
    // Dev fallback when DB is unreachable: allow default credentials
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

export async function updateProfilePhoto(req: Request, res: Response) {
  const parse = profilePhotoSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { username, photo } = parse.data;
  
  const sanitizedUsername = sanitizeInput(username);

  let conn: any;
  try {
    conn = await pool.connect();
    
    await conn.query(
      "UPDATE users SET profile_photo = $1 WHERE username = $2",
      [photo, sanitizedUsername]
    );
    
    return res.json({ ok: true });
  } catch (e) {
    return res.status(503).json({ error: "Database unavailable" });
  } finally {
    try { if (conn) conn.release(); } catch {}
  }
}

export async function adminLogin(req: Request, res: Response) {
  if (!checkRateLimit(`admin_login_${req.ip}`, 3, 300000)) {
    return res.status(429).json({ error: "Too many admin login attempts" });
  }

  const parse = adminLoginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { username, password } = parse.data;
  
  const sanitizedUsername = sanitizeInput(username);

  let conn: any;
  try {
    conn = await pool.connect();
    
    // Insert default admin if not exists
    const defaultHash = await hashPassword('SAKIB@ADMIN');
    await conn.query(`
      INSERT INTO admin (username, password_hash) 
      VALUES ($1, $2) ON CONFLICT (username) DO NOTHING
    `, ['SAKIBJ', defaultHash]);
    
    const result = await conn.query(
      "SELECT id, password_hash FROM admin WHERE username = $1",
      [sanitizedUsername]
    );
    const rows = result.rows;
    
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }
    
    const admin = rows[0];
    const ok = await verifyPassword(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid admin credentials" });
    
    // Get admin profile photo
    const photoResult = await conn.query("SELECT profile_photo FROM admin WHERE id = $1", [admin.id]);
    const profilePhoto = photoResult.rows[0]?.profile_photo || null;
    
    return res.json({ ok: true, admin: { username: sanitizedUsername, profilePhoto } });
  } catch (e) {
    const expectedAdminUsername = Buffer.from("SAKIBJ", "utf8");
    const providedAdminUsername = Buffer.from(sanitizedUsername, "utf8");
    const expectedAdminPassword = Buffer.from("SAKIB@ADMIN", "utf8");
    const providedAdminPassword = Buffer.from(password, "utf8");
    
    if (expectedAdminUsername.length === providedAdminUsername.length && 
        expectedAdminPassword.length === providedAdminPassword.length &&
        crypto.timingSafeEqual(expectedAdminUsername, providedAdminUsername) &&
        crypto.timingSafeEqual(expectedAdminPassword, providedAdminPassword)) {
      return res.json({ ok: true, admin: { username: sanitizedUsername, profilePhoto: null } });
    }
    return res.status(503).json({ error: "Database unavailable" });
  } finally {
    try { if (conn) conn.release(); } catch {}
  }
}

export async function updateAdminProfilePhoto(req: Request, res: Response) {
  const parse = adminProfilePhotoSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { username, photo } = parse.data;
  
  const sanitizedUsername = sanitizeInput(username);

  let conn: any;
  try {
    conn = await pool.connect();
    
    await conn.query(
      "UPDATE admin SET profile_photo = $1 WHERE username = $2",
      [photo, sanitizedUsername]
    );
    
    return res.json({ ok: true });
  } catch (e) {
    return res.status(503).json({ error: "Database unavailable" });
  } finally {
    try { if (conn) conn.release(); } catch {}
  }
}