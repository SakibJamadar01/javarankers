-- Add sample_code and test_cases columns to challenges table
ALTER TABLE challenges 
ADD COLUMN sample_code LONGTEXT,
ADD COLUMN test_cases JSON;