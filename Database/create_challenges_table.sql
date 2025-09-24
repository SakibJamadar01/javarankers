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