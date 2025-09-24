import type { Request, Response } from "express";
import { pool } from "../db";

export const trackAdvancedActivity = async (req: Request, res: Response) => {
  try {
    const { username, challengeId, mode, status, timeSpent, code, keystrokes, errors, hints } = req.body;
    
    const conn = await pool.getConnection();
    
    // Advanced analytics schema
    await conn.query(`
      CREATE TABLE IF NOT EXISTS advanced_analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        challenge_id VARCHAR(100) NOT NULL,
        mode ENUM('PRACTICE', 'CHALLENGE', 'CONTEST') NOT NULL,
        status ENUM('PASSED', 'FAILED', 'TIMEOUT', 'COMPILE_ERROR', 'RUNTIME_ERROR') NOT NULL,
        time_spent_seconds INT DEFAULT 0,
        code_length INT DEFAULT 0,
        keystrokes INT DEFAULT 0,
        compile_errors INT DEFAULT 0,
        runtime_errors INT DEFAULT 0,
        hints_used INT DEFAULT 0,
        difficulty ENUM('EASY', 'MEDIUM', 'HARD', 'EXPERT') DEFAULT 'EASY',
        language VARCHAR(20) DEFAULT 'JAVA',
        session_id VARCHAR(100),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_username_date (username, created_at),
        INDEX idx_challenge (challenge_id),
        INDEX idx_session (session_id)
      )
    `);

    // Skill progression table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS skill_progression (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        skill_category VARCHAR(50) NOT NULL,
        current_level INT DEFAULT 1,
        experience_points INT DEFAULT 0,
        problems_solved INT DEFAULT 0,
        avg_solve_time DECIMAL(10,2) DEFAULT 0,
        accuracy_rate DECIMAL(5,2) DEFAULT 0,
        streak_count INT DEFAULT 0,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_skill (username, skill_category)
      )
    `);

    // Learning patterns table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS learning_patterns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        pattern_type ENUM('PEAK_HOURS', 'DIFFICULTY_PREFERENCE', 'ERROR_PATTERN', 'LEARNING_SPEED') NOT NULL,
        pattern_data JSON,
        confidence_score DECIMAL(3,2) DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_pattern (username, pattern_type)
      )
    `);

    // Insert activity with advanced metrics
    await conn.query(`
      INSERT INTO advanced_analytics 
      (username, challenge_id, mode, status, time_spent_seconds, code_length, keystrokes, 
       compile_errors, runtime_errors, hints_used, session_id, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      username, challengeId, mode, status, timeSpent || 0, 
      code?.length || 0, keystrokes || 0, errors?.compile || 0, 
      errors?.runtime || 0, hints || 0, req.headers['x-session-id'] || 'unknown',
      req.ip, req.headers['user-agent'] || 'unknown'
    ]);

    conn.release();
    res.json({ success: true });
  } catch (error) {
    console.error('Advanced analytics error:', error);
    res.json({ success: false });
  }
}

export const getAdvancedAnalytics = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const conn = await pool.getConnection();
    
    // Create tables if they don't exist
    await conn.query(`
      CREATE TABLE IF NOT EXISTS coding_sessions (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        challenge_id VARCHAR(100) NOT NULL,
        mode ENUM('PRACTICE', 'CHALLENGE') NOT NULL,
        difficulty ENUM('BEGINNER', 'EASY', 'MEDIUM', 'HARD') DEFAULT 'EASY',
        total_time_seconds INT DEFAULT 0,
        code_length INT DEFAULT 0,
        keystrokes INT DEFAULT 0,
        status ENUM('PASSED', 'FAILED', 'COMPILE_ERROR', 'RUNTIME_ERROR') NOT NULL,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_username (username)
      )
    `);
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS skill_levels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        skill_category ENUM('SYNTAX', 'ALGORITHMS', 'PROBLEM_SOLVING', 'DEBUGGING') NOT NULL,
        current_level INT DEFAULT 1,
        current_xp INT DEFAULT 0,
        problems_solved INT DEFAULT 0,
        accuracy_rate DECIMAL(5,2) DEFAULT 0,
        UNIQUE KEY unique_user_skill (username, skill_category)
      )
    `);
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS daily_streaks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        activity_date DATE NOT NULL,
        challenges_solved INT DEFAULT 0,
        current_streak_days INT DEFAULT 0,
        total_coding_time_minutes INT DEFAULT 0,
        UNIQUE KEY unique_user_date (username, activity_date)
      )
    `);

    // Comprehensive performance analytics with advanced SQL
    const [performance] = await conn.query(`
      WITH session_stats AS (
        SELECT 
          COUNT(*) as total_sessions,
          COUNT(DISTINCT challenge_id) as unique_challenges,
          COUNT(DISTINCT DATE(start_time)) as active_days,
          AVG(total_time_seconds) as avg_solve_time,
          SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as solved_count,
          AVG(keystrokes) as avg_keystrokes,
          AVG(code_length) as avg_code_length,
          STDDEV(total_time_seconds) as time_consistency,
          MAX(total_time_seconds) as max_solve_time,
          MIN(total_time_seconds) as min_solve_time
        FROM coding_sessions WHERE username = ?
      ),
      recent_performance AS (
        SELECT 
          AVG(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as recent_success_rate,
          COUNT(*) as recent_attempts
        FROM coding_sessions 
        WHERE username = ? AND start_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      )
      SELECT s.*, r.recent_success_rate, r.recent_attempts
      FROM session_stats s CROSS JOIN recent_performance r
    `, [username, username]);

    // Advanced skill progression with XP calculation
    const [skillLevels] = await conn.query(`
      SELECT 
        skill_category,
        current_level,
        current_xp,
        problems_solved,
        accuracy_rate,
        CASE 
          WHEN current_level < 5 THEN (current_level * 100)
          WHEN current_level < 10 THEN (current_level * 150)
          ELSE (current_level * 200)
        END as xp_to_next_level,
        CASE
          WHEN accuracy_rate >= 90 THEN 'EXPERT'
          WHEN accuracy_rate >= 75 THEN 'ADVANCED'
          WHEN accuracy_rate >= 60 THEN 'INTERMEDIATE'
          ELSE 'BEGINNER'
        END as skill_rank
      FROM skill_levels WHERE username = ?
    `, [username]);

    // Daily streak analysis with trend calculation
    const [streakData] = await conn.query(`
      WITH streak_analysis AS (
        SELECT 
          activity_date,
          challenges_solved,
          current_streak_days,
          total_coding_time_minutes,
          LAG(current_streak_days) OVER (ORDER BY activity_date) as prev_streak,
          ROW_NUMBER() OVER (ORDER BY activity_date DESC) as day_rank
        FROM daily_streaks 
        WHERE username = ? AND activity_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      )
      SELECT 
        activity_date,
        challenges_solved,
        current_streak_days,
        total_coding_time_minutes,
        CASE WHEN prev_streak IS NULL THEN 0 ELSE (current_streak_days - prev_streak) END as streak_change
      FROM streak_analysis
      ORDER BY activity_date DESC
    `, [username]);

    // Hourly productivity heatmap with performance correlation
    const [hourlyPattern] = await conn.query(`
      SELECT 
        HOUR(start_time) as hour,
        COUNT(*) as activity_count,
        AVG(total_time_seconds) as avg_solve_time,
        SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as success_count,
        AVG(keystrokes / GREATEST(total_time_seconds, 1)) as avg_typing_speed,
        STDDEV(total_time_seconds) as time_variance
      FROM coding_sessions 
      WHERE username = ? AND start_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY HOUR(start_time)
      ORDER BY hour
    `, [username]);

    // Weekly progress with momentum calculation
    const [weeklyProgress] = await conn.query(`
      WITH weekly_stats AS (
        SELECT 
          YEARWEEK(start_time) as year_week,
          COUNT(*) as attempts,
          COUNT(DISTINCT challenge_id) as unique_challenges,
          SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as solved,
          AVG(total_time_seconds) as avg_time,
          SUM(total_time_seconds) as total_time
        FROM coding_sessions 
        WHERE username = ? AND start_time >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
        GROUP BY YEARWEEK(start_time)
      )
      SELECT 
        year_week,
        attempts,
        unique_challenges,
        solved,
        avg_time,
        total_time,
        LAG(solved) OVER (ORDER BY year_week) as prev_week_solved,
        (solved - LAG(solved) OVER (ORDER BY year_week)) as week_improvement
      FROM weekly_stats
      ORDER BY year_week DESC
    `, [username]);

    // Difficulty progression with mastery tracking
    const [difficultyStats] = await conn.query(`
      SELECT 
        difficulty,
        COUNT(*) as attempts,
        SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as solved,
        ROUND(AVG(total_time_seconds), 2) as avg_time,
        ROUND(AVG(keystrokes), 0) as avg_keystrokes,
        ROUND((SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as success_rate,
        CASE 
          WHEN (SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) / COUNT(*)) >= 0.8 THEN 'MASTERED'
          WHEN (SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) / COUNT(*)) >= 0.6 THEN 'PROFICIENT'
          WHEN (SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) / COUNT(*)) >= 0.4 THEN 'LEARNING'
          ELSE 'STRUGGLING'
        END as mastery_level
      FROM coding_sessions 
      WHERE username = ?
      GROUP BY difficulty
      ORDER BY FIELD(difficulty, 'BEGINNER', 'EASY', 'MEDIUM', 'HARD')
    `, [username]);

    conn.release();
    
    res.json({
      performance: performance[0] || {},
      skillLevels: skillLevels || [],
      streakData: streakData || [],
      hourlyPattern: hourlyPattern || [],
      weeklyProgress: weeklyProgress || [],
      difficultyStats: difficultyStats || []
    });
  } catch (error) {
    console.error('Get advanced analytics error:', error);
    res.json({
      performance: {},
      skillLevels: [],
      streakData: [],
      hourlyPattern: [],
      weeklyProgress: [],
      difficultyStats: []
    });
  }
}