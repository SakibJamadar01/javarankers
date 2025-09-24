import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleExecute } from "./routes/execute";
import { login as handleLogin, register as handleRegister, updateProfilePhoto, adminLogin, updateAdminProfilePhoto } from "./routes/auth";
import { analyticsSummary, resetAnalytics, trackSubmission, systemAnalytics } from "./routes/analytics";
import { submitFeedback } from "./routes/feedback";
import challengesRouter from "./routes/challenges.js";
import blogsRouter from "./routes/blogs.js";
import { generateCsrfToken, validateCsrfToken, checkRateLimit } from "./utils/security.js";

export async function createServer() {
  const app = express();
  
  // Simple analytics endpoints
  const trackAdvancedActivity = async (req: any, res: any) => {
    try {
      console.log('Analytics tracking called with:', req.body);
      const { pool } = await import('./db.js');
      const { username, challengeId, mode, status, timeSpent, code, testCasesPassed, testCasesTotal } = req.body;
      
      if (!username || !challengeId || !mode || !status) {
        console.error('Missing required fields:', { username, challengeId, mode, status });
        return res.json({ success: false, error: 'Missing required fields' });
      }
      
      const conn = await pool.getConnection();
      console.log('Database connected, inserting data...');
      
      // Create session_id
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // First insert into user_sessions (parent table)
      await conn.query(`
        INSERT INTO user_sessions (session_id, username, challenges_attempted, challenges_solved)
        VALUES (?, ?, 1, ?)
      `, [sessionId, username, status === 'PASSED' ? 1 : 0]);
      
      // Then insert into coding_sessions (child table)
      const insertResult = await conn.query(`
        INSERT INTO coding_sessions (session_id, username, challenge_id, mode, total_time_seconds, code_length, status, test_cases_passed, test_cases_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [sessionId, username, challengeId, mode, timeSpent || 0, code?.length || 0, status, testCasesPassed || 0, testCasesTotal || 0]);
      
      console.log('Inserted into coding_sessions:', insertResult);
      
      // Update daily streak
      const today = new Date().toISOString().split('T')[0];
      await conn.query(`
        INSERT INTO daily_streaks (username, activity_date, challenges_solved, current_streak_days)
        VALUES (?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE 
          challenges_solved = challenges_solved + (CASE WHEN ? = 'PASSED' THEN 1 ELSE 0 END),
          current_streak_days = current_streak_days + 1
      `, [username, today, status === 'PASSED' ? 1 : 0, status]);
      
      // Update skill levels
      await conn.query(`
        INSERT INTO skill_levels (username, skill_category, problems_solved, accuracy_rate)
        VALUES (?, 'PROBLEM_SOLVING', 1, ?)
        ON DUPLICATE KEY UPDATE 
          problems_solved = problems_solved + 1,
          accuracy_rate = (accuracy_rate + ?) / 2
      `, [username, status === 'PASSED' ? 100 : 0, status === 'PASSED' ? 100 : 0]);
      
      conn.release();
      console.log('Analytics tracking completed successfully');
      res.json({ success: true });
    } catch (error) {
      console.error('Analytics tracking error:', error);
      res.json({ success: false, error: error.message });
    }
  };
  
  const getAdvancedAnalytics = async (req: any, res: any) => {
    try {
      const { pool } = await import('./db.js');
      const conn = await pool.getConnection();
      
      // Get real performance data
      const [performance] = await conn.query(`
        SELECT 
          COUNT(*) as total_sessions,
          COUNT(DISTINCT challenge_id) as unique_challenges,
          COUNT(DISTINCT DATE(start_time)) as active_days,
          AVG(total_time_seconds) as avg_solve_time,
          SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as solved_count,
          MIN(total_time_seconds) as min_solve_time,
          MAX(total_time_seconds) as max_solve_time
        FROM coding_sessions WHERE username = ?
      `, [req.body.username || 'guest']);
      
      // Get recent performance (last 7 days)
      const [recentPerformance] = await conn.query(`
        SELECT 
          COUNT(*) as recent_attempts,
          SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as recent_passed,
          CASE WHEN COUNT(*) > 0 
            THEN ROUND((SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 0)
            ELSE 0 END as recent_success_rate
        FROM coding_sessions 
        WHERE username = ? AND start_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `, [req.body.username || 'guest']);
      
      // Get skill levels
      const [skillLevels] = await conn.query(`
        SELECT skill_category, current_level, current_xp, 
               (current_level * 100) as xp_to_next_level,
               problems_solved, accuracy_rate, 
               CASE WHEN accuracy_rate >= 80 THEN 'ADVANCED' 
                    WHEN accuracy_rate >= 60 THEN 'INTERMEDIATE' 
                    ELSE 'BEGINNER' END as skill_rank
        FROM skill_levels WHERE username = ?
      `, [req.body.username || 'guest']);
      
      // Get streak data
      const [streakData] = await conn.query(`
        SELECT activity_date, challenges_solved, current_streak_days, total_coding_time_minutes
        FROM daily_streaks WHERE username = ? ORDER BY activity_date DESC LIMIT 7
      `, [req.body.username || 'guest']);
      
      // Get hourly activity pattern
      const [hourlyPattern] = await conn.query(`
        SELECT 
          HOUR(start_time) as hour,
          COUNT(*) as activity_count,
          SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as success_count,
          AVG(code_length / GREATEST(total_time_seconds, 1)) as avg_typing_speed
        FROM coding_sessions 
        WHERE username = ? AND start_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY HOUR(start_time)
        ORDER BY hour
      `, [req.body.username || 'guest']);
      
      // Get weekly progress
      const [weeklyProgress] = await conn.query(`
        SELECT 
          YEARWEEK(start_time) as year_week,
          COUNT(*) as attempts,
          COUNT(DISTINCT challenge_id) as unique_challenges,
          SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as solved
        FROM coding_sessions 
        WHERE username = ? AND start_time >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
        GROUP BY YEARWEEK(start_time)
        ORDER BY year_week DESC
      `, [req.body.username || 'guest']);
      
      // Get difficulty stats (mock data since we don't have difficulty in current schema)
      const [difficultyStats] = await conn.query(`
        SELECT 
          'EASY' as difficulty,
          COUNT(*) as attempts,
          SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as solved,
          ROUND((SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as success_rate
        FROM coding_sessions 
        WHERE username = ?
        UNION ALL
        SELECT 
          'MEDIUM' as difficulty,
          0 as attempts,
          0 as solved,
          0 as success_rate
      `, [req.body.username || 'guest']);
      
      conn.release();
      
      // Get per-challenge analytics
      const [challengeStats] = await conn.query(`
        SELECT 
          challenge_id,
          COUNT(*) as total_attempts,
          SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as passed_attempts,
          ROUND((SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as success_rate,
          AVG(total_time_seconds) as avg_solve_time,
          SUM(test_cases_passed) as total_test_cases_passed,
          SUM(test_cases_total) as total_test_cases_available,
          MAX(start_time) as last_attempted
        FROM coding_sessions 
        WHERE username = ?
        GROUP BY challenge_id
        ORDER BY last_attempted DESC
      `, [req.body.username || 'guest']);
      
      // Combine performance data
      const combinedPerformance = {
        ...(performance[0] || { total_sessions: 0, unique_challenges: 0, active_days: 0, avg_solve_time: 0, solved_count: 0 }),
        ...(recentPerformance[0] || { recent_attempts: 0, recent_passed: 0, recent_success_rate: 0 })
      };
      
      res.json({
        performance: combinedPerformance,
        skillLevels: skillLevels || [],
        streakData: streakData || [],
        hourlyPattern: hourlyPattern || [],
        weeklyProgress: weeklyProgress || [],
        difficultyStats: difficultyStats || [],
        challengeStats: challengeStats || []
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.json({ performance: {}, skillLevels: [], streakData: [], hourlyPattern: [], weeklyProgress: [], difficultyStats: [] });
    }
  };

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

  // CSRF token endpoint
  app.get("/api/csrf-token", (_req, res) => {
    const token = generateCsrfToken();
    res.json({ csrfToken: token });
  });
  
  // CSRF validation middleware for state-changing operations
  const csrfProtection = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Skip CSRF for GET requests
    if (req.method === 'GET') {
      return next();
    }
    const token = req.headers['x-csrf-token'] as string;
    if (!token || !validateCsrfToken(token)) {
      return res.status(403).json({ error: "Invalid CSRF token" });
    }
    next();
  };

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/execute", handleExecute);

  // Auth endpoints
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/profile-photo", csrfProtection, updateProfilePhoto);
  app.post("/api/auth/admin-login", adminLogin);
  app.post("/api/auth/admin-profile-photo", csrfProtection, updateAdminProfilePhoto);

  // Advanced Analytics
  app.post("/api/analytics/track", csrfProtection, trackAdvancedActivity);
  app.post("/api/analytics/advanced", getAdvancedAnalytics);
  app.post("/api/analytics/data", getAdvancedAnalytics);

  // Feedback
  app.post("/api/feedback", csrfProtection, submitFeedback);

  // Challenges
  app.use("/api/challenges", challengesRouter);
  
  // Blogs
  app.use("/api/blogs", blogsRouter);

  return app;
}
