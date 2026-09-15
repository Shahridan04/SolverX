import { NextResponse } from "next/server";
import { generateDynamicFollowUp } from "@/lib/gemini/engine";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const payload = body as Record<string, unknown>;
    const answers = {
      industry: typeof payload.industry === "string" ? payload.industry : "other",
      teamSize: typeof payload.teamSize === "string" ? payload.teamSize : "small",
      currentTools: Array.isArray(payload.currentTools)
        ? payload.currentTools.filter((t): t is string => typeof t === "string")
        : [],
      bottlenecks: typeof payload.bottlenecks === "string" ? payload.bottlenecks : "ops_workload",
      primaryOutcome: typeof payload.primaryOutcome === "string" ? payload.primaryOutcome : "save_time",
    };

    const result = await generateDynamicFollowUp(answers);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/assessment/follow-up] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
