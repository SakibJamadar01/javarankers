import type { Request, Response } from "express";
import { z } from "zod";
import { pool } from "../db";
import { sanitizeInput, checkRateLimit } from "../utils/security.js";

const summarySchema = z.object({ username: z.string().min(1).max(64) });
const resetSchema = z.object({ username: z.string().min(1).max(64) });
const trackSchema = z.object({
  username: z.string().min(1).max(64),
  challengeId: z.string().min(1).max(100),
  mode: z.enum(['PRACTICE', 'CHALLENGE']).default('PRACTICE'),
  code: z.string().min(1),
  status: z.enum(['PASSED', 'FAILED', 'ERROR', 'TIMEOUT']),
  executionTime: z.number().optional(),
  testCasesPassed: z.number().optional(),
  testCasesTotal: z.number().optional()
});

export async function analyticsSummary(req: Request, res: Response) {
  if (!checkRateLimit(`analytics_${req.ip}`, 20, 60000)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const parsed = summarySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { username } = parsed.data;
  
  const sanitizedUsername = sanitizeInput(username);

  let conn: any;
  try {
    conn = await pool.getConnection();
    await createAnalyticsTables(conn);

    // Get analytics for all three modes: PRACTICE, CHALLENGE, COMBINED
    const practiceStats = await getModeStats(conn, sanitizedUsername, 'PRACTICE');
    const challengeStats = await getModeStats(conn, sanitizedUsername, 'CHALLENGE');
    const combinedStats = await getModeStats(conn, sanitizedUsername, 'COMBINED');

    return res.json({
      ok: true,
      practice: practiceStats,
      challenge: challengeStats,
      combined: combinedStats
    });
  } catch (e) {
    console.error('Analytics database error:', e);
    return res.json({
      ok: true,
      practice: getEmptyStats(sanitizedUsername),
      challenge: getEmptyStats(sanitizedUsername),
      combined: getEmptyStats(sanitizedUsername)
    });
  } finally {
    try { if (conn) conn.release(); } catch {}
  }
}

export async function trackSubmission(req: Request, res: Response) {
  const parsed = trackSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { username, challengeId, mode, code, status, executionTime, testCasesPassed, testCasesTotal } = parsed.data;
  
  const sanitizedUsername = sanitizeInput(username);
  const sanitizedChallengeId = sanitizeInput(challengeId);
  const sanitizedCode = sanitizeInput(code);

  let conn: any;
  try {
    conn = await pool.getConnection();
    await createAnalyticsTables(conn);

    // Simple insert without transaction for now
    await conn.query(`
      INSERT INTO user_submissions 
      (username, challenge_id, mode, code, status, execution_time_ms, test_cases_passed, test_cases_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [sanitizedUsername, sanitizedChallengeId, mode, sanitizedCode, status, executionTime || null, testCasesPassed || 0, testCasesTotal || 0]);

    return res.json({ ok: true });
  } catch (e) {
    console.error('Analytics tracking error:', e);
    return res.status(200).json({ ok: false, error: String(e) }); // Return 200 to not break frontend
  } finally {
    try { if (conn) conn.release(); } catch {}
  }
}

export async function resetAnalytics(req: Request, res: Response) {
  if (!checkRateLimit(`reset_${req.ip}`, 3, 300000)) {
    return res.status(429).json({ error: "Too many reset requests" });
  }

  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { username } = parsed.data;
  
  const sanitizedUsername = sanitizeInput(username);

  let conn: any;
  try {
    conn = await pool.getConnection();
    
    // Delete all analytics data for the user
    await conn.query("DELETE FROM user_submissions WHERE username = ?", [sanitizedUsername]);
    await conn.query("DELETE FROM user_activity WHERE username = ?", [sanitizedUsername]);
    await conn.query("DELETE FROM user_skills WHERE username = ?", [sanitizedUsername]);
    
    // Also clean up any orphaned data
    await conn.query("DELETE FROM user_stats WHERE user_id IN (SELECT id FROM users WHERE username = ?)", [sanitizedUsername]);
    await conn.query("DELETE FROM user_events WHERE user_id IN (SELECT id FROM users WHERE username = ?)", [sanitizedUsername]);

    return res.json({ ok: true });
  } catch (e) {
    return res.status(503).json({ error: "Database unavailable" });
  } finally {
    try { if (conn) conn.release(); } catch {}
  }
}

async function createAnalyticsTables(conn: any) {
  // Check if mode column exists, if not add it
  try {
    const [columns] = await conn.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_submissions' AND COLUMN_NAME = 'mode'
    `);
    
    if (columns.length === 0) {
      await conn.query(`
        ALTER TABLE user_submissions 
        ADD COLUMN mode ENUM('PRACTICE', 'CHALLENGE') NOT NULL DEFAULT 'PRACTICE' 
        AFTER challenge_id
      `);
    }
  } catch (e) {
    // Table doesn't exist, create it
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        challenge_id VARCHAR(100) NOT NULL,
        mode ENUM('PRACTICE', 'CHALLENGE') NOT NULL DEFAULT 'PRACTICE',
        code TEXT NOT NULL,
        status ENUM('PASSED', 'FAILED', 'ERROR', 'TIMEOUT') NOT NULL,
        execution_time_ms INT DEFAULT NULL,
        test_cases_passed INT DEFAULT 0,
        test_cases_total INT DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_challenge (challenge_id),
        INDEX idx_mode (mode),
        INDEX idx_username_mode (username, mode)
      )
    `);
  }

  
  await conn.query(`
    CREATE TABLE IF NOT EXISTS user_activity (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(64) NOT NULL,
      activity_date DATE NOT NULL,
      mode ENUM('PRACTICE', 'CHALLENGE', 'COMBINED') NOT NULL DEFAULT 'COMBINED',
      challenges_attempted INT DEFAULT 0,
      challenges_solved INT DEFAULT 0,
      total_submissions INT DEFAULT 0,
      time_spent_minutes INT DEFAULT 0,
      streak_days INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_date_mode (username, activity_date, mode)
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS user_skills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(64) NOT NULL,
      category VARCHAR(50) NOT NULL,
      mode ENUM('PRACTICE', 'CHALLENGE', 'COMBINED') NOT NULL DEFAULT 'COMBINED',
      skill_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT') DEFAULT 'BEGINNER',
      problems_solved INT DEFAULT 0,
      accuracy_rate DECIMAL(5,2) DEFAULT 0,
      avg_solve_time_minutes INT DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_category_mode (username, category, mode)
    )
  `);
}

function getCategoryFromChallengeId(challengeId: string): string {
  const prefixMap: { [key: string]: string } = {
    'dt-': 'Data Types',
    'cond-': 'Conditionals', 
    'loop-': 'Loops',
    'arr-': 'Arrays',
    'str-': 'Strings',
    'func-': 'Functions',
    'oop-': 'OOP'
  };
  
  for (const [prefix, category] of Object.entries(prefixMap)) {
    if (challengeId.startsWith(prefix)) return category;
  }
  return 'General';
}

async function updateUserSkill(conn: any, username: string, category: string, mode: string, solved: boolean) {
  const [rows] = await conn.query(`
    SELECT problems_solved, accuracy_rate FROM user_skills 
    WHERE username = ? AND category = ? AND mode = ?
  `, [username, category, mode]);

  const current = rows[0] || { problems_solved: 0, accuracy_rate: 0 };
  const newSolved = current.problems_solved + (solved ? 1 : 0);
  const newAccuracy = solved ? Math.min(100, current.accuracy_rate + 5) : Math.max(0, current.accuracy_rate - 2);
  
  let skillLevel = 'BEGINNER';
  if (newSolved >= 20 && newAccuracy >= 90) skillLevel = 'EXPERT';
  else if (newSolved >= 10 && newAccuracy >= 80) skillLevel = 'ADVANCED';
  else if (newSolved >= 5 && newAccuracy >= 70) skillLevel = 'INTERMEDIATE';

  await conn.query(`
    INSERT INTO user_skills (username, category, mode, skill_level, problems_solved, accuracy_rate)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      skill_level = VALUES(skill_level),
      problems_solved = VALUES(problems_solved),
      accuracy_rate = VALUES(accuracy_rate)
  `, [username, category, mode, skillLevel, newSolved, newAccuracy]);
}

async function updateStreak(conn: any, username: string, mode: string) {
  const [rows] = await conn.query(`
    SELECT activity_date, streak_days FROM user_activity 
    WHERE username = ? AND mode = ?
    ORDER BY activity_date DESC LIMIT 2
  `, [username, mode]);

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  let newStreak = 1;
  if (rows.length > 1) {
    const lastActivity = rows[1].activity_date.toISOString().split('T')[0];
    if (lastActivity === yesterday) {
      newStreak = (rows[1].streak_days || 0) + 1;
    }
  }

  await conn.query(`
    UPDATE user_activity SET streak_days = ? 
    WHERE username = ? AND activity_date = ? AND mode = ?
  `, [newStreak, username, today, mode]);
}

async function updateActivity(conn: any, username: string, date: string, mode: string, passed: number) {
  await conn.query(`
    INSERT INTO user_activity 
    (username, activity_date, mode, challenges_attempted, challenges_solved, total_submissions, time_spent_minutes)
    VALUES (?, ?, ?, 1, ?, 1, 5)
    ON DUPLICATE KEY UPDATE
      challenges_attempted = challenges_attempted + 1,
      challenges_solved = challenges_solved + VALUES(challenges_solved),
      total_submissions = total_submissions + 1,
      time_spent_minutes = time_spent_minutes + 5
  `, [username, date, mode, passed]);
}

async function getModeStats(conn: any, username: string, mode: string) {
  const [summaryRows] = await conn.query(`
    SELECT 
      COUNT(DISTINCT challenge_id) as practiced_challenges,
      COUNT(*) as total_attempts,
      SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as total_passed
    FROM user_submissions WHERE username = ? AND (mode = ? OR ? = 'COMBINED')
  `, [username, mode, mode]);

  const [activityRows] = await conn.query(`
    SELECT AVG(time_spent_minutes) as avg_session_time, MAX(streak_days) as current_streak
    FROM user_activity WHERE username = ? AND mode = ?
  `, [username, mode]);

  const [skillRows] = await conn.query(`
    SELECT category, skill_level, problems_solved, accuracy_rate
    FROM user_skills WHERE username = ? AND mode = ?
    ORDER BY problems_solved DESC
  `, [username, mode]);

  const summary = summaryRows[0];
  const activity = activityRows[0] || {};
  
  return {
    summary: {
      username,
      mode,
      streakDays: activity.current_streak || 0,
      practicedChallenges: summary.practiced_challenges || 0,
      totalAttempts: summary.total_attempts || 0,
      totalPassed: summary.total_passed || 0,
      errorRate: summary.total_attempts > 0 ? 
        ((summary.total_attempts - summary.total_passed) / summary.total_attempts) : 0,
      avgSessionTime: Math.round(activity.avg_session_time || 0),
      performanceScore: calculatePerformanceScore(summary, skillRows)
    },
    skills: skillRows
  };
}

function getEmptyStats(username: string) {
  return {
    summary: {
      username,
      streakDays: 0,
      practicedChallenges: 0,
      totalAttempts: 0,
      totalPassed: 0,
      errorRate: 0,
      avgSessionTime: 0,
      performanceScore: 0
    },
    skills: []
  };
}

function calculatePerformanceScore(summary: any, skills: any[]): number {
  const baseScore = (summary.total_passed || 0) * 10;
  const accuracyBonus = (1 - (summary.error_rate || 0)) * 50;
  const streakBonus = (summary.current_streak || 0) * 5;
  const levelMultiplier = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3, EXPERT: 4 };
  const skillBonus = skills.reduce((acc, skill) => {
    return acc + (skill.problems_solved * (levelMultiplier[skill.skill_level] || 1));
  }, 0);
  
  return Math.round(baseScore + accuracyBonus + streakBonus + skillBonus);
}

async function getPerChallengeStats(conn: any, username: string, mode?: string) {
  const whereClause = mode ? 'WHERE username = ? AND mode = ?' : 'WHERE username = ?';
  const params = mode ? [username, mode] : [username];
  
  const [rows] = await conn.query(`
    SELECT 
      challenge_id,
      mode,
      COUNT(*) as attempts,
      SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as passed,
      MAX(submitted_at) as lastAttemptedAt
    FROM user_submissions 
    ${whereClause}
    GROUP BY challenge_id, mode
  `, params);
  
  return rows.map((row: any) => ({
    challengeId: row.challenge_id,
    mode: row.mode,
    attempts: row.attempts,
    passed: row.passed,
    lastAttemptedAt: row.lastAttemptedAt
  }));
}

function calculateWeeklyProgress(trends: any[]): number {
  if (trends.length < 2) return 0;
  
  const thisWeek = trends.slice(0, 3).reduce((acc, day) => acc + (day.challenges_solved || 0), 0);
  const lastWeek = trends.slice(3, 6).reduce((acc, day) => acc + (day.challenges_solved || 0), 0);
  
  if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
}

export async function systemAnalytics(req: Request, res: Response) {
  if (!checkRateLimit(`system_analytics_${req.ip}`, 10, 60000)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  let conn: any;
  try {
    conn = await pool.getConnection();
    
    // Check if analytics tables exist and have data
    const [tableCheck] = await conn.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'user_submissions'
    `);
    
    if (!tableCheck[0] || tableCheck[0].count === 0) {
      // Analytics tables don't exist, return empty data
      return res.json({
        ok: true,
        systemStats: {
          totalUsers: 0,
          activeUsers: 0,
          totalSubmissions: 0,
          successRate: 0,
          categoryStats: []
        },
        topUsers: []
      });
    }
    
    const [userCountRows] = await conn.query('SELECT COUNT(*) as total FROM users');
    const [submissionRows] = await conn.query('SELECT COUNT(*) as total FROM user_submissions');
    const [activityRows] = await conn.query('SELECT COUNT(*) as total FROM user_activity');
    
    const totalUsers = userCountRows[0]?.total || 0;
    const totalSubmissions = submissionRows[0]?.total || 0;
    const totalActivity = activityRows[0]?.total || 0;
    
    // If no real activity data exists, return zeros
    if (totalSubmissions === 0) {
      return res.json({
        ok: true,
        systemStats: {
          totalUsers,
          activeUsers: 0,
          totalSubmissions: 0,
          successRate: 0,
          categoryStats: []
        },
        topUsers: []
      });
    }
    
    const [successRows] = await conn.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as passed
      FROM user_submissions
    `);
    
    const [topUsersRows] = await conn.query(`
      SELECT 
        username,
        SUM(challenges_solved) as challengesSolved,
        CASE WHEN SUM(total_submissions) > 0 
          THEN ROUND((SUM(challenges_solved) / SUM(total_submissions)) * 100, 1)
          ELSE 0 END as successRate
      FROM user_activity 
      WHERE challenges_solved > 0
      GROUP BY username 
      ORDER BY challengesSolved DESC 
      LIMIT 10
    `);
    
    const systemStats = {
      totalUsers,
      activeUsers: 0,
      totalSubmissions,
      successRate: successRows[0]?.total > 0 ? 
        Math.round((successRows[0]?.passed / successRows[0]?.total) * 100) : 0,
      categoryStats: []
    };
    
    return res.json({ ok: true, systemStats, topUsers: topUsersRows || [] });
  } catch (e) {
    console.error('System analytics database error:', e);
    return res.json({
      ok: true,
      systemStats: {
        totalUsers: 0,
        activeUsers: 0,
        totalSubmissions: 0,
        successRate: 0,
        categoryStats: []
      },
      topUsers: []
    });
  } finally {
    try { if (conn) conn.release(); } catch {}
  }
}