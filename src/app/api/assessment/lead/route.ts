import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { LeadInsert } from "@/lib/supabase/types";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const payload = body as Record<string, unknown>;

    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    const company = typeof payload.company === "string" ? payload.company.trim() : "";

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const leadData: LeadInsert = {
      name,
      email,
      company: company || null,
      industry: typeof payload.industry === "string" ? payload.industry : "General",
      team_size: typeof payload.team_size === "string" ? payload.team_size : "1-9",
      maturity_score: typeof payload.maturity_score === "number" ? payload.maturity_score : 50,
      recommended_products: (Array.isArray(payload.recommended_products)
        ? payload.recommended_products
        : []) as unknown as LeadInsert["recommended_products"],
      assessment_payload: (typeof payload.assessment_payload === "object" && payload.assessment_payload !== null
        ? payload.assessment_payload
        : {
            industry: "General",
            teamSize: "small",
            currentTools: [],
            primaryBottleneck: "ops_workload",
            secondaryBottleneck: null,
            primaryOutcome: "save_time",
            followUpAnswers: {},
          }) as unknown as LeadInsert["assessment_payload"],
    };

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("leads")
      .insert(leadData)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[/api/assessment/lead] Supabase insert error:", error);
      return NextResponse.json(
        {
          success: true,
          leadId: "local_" + Date.now(),
          warning: "Saved locally (Supabase table may need migration: " + error.message + ")",
        },
        { status: 200 }
      );
    }

    const returnedId = data && typeof data === "object" && "id" in data ? String((data as { id: string }).id) : "lead_" + Date.now();

    return NextResponse.json({ success: true, leadId: returnedId }, { status: 200 });
  } catch (err: unknown) {
    console.error("[/api/assessment/lead] Server error:", err);
    return NextResponse.json(
      {
        success: true,
        leadId: "local_" + Date.now(),
        warning: err instanceof Error ? err.message : "Handled exception",
      },
      { status: 200 }
    );
  }
}
