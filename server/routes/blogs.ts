import { Router } from "express";
import { pool } from "../db.js";
import { sanitizeInput, sanitizeHtml, checkRateLimit, validateCsrfToken } from "../utils/security.js";
import { z } from "zod";

const router = Router();

const blogSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  author: z.string().min(1).max(100),
  published: z.boolean().optional()
});

// Get all published blogs
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, title, author, slug, created_at FROM blogs WHERE published = TRUE ORDER BY created_at DESC"
    );
    res.json({ blogs: rows });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// Get single blog by slug
router.get("/:slug", async (req, res) => {
  try {
    const slug = sanitizeInput(req.params.slug);
    const [rows] = await pool.execute(
      "SELECT * FROM blogs WHERE slug = ? AND published = TRUE",
      [slug]
    );
    
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }
    
    res.json({ blog: rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog" });
  }
});

// Admin: Get all blogs
router.get("/admin/all", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM blogs ORDER BY created_at DESC"
    );
    res.json({ blogs: rows });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// Admin: Create blog
router.post("/admin", (req, res, next) => {
  const token = req.headers['x-csrf-token'] as string;
  if (!token || !validateCsrfToken(token)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next();
}, async (req, res) => {
  try {
    if (!checkRateLimit(`blog_create_${req.ip}`, 5, 300000)) {
      return res.status(429).json({ error: "Too many requests" });
    }

    const parsed = blogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { title, content, author, published = false } = parsed.data;
    const slug = sanitizeInput(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    
    const [result] = await pool.execute(
      "INSERT INTO blogs (title, content, author, slug, published) VALUES (?, ?, ?, ?, ?)",
      [sanitizeHtml(title), sanitizeHtml(content), sanitizeHtml(author), slug, published]
    );

    res.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create blog" });
  }
});

// Admin: Update blog
router.put("/admin/:id", (req, res, next) => {
  const token = req.headers['x-csrf-token'] as string;
  if (!token || !validateCsrfToken(token)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next();
}, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = blogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { title, content, author, published = false } = parsed.data;
    const slug = sanitizeInput(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));

    await pool.execute(
      "UPDATE blogs SET title = ?, content = ?, author = ?, slug = ?, published = ? WHERE id = ?",
      [sanitizeHtml(title), sanitizeHtml(content), sanitizeHtml(author), slug, published, id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update blog" });
  }
});

// Admin: Delete blog
router.delete("/admin/:id", (req, res, next) => {
  const token = req.headers['x-csrf-token'] as string;
  if (!token || !validateCsrfToken(token)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next();
}, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await pool.execute("DELETE FROM blogs WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog" });
  }
});

export default router;