export type Category = "Data Types" | "Conditionals" | "Loops" | (string & {});
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Challenge {
  id: string;
  title: string;
  problem: string;
  concept: string;
  category: Category;
  difficulty: Difficulty;
  sampleCode?: string;
  testCases?: Array<{input: string; expectedOutput?: string}>;
}

export type ChallengeInput = Omit<Challenge, "id"> & { id?: string };

const STORAGE_KEY = "javachallenges.custom.v1";
const STORAGE_REMOVED = "javachallenges.removed.v1";
const STORAGE_CATEGORIES = "javachallenges.categories.v1";
const STORAGE_CATEGORIES_REMOVED = "javachallenges.categories.removed.v1";

function hasStorage() {
  try {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function loadCustom(): Challenge[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Challenge[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveCustom(list: Challenge[]) {
  if (!hasStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadRemoved(): string[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_REMOVED);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRemoved(ids: string[]) {
  if (!hasStorage()) return;
  localStorage.setItem(STORAGE_REMOVED, JSON.stringify(ids));
}

export type CategoryItem = { key: Category; label: string; description: string };

function loadCustomCategories(): CategoryItem[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_CATEGORIES);
    if (!raw) return [];
    const data = JSON.parse(raw) as CategoryItem[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveCustomCategories(items: CategoryItem[]) {
  if (!hasStorage()) return;
  localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(items));
}

function loadRemovedCategories(): string[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_CATEGORIES_REMOVED);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRemovedCategories(keys: string[]) {
  if (!hasStorage()) return;
  localStorage.setItem(STORAGE_CATEGORIES_REMOVED, JSON.stringify(keys));
}

export function allChallenges(): Challenge[] {
  // Return only custom challenges from localStorage, no seed challenges
  const removed = new Set(loadRemoved());
  return loadCustom().filter((c) => !removed.has(c.id));
}

export async function getAllChallenges(): Promise<Challenge[]> {
  const dbChallenges = await fetchChallengesFromDB();
  const removed = new Set(loadRemoved());
  const localChallenges = [...seedChallenges, ...loadCustom()].filter((c) => !removed.has(c.id));
  
  // Merge and deduplicate
  const allChallengesMap = new Map<string, Challenge>();
  localChallenges.forEach(c => allChallengesMap.set(c.id, c));
  dbChallenges.forEach(c => allChallengesMap.set(c.id, c));
  
  return Array.from(allChallengesMap.values());
}

// Database integration functions
export async function fetchChallengesFromDB(): Promise<Challenge[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const res = await fetch('/api/challenges', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (res.ok) {
      const data = await res.json();
      console.log('Fetched challenges from DB:', data.challenges?.length || 0, 'challenges');
      return data.challenges || [];
    } else {
      console.error('Failed to fetch challenges:', res.status);
    }
  } catch (e) {
    // Sanitize error message before logging
    const errorMsg = e instanceof Error ? e.message.replace(/[<>"'&]/g, '') : 'Unknown error';
    console.error('Failed to fetch challenges from DB:', errorMsg);
  }
  return [];
}

export async function saveChallengeToDB(challenge: Challenge): Promise<boolean> {
  try {
    console.log('Saving challenge to DB:', challenge.title);
    
    // Get CSRF token
    const csrfRes = await fetch('/api/csrf-token');
    const csrfData = await csrfRes.json();
    
    const res = await fetch('/api/challenges', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.csrfToken
      },
      body: JSON.stringify(challenge)
    });
    console.log('Save response:', res.status, res.ok);
    if (!res.ok) {
      console.error('Save failed with status:', res.status);
    }
    return res.ok;
  } catch (e) {
    // Sanitize error message before logging
    const errorMsg = e instanceof Error ? e.message.replace(/[<>"'&]/g, '') : 'Unknown error';
    console.error('Failed to save challenge to DB:', errorMsg);
    return false;
  }
}

export async function deleteChallengeFromDB(id: string): Promise<boolean> {
  try {
    // Get CSRF token
    const csrfRes = await fetch('/api/csrf-token');
    const csrfData = await csrfRes.json();
    
    const res = await fetch(`/api/challenges/${id}`, { 
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': csrfData.csrfToken
      }
    });
    return res.ok;
  } catch (e) {
    // Sanitize error message before logging
    const errorMsg = e instanceof Error ? e.message.replace(/[<>"'&]/g, '') : 'Unknown error';
    console.error('Failed to delete challenge from DB:', errorMsg);
    return false;
  }
}

export function addChallenge(input: ChallengeInput): Challenge {
  const id = input.id ?? `${input.category.toLowerCase().replace(/\s+/g, "-")}-${crypto.randomUUID().slice(0, 8)}`;
  const newItem: Challenge = { ...input, id } as Challenge;
  const list = loadCustom();
  
  // If updating existing challenge
  if (input.id) {
    const existingIndex = list.findIndex(c => c.id === input.id);
    if (existingIndex >= 0) {
      list[existingIndex] = newItem;
      saveCustom(list);
      return newItem;
    }
  }
  
  list.push(newItem);
  saveCustom(list);
  return newItem;
}

export function updateChallenge(id: string, updates: Partial<Challenge>): Challenge | null {
  const list = loadCustom();
  const index = list.findIndex(c => c.id === id);
  if (index >= 0) {
    list[index] = { ...list[index], ...updates };
    saveCustom(list);
    return list[index];
  }
  return null;
}

export function exportCustom(): string {
  return JSON.stringify(loadCustom(), null, 2);
}

export function importCustom(json: string) {
  const parsed = JSON.parse(json) as Challenge[];
  if (!Array.isArray(parsed)) throw new Error("Invalid import format");
  saveCustom(parsed);
}

export function removeChallenge(id: string) {
  const list = loadCustom();
  const idx = list.findIndex((c) => c.id === id);
  if (idx >= 0) {
    list.splice(idx, 1);
    saveCustom(list);
  }
  const removed = new Set(loadRemoved());
  removed.add(id);
  saveRemoved(Array.from(removed));
}

export const seedChallenges: Challenge[] = [
  // Data Types
  {
    id: "dt-c-to-f",
    title: "Celsius to Fahrenheit",
    problem: "Convert temperature from Celsius to Fahrenheit.",
    concept: "I/O, arithmetic, formula application, data types, casting, decimal formatting",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-fk-to-c",
    title: "Fahrenheit/Kelvin to Celsius",
    problem: "Convert temperature from Fahrenheit or Kelvin to Celsius.",
    concept: "Formula application with explicit casting for precision",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-four-decimals",
    title: "Print to Four Decimals",
    problem: "Print a floating-point number with exactly four decimal places.",
    concept: "Output formatting (e.g., %.4f), numeric precision",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-product-two",
    title: "Product of Two Numbers",
    problem: "Multiply two integers and print the result.",
    concept: "Multiplication, multiple inputs, storing result",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-rect-area",
    title: "Area of Rectangle",
    problem: "Given length and breadth, compute area.",
    concept: "Formula: l × b",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-rect-perimeter",
    title: "Perimeter of Rectangle",
    problem: "Given length and breadth, compute perimeter.",
    concept: "Formula: 2 × (l + b)",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-circle-area",
    title: "Area of Circle",
    problem: "Calculate area of a circle given radius.",
    concept: "Use of π, exponentiation, double/float",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-even-odd",
    title: "Even or Odd",
    problem: "Determine whether a number is even or odd.",
    concept: "Modulus operator %, conditional logic",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-divisible-many",
    title: "Divisibility Checks",
    problem: "Check if a number is divisible by 2,3,5,7,9,11,13,10,20,22,25.",
    concept: "Modulus operator for various divisors, reusable pattern",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-multiple-of-x",
    title: "Multiple of a Number",
    problem: "Check if a number is a multiple of x.",
    concept: "Equivalence of multiple and divisibility (n % x == 0)",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-divisible-2-or-3",
    title: "Divisible by 2 or 3",
    problem: "Check if a number is divisible by 2 or 3.",
    concept: "Logical OR ||, combined conditions",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-divisible-2-and-3",
    title: "Divisible by 2 and 3",
    problem: "Check if a number is divisible by both 2 and 3.",
    concept: "Logical AND &&, combined conditions",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-divisible-2-5-10",
    title: "Divisible by 2, 5 and 10",
    problem: "Check if a number is divisible by 2, 5, and 10.",
    concept: "Chained AND with modulus",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-type-casting",
    title: "Type Casting and Precision",
    problem: "Demonstrate integer vs float division and fix with explicit casts.",
    concept: "Data types, implicit/explicit casting, precision",
    category: "Data Types",
    difficulty: "Easy",
  },
  {
    id: "dt-scanner-input",
    title: "User Input with Scanner",
    problem: "Read various data types from standard input.",
    concept: "java.util.Scanner, input handling",
    category: "Data Types",
    difficulty: "Easy",
  },

  // Conditionals / ASCII / Ternary
  {
    id: "cond-two-digit",
    title: "Two-Digit Number Check",
    problem: "Check if a number is a two-digit number.",
    concept: "Range check (10 ≤ n ≤ 99)",
    category: "Conditionals",
    difficulty: "Easy",
  },
  {
    id: "cond-digit-counts",
    title: "Three/Four/Five-Digit Checks",
    problem: "Verify digit count using ranges.",
    concept: "Extended range checks (e.g., 100–999)",
    category: "Conditionals",
    difficulty: "Easy",
  },
  {
    id: "cond-within-range",
    title: "Number Within Range [L, U]",
    problem: "Check if an integer lies within an arbitrary inclusive range.",
    concept: "Generalized range condition with if-else",
    category: "Conditionals",
    difficulty: "Easy",
  },
  {
    id: "cond-ascii-type",
    title: "Detect Character Type (ASCII)",
    problem: "Given an integer code, decide uppercase/lowercase/digit/none.",
    concept: "ASCII ranges: 65–90, 97–122, 48–57",
    category: "Conditionals",
    difficulty: "Easy",
  },
  {
    id: "cond-print-char",
    title: "Print Character for Unicode",
    problem: "Print the character corresponding to a Unicode integer value.",
    concept: "Casting int → char",
    category: "Conditionals",
    difficulty: "Easy",
  },
  {
    id: "cond-char-category",
    title: "Print Character Category",
    problem: "Print Upper Case / Lower Case / Numeric / None for an input code.",
    concept: "If-else ladder with ranges",
    category: "Conditionals",
    difficulty: "Easy",
  },
  {
    id: "cond-grading",
    title: "Grading System",
    problem: "Map marks to grade buckets and handle invalid entries.",
    concept: "Multi-range evaluation with if-else ladder",
    category: "Conditionals",
    difficulty: "Easy",
  },
  {
    id: "cond-absolute",
    title: "Print Absolute Value (no library)",
    problem: "Output |n| without using Math.abs().",
    concept: "Conditional sign logic",
    category: "Conditionals",
    difficulty: "Easy",
  },
  {
    id: "cond-largest-two",
    title: "Largest/Smallest of Two",
    problem: "Given a and b, print the larger (or smaller) value.",
    concept: "If-else comparisons",
    category: "Conditionals",
    difficulty: "Easy",
  },
  {
    id: "cond-largest-ternary",
    title: "Largest Using Ternary",
    problem: "Compute max(a, b) using ternary operator.",
    concept: "a > b ? a : b",
    category: "Conditionals",
    difficulty: "Easy",
  },

  // Loops
  {
    id: "loop-1-to-n",
    title: "Print 1 to N",
    problem: "Print numbers from 1 up to N.",
    concept: "For loop, init/cond/update",
    category: "Loops",
    difficulty: "Easy",
  },
  {
    id: "loop-n-to-1",
    title: "Print N to 1",
    problem: "Print numbers from N down to 1.",
    concept: "Reverse loop with decrement",
    category: "Loops",
    difficulty: "Easy",
  },
  {
    id: "loop-evens",
    title: "All Even Numbers ≤ N",
    problem: "Print all even numbers up to N.",
    concept: "i % 2 == 0 or step by 2",
    category: "Loops",
    difficulty: "Easy",
  },
  {
    id: "loop-odds",
    title: "All Odd Numbers ≤ N",
    problem: "Print all odd numbers up to N.",
    concept: "i % 2 != 0 or step by 2",
    category: "Loops",
    difficulty: "Easy",
  },
  {
    id: "loop-divisible-x",
    title: "Divisible by X ≤ N",
    problem: "Print numbers divisible by X up to N.",
    concept: "Modulus with user divisor",
    category: "Loops",
    difficulty: "Easy",
  },
  {
    id: "loop-multiples-x",
    title: "Multiples of X ≤ N",
    problem: "Print multiples of X up to N.",
    concept: "Multiples/divisibility equivalence",
    category: "Loops",
    difficulty: "Easy",
  },
  {
    id: "loop-half-range",
    title: "Print 1 to N/2",
    problem: "Print numbers from 1 to N/2.",
    concept: "Boundary change to N/2",
    category: "Loops",
    difficulty: "Easy",
  },
  {
    id: "loop-mid-to-n",
    title: "Print N/2 to N",
    problem: "Print numbers from N/2 to N.",
    concept: "Start at N/2, increment",
    category: "Loops",
    difficulty: "Easy",
  },
  {
    id: "loop-n-to-mid",
    title: "Print N to N/2",
    problem: "Reverse from N down to N/2.",
    concept: "Decrement to mid",
    category: "Loops",
    difficulty: "Easy",
  },
  {
    id: "loop-multiples-a-b",
    title: "Multiples of a or b ≤ N",
    problem: "Print numbers that are multiples of a or b up to N.",
    concept: "Logical OR with modulus",
    category: "Loops",
    difficulty: "Easy",
  },
  {
    id: "loop-factors",
    title: "Factors of N",
    problem: "Print all factors of N.",
    concept: "Loop 1..N with N % i == 0",
    category: "Loops",
    difficulty: "Easy",
  },
];

const seedCategories: { key: Category; label: string; description: string }[] = [
  { key: "Data Types", label: "Data Types", description: "I/O, arithmetic, formatting, casting, and basic operators" },
  { key: "Conditionals", label: "Conditionals & ASCII", description: "Ranges, branching, ternary, and character codes" },
  { key: "Loops", label: "Loops", description: "Counting, ranges, divisibility, and factors" },
];

export function getCategories(): { key: Category; label: string; description: string }[] {
  const custom = loadCustomCategories();
  const removed = new Set(loadRemovedCategories());
  const byKey = new Map<string, { key: Category; label: string; description: string }>();
  [...seedCategories, ...custom].forEach((c) => {
    if (!removed.has(c.key)) byKey.set(c.key, c);
  });
  return Array.from(byKey.values());
}

export function addCategory(item: { key: string; label?: string; description?: string }) {
  const custom = loadCustomCategories();
  const label = item.label ?? item.key;
  const description = item.description ?? "Custom category";
  const byKey = new Map(custom.map((c) => [c.key, c] as const));
  byKey.set(item.key, { key: item.key as Category, label, description });
  saveCustomCategories(Array.from(byKey.values()));
}

export function removeCategory(key: string) {
  // Remove from custom categories if exists
  const custom = loadCustomCategories().filter((c) => c.key !== key);
  saveCustomCategories(custom);
  // Mark as removed to hide seed categories as well
  const removed = new Set(loadRemovedCategories());
  removed.add(key);
  saveRemovedCategories(Array.from(removed));
}

export function categoriesWithCounts() {
  // Return empty array since we're not using static categories anymore
  return [];
}

export async function categoriesWithCountsFromDB() {
  const list = await fetchChallengesFromDB();
  const categoryMap = new Map<string, number>();
  
  list.forEach((challenge) => {
    const count = categoryMap.get(challenge.category) || 0;
    categoryMap.set(challenge.category, count + 1);
  });
  
  return Array.from(categoryMap.entries()).map(([key, count]) => ({
    key: key as Category,
    label: key,
    description: `${key} challenges`,
    count
  }));
}
