-- Complete JavaRankers Database Schema for Supabase

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_photo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin table
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_photo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    problem_statement TEXT NOT NULL,
    concept TEXT,
    sample_code TEXT,
    test_cases JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    meta_description TEXT,
    tags TEXT[],
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table (for analytics)
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    challenges_attempted INTEGER DEFAULT 0,
    challenges_solved INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coding sessions table (detailed analytics)
CREATE TABLE IF NOT EXISTS coding_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) REFERENCES user_sessions(session_id),
    username VARCHAR(50) NOT NULL,
    challenge_id INTEGER REFERENCES challenges(id),
    mode VARCHAR(50) NOT NULL,
    total_time_seconds INTEGER DEFAULT 0,
    code_length INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PASSED', 'FAILED', 'TIMEOUT')),
    test_cases_passed INTEGER DEFAULT 0,
    test_cases_total INTEGER DEFAULT 0,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily streaks table
CREATE TABLE IF NOT EXISTS daily_streaks (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    activity_date DATE NOT NULL,
    challenges_solved INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    total_coding_time_minutes INTEGER DEFAULT 0,
    UNIQUE(username, activity_date)
);

-- Skill levels table
CREATE TABLE IF NOT EXISTS skill_levels (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    skill_category VARCHAR(50) NOT NULL,
    current_level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    problems_solved INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0.00,
    UNIQUE(username, skill_category)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample challenges
INSERT INTO challenges (title, category, difficulty, problem_statement, concept, sample_code, test_cases) VALUES
('Hello World', 'Beginner', 'Easy', 'Write a program that prints "Hello, World!" to the console.', 'Basic output in Java', 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}', '[{"input": "", "expected_output": "Hello, World!"}]'),

('Sum of Two Numbers', 'Basic Math', 'Easy', 'Write a program that takes two integers as input and prints their sum.', 'Basic arithmetic and input/output', 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}', '[{"input": "5 3", "expected_output": "8"}, {"input": "10 20", "expected_output": "30"}]'),

('Even or Odd', 'Conditional', 'Easy', 'Write a program that checks if a given number is even or odd.', 'Conditional statements and modulo operator', 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n % 2 == 0) {\n            System.out.println("Even");\n        } else {\n            System.out.println("Odd");\n        }\n    }\n}', '[{"input": "4", "expected_output": "Even"}, {"input": "7", "expected_output": "Odd"}]'),

('Factorial', 'Loop', 'Medium', 'Write a program to calculate the factorial of a given number.', 'Loops and mathematical computation', 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long factorial = 1;\n        for (int i = 1; i <= n; i++) {\n            factorial *= i;\n        }\n        System.out.println(factorial);\n    }\n}', '[{"input": "5", "expected_output": "120"}, {"input": "0", "expected_output": "1"}]'),

('Fibonacci Series', 'Loop', 'Medium', 'Write a program to print the first n numbers in the Fibonacci series.', 'Loops and sequence generation', 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int a = 0, b = 1;\n        for (int i = 0; i < n; i++) {\n            System.out.print(a + " ");\n            int temp = a + b;\n            a = b;\n            b = temp;\n        }\n    }\n}', '[{"input": "5", "expected_output": "0 1 1 2 3 "}, {"input": "3", "expected_output": "0 1 1 "}]');

-- Insert sample admin user (password: admin123)
INSERT INTO admin (username, email, password_hash) VALUES
('admin', 'admin@javarankers.com', '$2b$10$rQZ9vKzqzQzqzQzqzQzqzOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK');

-- Insert sample blog posts
INSERT INTO blogs (title, content, author, slug, meta_description, tags, published) VALUES
('Getting Started with Java', 'Java is a powerful programming language...', 'JavaRankers Team', 'getting-started-with-java', 'Learn the basics of Java programming', ARRAY['java', 'beginner', 'tutorial'], true),
('Understanding Object-Oriented Programming', 'OOP is a fundamental concept in Java...', 'JavaRankers Team', 'understanding-oop', 'Master OOP concepts in Java', ARRAY['java', 'oop', 'advanced'], true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_coding_sessions_username ON coding_sessions(username);
CREATE INDEX IF NOT EXISTS idx_coding_sessions_challenge_id ON coding_sessions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_daily_streaks_username ON daily_streaks(username);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);