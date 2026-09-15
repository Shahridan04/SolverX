import { createServerClient } from "@/lib/supabase/server";
import type { LeadRow } from "@/lib/supabase/types";
import AdminLeadsView from "./AdminLeadsView";
import Link from "next/link";

interface AdminPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const resolvedParams = await searchParams;
  const providedKey = typeof resolvedParams.key === "string" ? resolvedParams.key.trim() : "";
  const adminSecret = (process.env.ADMIN_SECRET || "").trim();

  // Auth: require ADMIN_SECRET to be set and matched
  const isAuthorized = adminSecret.length > 0 && providedKey === adminSecret;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100/90">
        <div className="card max-w-sm w-full p-6 shadow-md bg-white">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-1">Admin Access</h2>
          <p className="text-[12px] text-gray-500 mb-5">
            Enter the admin key to view the leads pipeline.
          </p>

          <form action="/admin" method="GET" className="space-y-3">
            <input
              type="password"
              name="key"
              required
              placeholder="Admin key"
              autoComplete="off"
              className="input"
            />
            <button type="submit" className="btn-primary !w-full !py-2 !text-[13px]">
              Authenticate
            </button>
          </form>

          {providedKey && !isAuthorized && (
            <p className="text-[12px] text-red-600 mt-3">Invalid key. Please try again.</p>
          )}

          <div className="mt-5 pt-4 border-t border-gray-100">
            <Link href="/assessment" className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to Assessment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch leads
  let leads: LeadRow[] = [];
  let dbError: string | null = null;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      dbError = error.message;
    } else {
      leads = (data as LeadRow[]) || [];
    }
  } catch (err: unknown) {
    dbError = err instanceof Error ? err.message : "Database connection error";
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-100/80">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[18px] font-semibold text-gray-900">Leads Pipeline</h1>
              <span className="tag tag-success text-[10px]">Live</span>
            </div>
            <p className="text-[12px] text-gray-500">
              Captured SME assessments, maturity scores, and solution matches.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/assessment" className="btn-secondary !text-[12px] !py-1.5">
              Open Assessment
            </Link>
            <Link
              href="/admin"
              className="text-[12px] text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5"
              title="Lock"
            >
              Lock
            </Link>
          </div>
        </div>

        {dbError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-700">
            <strong>Database error:</strong> {dbError}
          </div>
        )}

        <AdminLeadsView initialLeads={leads} adminKey={providedKey} />
      </div>
    </div>
  );
}
