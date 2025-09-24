import type { RequestHandler } from "express";
import type { ExecuteRequest, ExecuteResponse } from "@shared/api";
import { pool } from "../db";
import { sanitizeInput, validateUrl, checkRateLimit } from "../utils/security.js";
import { trackSubmission } from "./analytics.js";

const DEFAULT_CE = process.env.JUDGE0_API_URL || "https://ce.judge0.com";
const RAPID_HOST = process.env.JUDGE0_RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com";
const USE_RAPID = !!process.env.JUDGE0_RAPIDAPI_KEY;
const JUDGE0_URL = USE_RAPID ? `https://${RAPID_HOST}` : DEFAULT_CE;
// Java 17 (language_id 62) per Judge0
const JAVA_LANGUAGE_ID = 62;

export const handleExecute: RequestHandler = async (req, res) => {
  try {
    if (!checkRateLimit(`execute_${req.ip}`, 10, 60000)) {
      return res.status(429).json({ error: "Too many requests" });
    }

    const body = req.body as ExecuteRequest & { username?: string; challengeId?: string };
    if (!body || !body.code) {
      res.status(400).json({ error: "Missing code" });
      return;
    }

    // Validate Judge0 URL to prevent SSRF
    if (!validateUrl(JUDGE0_URL)) {
      res.status(500).json({ error: "Invalid Judge0 URL configuration" });
      return;
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (USE_RAPID && process.env.JUDGE0_RAPIDAPI_KEY) {
      headers["X-RapidAPI-Key"] = process.env.JUDGE0_RAPIDAPI_KEY;
      headers["X-RapidAPI-Host"] = RAPID_HOST;
    }
    if (process.env.JUDGE0_TOKEN) {
      headers["X-Auth-Token"] = process.env.JUDGE0_TOKEN;
    }

    const b64 = (v: string) => Buffer.from(v, "utf-8").toString("base64");

    const submissionRes = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          source_code: b64(body.code),
          language_id: JAVA_LANGUAGE_ID,
          stdin: b64(body.stdin ?? ""),
        }),
      },
    );

    const rawText = await submissionRes.text();
    if (!submissionRes.ok) {
      res.status(500).json({ error: "Judge0 request failed", details: rawText });
      return;
    }

    const raw = JSON.parse(rawText) as ExecuteResponse & {
      stdout?: string | null; stderr?: string | null; compile_output?: string | null;
    };

    const decode = (v?: string | null) => (v ? Buffer.from(v, "base64").toString("utf-8") : v);

    const data: ExecuteResponse = {
      ...raw,
      stdout: decode(raw.stdout),
      stderr: decode(raw.stderr),
      compile_output: decode(raw.compile_output),
    };

    // Track analytics if user info provided
    if (body.username && body.challengeId) {
      try {
        const status = data.status?.id === 3 ? 'PASSED' : 
                      data.status?.id === 4 ? 'ERROR' : 
                      data.status?.id === 5 ? 'TIMEOUT' : 'FAILED';
        
        const trackingData = {
          username: body.username,
          challengeId: body.challengeId,
          code: body.code,
          status: status as 'PASSED' | 'FAILED' | 'ERROR' | 'TIMEOUT',
          executionTime: data.time ? Math.round(parseFloat(data.time) * 1000) : undefined
        };
        
        // Use proper analytics tracking
        const mockReq = { body: trackingData, ip: req.ip } as any;
        const mockRes = { status: () => ({ json: () => {} }), json: () => {} } as any;
        await trackSubmission(mockReq, mockRes);
      } catch (e) {
        // Don't fail the request if analytics fails
        console.error('Analytics recording failed:', e);
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Execution failed", details: String(err) });
  }
};


