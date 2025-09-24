-- IDE Database Schema for JavaRanker IDE
-- This schema stores user projects, settings, and IDE state

-- User IDE Settings Table
CREATE TABLE user_ide_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    font_family VARCHAR(100) DEFAULT 'JetBrains Mono',
    font_size INT DEFAULT 14,
    font_weight VARCHAR(10) DEFAULT '400',
    line_height DECIMAL(3,1) DEFAULT 1.5,
    letter_spacing DECIMAL(3,1) DEFAULT 0,
    editor_theme VARCHAR(50) DEFAULT 'vs-dark',
    ui_theme VARCHAR(20) DEFAULT 'dark',
    show_toolbar BOOLEAN DEFAULT TRUE,
    show_breadcrumbs BOOLEAN DEFAULT TRUE,
    show_minimap BOOLEAN DEFAULT TRUE,
    word_wrap BOOLEAN DEFAULT TRUE,
    show_line_numbers BOOLEAN DEFAULT TRUE,
    tab_size INT DEFAULT 4,
    auto_save BOOLEAN DEFAULT TRUE,
    sidebar_width INT DEFAULT 256,
    output_height INT DEFAULT 192,
    terminal_font_size INT DEFAULT 14,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user (username)
);

-- User Projects Table
CREATE TABLE user_projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id VARCHAR(50) NOT NULL,
    username VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    files JSON NOT NULL,
    settings JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_project (username, project_id),
    INDEX idx_username (username)
);

-- IDE Session State Table
CREATE TABLE user_ide_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    current_project_id VARCHAR(50),
    current_file VARCHAR(500),
    open_tabs JSON,
    terminal_history JSON,
    command_history JSON,
    current_directory VARCHAR(500) DEFAULT '/',
    git_history JSON,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_session (username)
);

-- Insert default settings for new users
INSERT INTO user_ide_settings (username) VALUES ('default') 
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;