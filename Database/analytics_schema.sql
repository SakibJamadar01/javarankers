-- Enhanced Analytics Database Schema for JavaRanker

-- User submissions tracking
CREATE TABLE IF NOT EXISTS user_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  challenge_id VARCHAR(100) NOT NULL,
  code TEXT NOT NULL,
  status ENUM('PASSED', 'FAILED', 'ERROR', 'TIMEOUT') NOT NULL,
  execution_time_ms INT DEFAULT NULL,
  memory_usage_kb INT DEFAULT NULL,
  test_cases_passed INT DEFAULT 0,
  test_cases_total INT DEFAULT 0,
  error_message TEXT DEFAULT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_challenge (challenge_id),
  INDEX idx_status (status),
  INDEX idx_submitted_at (submitted_at)
);

-- Daily user activity tracking
CREATE TABLE IF NOT EXISTS user_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  activity_date DATE NOT NULL,
  challenges_attempted INT DEFAULT 0,
  challenges_solved INT DEFAULT 0,
  total_submissions INT DEFAULT 0,
  time_spent_minutes INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_date (username, activity_date),
  INDEX idx_username (username),
  INDEX idx_activity_date (activity_date)
);

-- Challenge difficulty and performance metrics
CREATE TABLE IF NOT EXISTS challenge_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  challenge_id VARCHAR(100) NOT NULL,
  total_attempts INT DEFAULT 0,
  total_solved INT DEFAULT 0,
  avg_attempts_to_solve DECIMAL(5,2) DEFAULT 0,
  avg_execution_time_ms INT DEFAULT 0,
  difficulty_rating DECIMAL(3,2) DEFAULT 0, -- Auto-calculated based on success rate
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_challenge (challenge_id),
  INDEX idx_challenge_id (challenge_id)
);

-- User skill progression tracking
CREATE TABLE IF NOT EXISTS user_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  category VARCHAR(50) NOT NULL,
  skill_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT') DEFAULT 'BEGINNER',
  problems_solved INT DEFAULT 0,
  accuracy_rate DECIMAL(5,2) DEFAULT 0,
  avg_solve_time_minutes INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_category (username, category),
  INDEX idx_username (username),
  INDEX idx_category (category)
);

-- Session tracking for time spent
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_end TIMESTAMP NULL,
  pages_visited INT DEFAULT 1,
  challenges_viewed INT DEFAULT 0,
  challenges_attempted INT DEFAULT 0,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  INDEX idx_username (username),
  INDEX idx_session_start (session_start)
);

-- Code quality metrics
CREATE TABLE IF NOT EXISTS code_quality (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  lines_of_code INT DEFAULT 0,
  cyclomatic_complexity INT DEFAULT 0,
  code_style_score DECIMAL(3,2) DEFAULT 0,
  has_comments BOOLEAN DEFAULT FALSE,
  uses_best_practices BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES user_submissions(id) ON DELETE CASCADE,
  INDEX idx_submission_id (submission_id)
);

-- Leaderboard and rankings
CREATE TABLE IF NOT EXISTS user_rankings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  total_score INT DEFAULT 0,
  global_rank INT DEFAULT 0,
  category_ranks JSON DEFAULT NULL, -- Store category-wise ranks
  badges JSON DEFAULT NULL, -- Store earned badges
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_username (username),
  INDEX idx_total_score (total_score DESC),
  INDEX idx_global_rank (global_rank)
);

-- Insert some sample data for testing
INSERT IGNORE INTO user_activity (username, activity_date, challenges_attempted, challenges_solved, total_submissions, time_spent_minutes, streak_days) VALUES
('sakib01', CURDATE(), 5, 3, 8, 45, 1),
('testuser', CURDATE(), 3, 2, 5, 30, 1);

INSERT IGNORE INTO challenge_metrics (challenge_id, total_attempts, total_solved, avg_attempts_to_solve, difficulty_rating) VALUES
('dt-circle-area', 25, 20, 1.25, 2.5),
('dt-c-to-f', 30, 22, 1.36, 3.0),
('loop-1-to-n', 15, 14, 1.07, 1.5);

INSERT IGNORE INTO user_skills (username, category, skill_level, problems_solved, accuracy_rate) VALUES
('sakib01', 'Data Types', 'INTERMEDIATE', 5, 80.0),
('sakib01', 'Loops', 'BEGINNER', 2, 60.0),
('testuser', 'Data Types', 'BEGINNER', 3, 70.0);