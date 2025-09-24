-- Drop existing tables
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS coding_sessions;
DROP TABLE IF EXISTS skill_levels;
DROP TABLE IF EXISTS daily_streaks;
DROP TABLE IF EXISTS achievement_progress;
DROP TABLE IF EXISTS code_quality_metrics;
DROP TABLE IF EXISTS learning_analytics;

-- User Sessions (detailed session tracking)
CREATE TABLE user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(64) NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    total_duration_seconds INT DEFAULT 0,
    challenges_attempted INT DEFAULT 0,
    challenges_solved INT DEFAULT 0,
    total_keystrokes INT DEFAULT 0,
    total_lines_written INT DEFAULT 0,
    avg_typing_speed DECIMAL(8,2) DEFAULT 0,
    session_quality_score DECIMAL(5,2) DEFAULT 0,
    ip_address VARCHAR(45),
    user_agent TEXT,
    INDEX idx_username_date (username, start_time),
    INDEX idx_session (session_id)
);

-- Coding Sessions (per challenge tracking)
CREATE TABLE coding_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    username VARCHAR(64) NOT NULL,
    challenge_id VARCHAR(100) NOT NULL,
    mode ENUM('PRACTICE', 'CHALLENGE', 'CONTEST', 'TUTORIAL') NOT NULL,
    difficulty ENUM('BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXPERT') NOT NULL,
    language VARCHAR(20) DEFAULT 'JAVA',
    
    -- Time tracking
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submit_time TIMESTAMP NULL,
    total_time_seconds INT DEFAULT 0,
    thinking_time_seconds INT DEFAULT 0,
    coding_time_seconds INT DEFAULT 0,
    
    -- Code metrics
    final_code TEXT,
    code_length INT DEFAULT 0,
    lines_of_code INT DEFAULT 0,
    cyclomatic_complexity INT DEFAULT 1,
    code_quality_score DECIMAL(5,2) DEFAULT 0,
    
    -- Performance metrics
    keystrokes INT DEFAULT 0,
    backspaces INT DEFAULT 0,
    copy_paste_count INT DEFAULT 0,
    compile_attempts INT DEFAULT 0,
    test_runs INT DEFAULT 0,
    
    -- Results
    status ENUM('PASSED', 'FAILED', 'TIMEOUT', 'COMPILE_ERROR', 'RUNTIME_ERROR', 'PARTIAL') NOT NULL,
    test_cases_passed INT DEFAULT 0,
    test_cases_total INT DEFAULT 0,
    execution_time_ms INT DEFAULT 0,
    memory_used_kb INT DEFAULT 0,
    
    -- Errors and debugging
    compile_errors INT DEFAULT 0,
    runtime_errors INT DEFAULT 0,
    logical_errors INT DEFAULT 0,
    hints_used INT DEFAULT 0,
    debug_sessions INT DEFAULT 0,
    
    -- Learning metrics
    concept_mastery_score DECIMAL(5,2) DEFAULT 0,
    problem_solving_approach TEXT,
    
    FOREIGN KEY (session_id) REFERENCES user_sessions(session_id),
    INDEX idx_username_challenge (username, challenge_id),
    INDEX idx_difficulty (difficulty),
    INDEX idx_status (status),
    INDEX idx_time (start_time)
);

-- Skill Levels (comprehensive skill tracking)
CREATE TABLE skill_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL,
    skill_category ENUM('SYNTAX', 'ALGORITHMS', 'DATA_STRUCTURES', 'PROBLEM_SOLVING', 'DEBUGGING', 'CODE_QUALITY', 'SPEED', 'LOGIC') NOT NULL,
    current_level INT DEFAULT 1,
    current_xp INT DEFAULT 0,
    xp_to_next_level INT DEFAULT 100,
    mastery_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Performance metrics per skill
    problems_solved INT DEFAULT 0,
    avg_solve_time_seconds DECIMAL(10,2) DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0,
    improvement_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Skill-specific metrics
    best_streak INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    last_practice_date DATE,
    skill_rank ENUM('NOVICE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'MASTER') DEFAULT 'NOVICE',
    
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_skill (username, skill_category),
    INDEX idx_level (current_level),
    INDEX idx_rank (skill_rank)
);

-- Daily Streaks (comprehensive streak tracking)
CREATE TABLE daily_streaks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL,
    activity_date DATE NOT NULL,
    
    -- Activity metrics
    challenges_attempted INT DEFAULT 0,
    challenges_solved INT DEFAULT 0,
    total_coding_time_minutes INT DEFAULT 0,
    session_count INT DEFAULT 0,
    
    -- Streak calculations
    current_streak_days INT DEFAULT 0,
    longest_streak_days INT DEFAULT 0,
    streak_type ENUM('SOLVING', 'PRACTICE', 'LEARNING', 'CONSISTENCY') DEFAULT 'PRACTICE',
    
    -- Quality metrics
    avg_solve_time_minutes DECIMAL(8,2) DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    productivity_score DECIMAL(5,2) DEFAULT 0,
    
    -- Bonus tracking
    streak_bonus_xp INT DEFAULT 0,
    milestone_achieved BOOLEAN DEFAULT FALSE,
    
    UNIQUE KEY unique_user_date (username, activity_date),
    INDEX idx_streak (current_streak_days),
    INDEX idx_date (activity_date)
);

-- Achievement Progress (gamification)
CREATE TABLE achievement_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL,
    achievement_type ENUM('FIRST_SOLVE', 'SPEED_DEMON', 'PERFECTIONIST', 'CONSISTENT_CODER', 'PROBLEM_CRUSHER', 'STREAK_MASTER', 'SKILL_SPECIALIST') NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Progress tracking
    current_progress INT DEFAULT 0,
    target_value INT NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Status
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    reward_xp INT DEFAULT 0,
    
    -- Metadata
    difficulty_level ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND') DEFAULT 'BRONZE',
    category VARCHAR(50),
    
    UNIQUE KEY unique_user_achievement (username, achievement_type, achievement_name),
    INDEX idx_completed (is_completed),
    INDEX idx_progress (progress_percentage)
);

-- Code Quality Metrics (detailed code analysis)
CREATE TABLE code_quality_metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coding_session_id BIGINT NOT NULL,
    username VARCHAR(64) NOT NULL,
    challenge_id VARCHAR(100) NOT NULL,
    
    -- Code structure metrics
    method_count INT DEFAULT 0,
    class_count INT DEFAULT 0,
    variable_count INT DEFAULT 0,
    comment_lines INT DEFAULT 0,
    blank_lines INT DEFAULT 0,
    
    -- Complexity metrics
    cyclomatic_complexity INT DEFAULT 1,
    cognitive_complexity INT DEFAULT 1,
    nesting_depth INT DEFAULT 0,
    
    -- Style metrics
    naming_convention_score DECIMAL(5,2) DEFAULT 0,
    indentation_consistency DECIMAL(5,2) DEFAULT 0,
    code_readability_score DECIMAL(5,2) DEFAULT 0,
    
    -- Performance indicators
    algorithm_efficiency_score DECIMAL(5,2) DEFAULT 0,
    memory_efficiency_score DECIMAL(5,2) DEFAULT 0,
    
    -- Overall scores
    maintainability_index DECIMAL(5,2) DEFAULT 0,
    technical_debt_ratio DECIMAL(5,2) DEFAULT 0,
    overall_quality_grade ENUM('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F') DEFAULT 'C',
    
    FOREIGN KEY (coding_session_id) REFERENCES coding_sessions(id),
    INDEX idx_username (username),
    INDEX idx_quality_grade (overall_quality_grade)
);

-- Learning Analytics (AI-powered insights)
CREATE TABLE learning_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL,
    analysis_date DATE NOT NULL,
    
    -- Learning patterns
    peak_performance_hour INT DEFAULT 12,
    optimal_session_duration_minutes INT DEFAULT 45,
    preferred_difficulty ENUM('BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXPERT') DEFAULT 'EASY',
    learning_velocity DECIMAL(8,2) DEFAULT 0,
    
    -- Behavioral patterns
    problem_solving_approach ENUM('SYSTEMATIC', 'INTUITIVE', 'TRIAL_ERROR', 'RESEARCH_HEAVY') DEFAULT 'SYSTEMATIC',
    error_recovery_speed DECIMAL(8,2) DEFAULT 0,
    help_seeking_frequency DECIMAL(5,2) DEFAULT 0,
    
    -- Predictions and recommendations
    predicted_next_level_days INT DEFAULT 30,
    recommended_focus_areas JSON,
    strength_areas JSON,
    improvement_areas JSON,
    
    -- Confidence metrics
    confidence_score DECIMAL(5,2) DEFAULT 0,
    consistency_score DECIMAL(5,2) DEFAULT 0,
    growth_trajectory ENUM('ACCELERATING', 'STEADY', 'PLATEAUING', 'DECLINING') DEFAULT 'STEADY',
    
    UNIQUE KEY unique_user_date (username, analysis_date),
    INDEX idx_trajectory (growth_trajectory)
);