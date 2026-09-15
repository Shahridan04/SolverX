import { NextResponse } from "next/server";
import { generateDiagnosisReport } from "@/lib/gemini/engine";
import type { AssessmentPayload } from "@/lib/supabase/types";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const payload = body as Record<string, unknown>;

    const assessmentPayload: AssessmentPayload = {
      industry: typeof payload.industry === "string" ? payload.industry : "General SME",
      teamSize: typeof payload.teamSize === "string" ? payload.teamSize : "small",
      currentTools: Array.isArray(payload.currentTools)
        ? payload.currentTools.filter((t): t is string => typeof t === "string")
        : [],
      primaryBottleneck:
        typeof payload.primaryBottleneck === "string" ? payload.primaryBottleneck : "ops_workload",
      secondaryBottleneck:
        typeof payload.secondaryBottleneck === "string" ? payload.secondaryBottleneck : null,
      primaryOutcome:
        typeof payload.primaryOutcome === "string" ? payload.primaryOutcome : "save_time",
      followUpAnswers:
        typeof payload.followUpAnswers === "object" && payload.followUpAnswers !== null
          ? (payload.followUpAnswers as Record<string, string>)
          : {},
    };

    const report = await generateDiagnosisReport(assessmentPayload);
    return NextResponse.json(report);
  } catch (err: unknown) {
    console.error("[/api/assessment/diagnose] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
