-- Complete database setup for JavaRanker challenges
USE javarank_app;

-- Create challenges table
CREATE TABLE IF NOT EXISTS `challenges` (
  `id` varchar(128) NOT NULL,
  `title` varchar(255) NOT NULL,
  `problem` text NOT NULL,
  `concept` text NOT NULL,
  `category` varchar(64) NOT NULL,
  `difficulty` enum('Easy','Medium','Hard') NOT NULL,
  `sample_code` longtext,
  `test_cases` json,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_difficulty` (`difficulty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert seed challenges
INSERT INTO challenges (id, title, problem, concept, category, difficulty, sample_code, test_cases) VALUES
('dt-c-to-f', 'Celsius to Fahrenheit', 'Convert temperature from Celsius to Fahrenheit.', 'I/O, arithmetic, formula application, data types, casting, decimal formatting', 'Data Types', 'Easy', 
'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int c = sc.nextInt();\n        double f = (c * 9.0 / 5) + 32;\n        System.out.println(c + "°C = " + f + "°F");\n    }\n}',
'[{"input": "25", "expectedOutput": "25°C = 77.0°F"}, {"input": "0", "expectedOutput": "0°C = 32.0°F"}]'),

('dt-even-odd', 'Even or Odd', 'Determine whether a number is even or odd.', 'Modulus operator %, conditional logic', 'Data Types', 'Easy',
'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(n % 2 == 0 ? "Even" : "Odd");\n    }\n}',
'[{"input": "4", "expectedOutput": "Even"}, {"input": "7", "expectedOutput": "Odd"}]'),

('loop-1-to-n', 'Print 1 to N', 'Print numbers from 1 up to N.', 'For loop, init/cond/update', 'Loops', 'Easy',
'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        for(int i = 1; i <= n; i++) {\n            System.out.println(i);\n        }\n    }\n}',
'[{"input": "3", "expectedOutput": "1\\n2\\n3"}, {"input": "5", "expectedOutput": "1\\n2\\n3\\n4\\n5"}]');