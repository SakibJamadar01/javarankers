import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import { register, login } from "./routes/auth.js";

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

export async function createServer() {
  const app = express();
  
  // Security middleware
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true
  }));
  
  // Global rate limiting
  app.use((req, res, next) => {
    if (!checkRateLimit(`global_${req.ip}`, 1000, 60000)) {
      return res.status(429).json({ error: "Too many requests" });
    }
    next();
  });
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Basic API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Debug endpoint
  app.get("/api/debug", async (_req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as time');
      client.release();
      res.json({ 
        status: 'Database connected', 
        time: result.rows[0].time,
        env: {
          DB_HOST: process.env.DB_HOST,
          DB_PORT: process.env.DB_PORT,
          DB_USER: process.env.DB_USER,
          DB_NAME: process.env.DB_NAME,
          hasPassword: !!process.env.DB_PASSWORD
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message, stack: error.stack });
    }
  });

  // Test register endpoint
  app.get("/api/test-register", async (req, res) => {
    try {
      // Test database connection
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
          dbHost: process.env.DB_HOST,
          dbUser: process.env.DB_USER
        }
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        stack: error.stack
      });
    }
  });

  // Auth endpoints
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);

  return app;
}