import { GoogleGenAI } from "@google/genai";

/**
 * Singleton Gemini client for SolverX.
 *
 * Rules:
 * - Import ONLY in server-side files (API routes, Server Actions).
 * - NEVER import this in a Client Component — the API key must never reach the browser.
 * - Uses Gemini Flash tier for speed and free-tier compatibility.
 */

let _client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (_client) return _client;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "[SolverX] GEMINI_API_KEY is not set or still has the placeholder value. " +
        "Add your real key to .env.local before making AI calls."
    );
  }

  _client = new GoogleGenAI({ apiKey });
  return _client;
}

/** The Gemini model to use across all SolverX AI calls. */
export const GEMINI_MODEL = "gemini-3.6-flash" as const;
