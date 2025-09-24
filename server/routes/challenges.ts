import { Router } from "express";
import { pool } from "../db.js";
import type { Challenge } from "../../shared/api.js";
import { sanitizeInput, sanitizeHtml, checkRateLimit, validateCsrfToken } from "../utils/security.js";

const router = Router();

// Get all challenges
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM challenges ORDER BY created_at DESC"
    );
    
    const challenges = (rows as any[]).map(row => {
      let testCases;
      try {
        if (row.test_cases) {
          // If it's already an object, use it directly
          if (typeof row.test_cases === 'object') {
            testCases = row.test_cases;
          } else {
            // If it's a string, parse it
            testCases = JSON.parse(row.test_cases);
          }
        } else {
          testCases = undefined;
        }
      } catch (e) {
        console.error('Invalid JSON in test_cases for challenge:', String(row.id).replace(/[\r\n\t]/g, '').slice(0, 100));
        testCases = undefined;
      }
      return {
        id: row.id,
        title: row.title,
        problem: row.problem,
        concept: row.concept,
        category: row.category,
        difficulty: row.difficulty,
        sampleCode: row.sample_code,
        testCases
      };
    });
    

    res.json({ challenges });
  } catch (error) {
    console.error("Error fetching challenges:", String(error).replace(/[\r\n\t]/g, '').slice(0, 200));
    res.status(500).json({ error: "Failed to fetch challenges" });
  }
});

// Create or update challenge
router.post("/", (req, res, next) => {
  const token = req.headers['x-csrf-token'] as string;
  if (!token || !validateCsrfToken(token)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next();
}, async (req, res) => {
  try {
    if (!checkRateLimit(`challenge_${req.ip}`, 50, 60000)) {
      return res.status(429).json({ error: "Too many requests" });
    }

    const challenge = req.body as Challenge;
    
    // Sanitize all inputs
    const sanitizedChallenge = {
      id: sanitizeInput(challenge.id),
      title: sanitizeHtml(challenge.title),
      problem: sanitizeHtml(challenge.problem),
      concept: sanitizeHtml(challenge.concept),
      category: sanitizeInput(challenge.category),
      difficulty: sanitizeInput(challenge.difficulty),
      sampleCode: challenge.sampleCode ? challenge.sampleCode.trim().slice(0, 5000) : null
    };
    
    const testCasesJson = challenge.testCases ? JSON.stringify(challenge.testCases) : null;
    
    const [result] = await pool.execute(
      `INSERT INTO challenges (id, title, problem, concept, category, difficulty, sample_code, test_cases)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       problem = VALUES(problem),
       concept = VALUES(concept),
       category = VALUES(category),
       difficulty = VALUES(difficulty),
       sample_code = VALUES(sample_code),
       test_cases = VALUES(test_cases),
       updated_at = CURRENT_TIMESTAMP`,
      [
        sanitizedChallenge.id,
        sanitizedChallenge.title,
        sanitizedChallenge.problem,
        sanitizedChallenge.concept,
        sanitizedChallenge.category,
        sanitizedChallenge.difficulty,
        sanitizedChallenge.sampleCode,
        testCasesJson
      ]
    );
    

    res.json({ success: true, challenge });
  } catch (error) {
    console.error("Error saving challenge:", String(error).replace(/[\r\n\t]/g, '').slice(0, 200));
    res.status(500).json({ error: "Failed to save challenge" });
  }
});

// Delete challenge
router.delete("/:id", (req, res, next) => {
  const token = req.headers['x-csrf-token'] as string;
  if (!token || !validateCsrfToken(token)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next();
}, async (req, res) => {
  try {
    const id = sanitizeInput(req.params.id);
    
    await pool.execute("DELETE FROM challenges WHERE id = ?", [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting challenge:", String(error).replace(/[\r\n\t]/g, '').slice(0, 200));
    res.status(500).json({ error: "Failed to delete challenge" });
  }
});

// Bulk delete challenges
router.post("/bulk-delete", (req, res, next) => {
  const token = req.headers['x-csrf-token'] as string;
  if (!token || !validateCsrfToken(token)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next();
}, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid ids array" });
    }
    
    const sanitizedIds = ids.map(id => sanitizeInput(id));
    const placeholders = sanitizedIds.map(() => '?').join(',');
    
    const [result] = await pool.execute(
      `DELETE FROM challenges WHERE id IN (${placeholders})`,
      sanitizedIds
    );
    
    res.json({ success: true, deletedCount: (result as any).affectedRows });
  } catch (error) {
    console.error("Error bulk deleting challenges:", String(error).replace(/[\r\n\t]/g, '').slice(0, 200));
    res.status(500).json({ error: "Failed to bulk delete challenges" });
  }
});


export default router;