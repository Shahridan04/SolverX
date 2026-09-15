import { NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini/client";

/**
 * GET /api/health
 *
 * Verifies the Gemini API key is valid and the connection works.
 * Use this to confirm your environment is correctly configured before building features.
 *
 * Returns:
 *   200 { status: "ok", gemini: "connected", model: string, latencyMs: number }
 *   500 { status: "error", message: string }
 *
 * Security: Add Bearer token auth before deploying to production.
 */
export async function GET(): Promise<NextResponse> {
  const start = Date.now();

  try {
    const ai = getGeminiClient();

    // SDK v2 simplified call — contents as a plain string
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: 'Reply with exactly the word: OK',
    });

    const text = response.text ?? "";

    return NextResponse.json({
      status: "ok",
      gemini: "connected",
      model: GEMINI_MODEL,
      response: text.trim(),
      latencyMs: Date.now() - start,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/health] Error:", message);
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
