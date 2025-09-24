-- Insert all existing seed challenges into database
USE javarank_app;

INSERT INTO challenges (id, title, problem, concept, category, difficulty) VALUES
-- Data Types
('dt-c-to-f', 'Celsius to Fahrenheit', 'Convert temperature from Celsius to Fahrenheit.', 'I/O, arithmetic, formula application, data types, casting, decimal formatting', 'Data Types', 'Easy'),
('dt-fk-to-c', 'Fahrenheit/Kelvin to Celsius', 'Convert temperature from Fahrenheit or Kelvin to Celsius.', 'Formula application with explicit casting for precision', 'Data Types', 'Easy'),
('dt-four-decimals', 'Print to Four Decimals', 'Print a floating-point number with exactly four decimal places.', 'Output formatting (e.g., %.4f), numeric precision', 'Data Types', 'Easy'),
('dt-product-two', 'Product of Two Numbers', 'Multiply two integers and print the result.', 'Multiplication, multiple inputs, storing result', 'Data Types', 'Easy'),
('dt-rect-area', 'Area of Rectangle', 'Given length and breadth, compute area.', 'Formula: l × b', 'Data Types', 'Easy'),
('dt-rect-perimeter', 'Perimeter of Rectangle', 'Given length and breadth, compute perimeter.', 'Formula: 2 × (l + b)', 'Data Types', 'Easy'),
('dt-circle-area', 'Area of Circle', 'Calculate area of a circle given radius.', 'Use of π, exponentiation, double/float', 'Data Types', 'Easy'),
('dt-even-odd', 'Even or Odd', 'Determine whether a number is even or odd.', 'Modulus operator %, conditional logic', 'Data Types', 'Easy'),
('dt-divisible-many', 'Divisibility Checks', 'Check if a number is divisible by 2,3,5,7,9,11,13,10,20,22,25.', 'Modulus operator for various divisors, reusable pattern', 'Data Types', 'Easy'),
('dt-multiple-of-x', 'Multiple of a Number', 'Check if a number is a multiple of x.', 'Equivalence of multiple and divisibility (n % x == 0)', 'Data Types', 'Easy'),
('dt-divisible-2-or-3', 'Divisible by 2 or 3', 'Check if a number is divisible by 2 or 3.', 'Logical OR ||, combined conditions', 'Data Types', 'Easy'),
('dt-divisible-2-and-3', 'Divisible by 2 and 3', 'Check if a number is divisible by both 2 and 3.', 'Logical AND &&, combined conditions', 'Data Types', 'Easy'),
('dt-divisible-2-5-10', 'Divisible by 2, 5 and 10', 'Check if a number is divisible by 2, 5, and 10.', 'Chained AND with modulus', 'Data Types', 'Easy'),
('dt-type-casting', 'Type Casting and Precision', 'Demonstrate integer vs float division and fix with explicit casts.', 'Data types, implicit/explicit casting, precision', 'Data Types', 'Easy'),
('dt-scanner-input', 'User Input with Scanner', 'Read various data types from standard input.', 'java.util.Scanner, input handling', 'Data Types', 'Easy'),

-- Conditionals
('cond-two-digit', 'Two-Digit Number Check', 'Check if a number is a two-digit number.', 'Range check (10 ≤ n ≤ 99)', 'Conditionals', 'Easy'),
('cond-digit-counts', 'Three/Four/Five-Digit Checks', 'Verify digit count using ranges.', 'Extended range checks (e.g., 100–999)', 'Conditionals', 'Easy'),
('cond-within-range', 'Number Within Range [L, U]', 'Check if an integer lies within an arbitrary inclusive range.', 'Generalized range condition with if-else', 'Conditionals', 'Easy'),
('cond-ascii-type', 'Detect Character Type (ASCII)', 'Given an integer code, decide uppercase/lowercase/digit/none.', 'ASCII ranges: 65–90, 97–122, 48–57', 'Conditionals', 'Easy'),
('cond-print-char', 'Print Character for Unicode', 'Print the character corresponding to a Unicode integer value.', 'Casting int → char', 'Conditionals', 'Easy'),
('cond-char-category', 'Print Character Category', 'Print Upper Case / Lower Case / Numeric / None for an input code.', 'If-else ladder with ranges', 'Conditionals', 'Easy'),
('cond-grading', 'Grading System', 'Map marks to grade buckets and handle invalid entries.', 'Multi-range evaluation with if-else ladder', 'Conditionals', 'Easy'),
('cond-absolute', 'Print Absolute Value (no library)', 'Output |n| without using Math.abs().', 'Conditional sign logic', 'Conditionals', 'Easy'),
('cond-largest-two', 'Largest/Smallest of Two', 'Given a and b, print the larger (or smaller) value.', 'If-else comparisons', 'Conditionals', 'Easy'),
('cond-largest-ternary', 'Largest Using Ternary', 'Compute max(a, b) using ternary operator.', 'a > b ? a : b', 'Conditionals', 'Easy'),

-- Loops
('loop-1-to-n', 'Print 1 to N', 'Print numbers from 1 up to N.', 'For loop, init/cond/update', 'Loops', 'Easy'),
('loop-n-to-1', 'Print N to 1', 'Print numbers from N down to 1.', 'Reverse loop with decrement', 'Loops', 'Easy'),
('loop-evens', 'All Even Numbers ≤ N', 'Print all even numbers up to N.', 'i % 2 == 0 or step by 2', 'Loops', 'Easy'),
('loop-odds', 'All Odd Numbers ≤ N', 'Print all odd numbers up to N.', 'i % 2 != 0 or step by 2', 'Loops', 'Easy'),
('loop-divisible-x', 'Divisible by X ≤ N', 'Print numbers divisible by X up to N.', 'Modulus with user divisor', 'Loops', 'Easy'),
('loop-multiples-x', 'Multiples of X ≤ N', 'Print multiples of X up to N.', 'Multiples/divisibility equivalence', 'Loops', 'Easy'),
('loop-half-range', 'Print 1 to N/2', 'Print numbers from 1 to N/2.', 'Boundary change to N/2', 'Loops', 'Easy'),
('loop-mid-to-n', 'Print N/2 to N', 'Print numbers from N/2 to N.', 'Start at N/2, increment', 'Loops', 'Easy'),
('loop-n-to-mid', 'Print N to N/2', 'Reverse from N down to N/2.', 'Decrement to mid', 'Loops', 'Easy'),
('loop-multiples-a-b', 'Multiples of a or b ≤ N', 'Print numbers that are multiples of a or b up to N.', 'Logical OR with modulus', 'Loops', 'Easy'),
('loop-factors', 'Factors of N', 'Print all factors of N.', 'Loop 1..N with N % i == 0', 'Loops', 'Easy');