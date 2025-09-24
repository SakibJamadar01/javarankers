import type { Request, Response } from "express";
import { pool } from "../db";
import { sanitizeInput } from "../utils/security.js";

// Simple analytics tracking
export async function trackActivity(req: Request, res: Response) {
  try {
    const { username, challengeId, mode, status, timeSpent, code } = req.body;
    
    const conn = await pool.getConnection();
    
    // Create simple analytics table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS analytics_simple (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        challenge_id VARCHAR(100) NOT NULL,
        mode ENUM('PRACTICE', 'CHALLENGE') NOT NULL,
        status ENUM('PASSED', 'FAILED', 'ERROR') NOT NULL,
        time_spent INT DEFAULT 0,
        code_length INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_mode (mode)
      )
    `);
    
    // Insert activity
    await conn.query(`
      INSERT INTO analytics_simple (username, challenge_id, mode, status, time_spent, code_length)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      sanitizeInput(username),
      sanitizeInput(challengeId),
      mode,
      status,
      timeSpent || 0,
      code ? code.length : 0
    ]);
    
    conn.release();
    res.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.json({ success: false });
  }
}

// Get analytics data
export async function getAnalytics(req: Request, res: Response) {
  try {
    const { username } = req.body;
    const conn = await pool.getConnection();
    
    // Get practice stats
    const [practiceStats] = await conn.query(`
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(DISTINCT challenge_id) as unique_challenges,
        SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as passed_count,
        AVG(time_spent) as avg_time,
        AVG(code_length) as avg_code_length
      FROM analytics_simple 
      WHERE username = ? AND mode = 'PRACTICE'
    `, [sanitizeInput(username)]);
    
    // Get challenge stats
    const [challengeStats] = await conn.query(`
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(DISTINCT challenge_id) as unique_challenges,
        SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as passed_count,
        AVG(time_spent) as avg_time,
        AVG(code_length) as avg_code_length
      FROM analytics_simple 
      WHERE username = ? AND mode = 'CHALLENGE'
    `, [sanitizeInput(username)]);
    
    // Get daily activity (last 7 days)
    const [dailyActivity] = await conn.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as attempts,
        SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as passed
      FROM analytics_simple 
      WHERE username = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [sanitizeInput(username)]);
    
    conn.release();
    
    res.json({
      practice: practiceStats[0] || { total_attempts: 0, unique_challenges: 0, passed_count: 0, avg_time: 0, avg_code_length: 0 },
      challenge: challengeStats[0] || { total_attempts: 0, unique_challenges: 0, passed_count: 0, avg_time: 0, avg_code_length: 0 },
      dailyActivity: dailyActivity || []
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.json({
      practice: { total_attempts: 0, unique_challenges: 0, passed_count: 0, avg_time: 0, avg_code_length: 0 },
      challenge: { total_attempts: 0, unique_challenges: 0, passed_count: 0, avg_time: 0, avg_code_length: 0 },
      dailyActivity: []
    });
  }
}