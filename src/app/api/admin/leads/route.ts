import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const adminSecret = (process.env.ADMIN_SECRET || "").trim();
    if (!adminSecret) {
      return NextResponse.json(
        { error: "ADMIN_SECRET is not configured on the server." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    const bearerKey = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;
    const queryKey = searchParams.get("key")?.trim() ?? null;

    let bodyKey: string | null = null;
    let bodyId: string | null = null;

    // Check if request has a JSON body
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        const body: unknown = await request.json();
        if (typeof body === "object" && body !== null) {
          const bodyRecord = body as Record<string, unknown>;
          if (typeof bodyRecord.key === "string") {
            bodyKey = bodyRecord.key.trim();
          }
          if (typeof bodyRecord.id === "string") {
            bodyId = bodyRecord.id.trim();
          }
        }
      } catch {
        // Body reading failed or empty, proceed with query params / headers
      }
    }

    const providedKey = bearerKey || queryKey || bodyKey || "";
    if (providedKey !== adminSecret) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const leadId = searchParams.get("id")?.trim() || bodyId;
    if (!leadId) {
      return NextResponse.json(
        { error: "Report / Lead ID is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { error } = await supabase.from("leads").delete().eq("id", leadId);

    if (error) {
      console.error("[/api/admin/leads DELETE] Supabase delete error:", error);
      return NextResponse.json(
        { error: `Failed to delete report: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, id: leadId, message: "Report deleted successfully" },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[/api/admin/leads DELETE] Server exception:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
