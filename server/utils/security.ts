import { z } from "zod";
import crypto from "node:crypto";

// Input sanitization utilities
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes
    .replace(/[;&|`$]/g, "") // Remove command injection chars
    .trim()
    .slice(0, 1000); // Limit length
}

export function sanitizeHtml(input: string): string {
  if (!input) return "";
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Allow only HTTPS for external services
    if (parsed.protocol !== "https:") return false;
    
    // Block private/local addresses
    const hostname = parsed.hostname.toLowerCase();
    const blockedHosts = [
      "localhost", "127.0.0.1", "0.0.0.0", "::1",
      "169.254.169.254", // AWS metadata
      "metadata.google.internal" // GCP metadata
    ];
    
    if (blockedHosts.includes(hostname)) return false;
    
    // Block private IP ranges
    if (hostname.match(/^10\.|^172\.(1[6-9]|2[0-9]|3[01])\.|^192\.168\./)) return false;
    
    // Only allow known Judge0 domains
    const allowedDomains = [
      "ce.judge0.com",
      "judge0-ce.p.rapidapi.com",
      "api.judge0.com"
    ];
    
    return allowedDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// CSRF token generation and validation
const csrfTokens = new Set<string>();

export function generateCsrfToken(): string {
  const token = crypto.randomBytes(32).toString("hex");
  csrfTokens.add(token);
  // Clean up old tokens after 1 hour
  setTimeout(() => csrfTokens.delete(token), 3600000);
  return token;
}

export function validateCsrfToken(token: string): boolean {
  return csrfTokens.has(token);
}