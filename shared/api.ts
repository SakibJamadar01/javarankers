/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface ExecuteRequest {
  language: "java" | "python" | "javascript" | "cpp" | "c";
  code: string;
  stdin?: string;
  username?: string;
  challengeId?: string;
}

export interface ExecuteResponse {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  status: { id: number; description: string };
  time?: string | null;
  memory?: number | null;
}

export interface Challenge {
  id: string;
  title: string;
  problem: string;
  concept: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  sampleCode?: string;
  testCases?: Array<{input: string; expectedOutput?: string}>;
}
