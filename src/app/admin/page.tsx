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
      <div className="min-h-screen bg-[#F1F5F9] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Ambient background glows matching assessment theme */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -top-10 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[#002244]/10 rounded-full blur-3xl" />
        </div>

        {/* Industrial Container Frame */}
        <div className="max-w-md w-full relative">
          {/* Subtle industrial corner tick accents */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-blue-600/40 pointer-events-none" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-blue-600/40 pointer-events-none" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-blue-600/40 pointer-events-none" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-blue-600/40 pointer-events-none" />

          {/* Main Industrial Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-300/90 shadow-2xl overflow-hidden">
            {/* Top Industrial Header Strip */}
            <div className="bg-[#001529] px-6 py-4 flex items-center justify-between border-b border-slate-800 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono tracking-widest text-blue-400 font-bold uppercase">
                      SYS://SECURE-GATEWAY
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h2 className="text-[14px] font-bold tracking-tight text-white">
                    Exabytes Sales Console
                  </h2>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-400">
                AUTH-v2
              </span>
            </div>

            {/* Content Area */}
            <div className="p-6 sm:p-7">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  <span className="text-blue-600">●</span>
                  <span>Restricted Access</span>
                </div>
                <h3 className="text-lg font-bold text-[#002244]">
                  Administrator Verification
                </h3>
                <p className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">
                  Provide your credential key to access real-time SME diagnostics, lead handover queue, and advisor matching.
                </p>
              </div>

              <form action="/admin" method="GET" className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                    Access Key <span className="text-blue-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      name="key"
                      required
                      autoFocus
                      placeholder="••••••••••••••••"
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                {providedKey && !isAuthorized && (
                  <div className="p-3 rounded-xl bg-red-50/90 border border-red-200/90 flex items-start gap-2.5 text-red-700">
                    <svg className="w-4 h-4 text-red-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-[12px]">
                      <p className="font-semibold text-red-800">Authentication Failed</p>
                      <p className="text-red-600/90 text-[11px] mt-0.5">
                        Invalid admin key. Please check your credentials and try again.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0066ff] hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-[13px] tracking-wide flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 cursor-pointer"
                >
                  <span>Authenticate Session</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>

              {/* Bottom Industrial Meta & Link */}
              <div className="mt-6 pt-5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <Link
                  href="/assessment"
                  className="text-slate-500 hover:text-blue-600 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <span>←</span> Back to Assessment
                </Link>

                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span>256-BIT SSL ENCRYPTED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Industrial Terminal Footer caption */}
          <div className="text-center mt-4">
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Exabytes Malaysia · SolverX Advisory Telemetry
            </p>
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-[#F1F5F9] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] relative">
      {/* Ambient background glows matching assessment theme */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative">
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
