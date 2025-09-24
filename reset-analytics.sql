-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all existing analytics tables
DROP TABLE IF EXISTS code_quality;
DROP TABLE IF EXISTS user_submissions;
DROP TABLE IF EXISTS user_activity;
DROP TABLE IF EXISTS user_skills;
DROP TABLE IF EXISTS user_performance;
DROP TABLE IF EXISTS analytics_simple;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create new simplified analytics table
CREATE TABLE analytics_simple (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  challenge_id VARCHAR(100) NOT NULL,
  mode ENUM('PRACTICE', 'CHALLENGE') NOT NULL,
  status ENUM('PASSED', 'FAILED', 'ERROR') NOT NULL,
  time_spent INT DEFAULT 0,
  code_length INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_mode (mode),
  INDEX idx_date (created_at)
);