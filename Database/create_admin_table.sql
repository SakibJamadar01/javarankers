-- Create admin table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  password_algo ENUM('SHA256','BCRYPT') NOT NULL DEFAULT 'SHA256',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (SAKIBJ / SAKIB@ADMIN)
INSERT INTO admins (username, password_hash, password_algo) 
VALUES ('SAKIBJ', SHA2('SAKIB@ADMIN', 256), 'SHA256')
ON DUPLICATE KEY UPDATE password_hash = SHA2('SAKIB@ADMIN', 256);