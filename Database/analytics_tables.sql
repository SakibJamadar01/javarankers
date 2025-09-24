-- Enhanced Analytics Tables for Practice Mode and Challenge Mode

-- Main submissions table with mode tracking
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
);

-- Daily activity with mode separation
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
);

-- Skills tracking with mode separation
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
);

-- Performance metrics summary
CREATE TABLE IF NOT EXISTS user_performance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  mode ENUM('PRACTICE', 'CHALLENGE', 'COMBINED') NOT NULL DEFAULT 'COMBINED',
  performance_score INT DEFAULT 0,
  weekly_progress DECIMAL(5,2) DEFAULT 0,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  total_score INT DEFAULT 0,
  last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_mode (username, mode)
);