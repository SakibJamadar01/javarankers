-- Add missing mode column to existing user_submissions table
ALTER TABLE user_submissions 
ADD COLUMN mode ENUM('PRACTICE', 'CHALLENGE') NOT NULL DEFAULT 'PRACTICE' 
AFTER challenge_id;

-- Update existing records to have PRACTICE mode
UPDATE user_submissions SET mode = 'PRACTICE' WHERE mode IS NULL;

-- Add indexes for better performance
ALTER TABLE user_submissions ADD INDEX idx_mode (mode);
ALTER TABLE user_submissions ADD INDEX idx_username_mode (username, mode);