"use client";

import { useState, useMemo } from "react";
import type { LeadRow, RecommendedProduct, AssessmentPayload } from "@/lib/supabase/types";

interface AdminLeadsViewProps {
  initialLeads: LeadRow[];
  adminKey: string;
}

const TOOL_LABELS: Record<string, string> = {
  whatsapp_only: "WhatsApp Personal for Inquiries",
  spreadsheets: "Spreadsheets (Excel / Sheets)",
  free_email: "Personal Email (@gmail/@yahoo)",
  domain_email: "Company Domain Email (@company.com)",
  basic_website: "Company Website / Landing Page",
  ecommerce_store: "Online Store / Marketplace",
  crm_software: "Dedicated CRM / Pipeline Tool",
  cloud_backup: "Automated Cloud Backup",
};

const BOTTLENECK_LABELS: Record<string, string> = {
  ops_workload: "Operational Workload & WhatsApp Overload",
  lost_leads: "Lost Leads & Unstructured Sales Follow-ups",
  email_credibility: "Client Trust & Brand Credibility Gaps",
  retail_omnichannel: "Messy Multi-Channel Orders & Inventory",
  cybersecurity: "Data Loss & Ransomware Vulnerability",
  website_presence: "Outdated or Non-Existent Web Presence",
  ai_readiness: "Lagging Behind on AI & Modern Automation",
};

const OUTCOME_LABELS: Record<string, string> = {
  save_time: "Save 10+ hours/week of manual staff labor",
  increase_revenue: "Capture & convert 30%+ more sales inquiries",
  professional_brand: "Win bigger corporate/B2B contracts",
  scale_multi_channel: "Expand into omnichannel e-commerce",
  secure_business: "Ensure 100% data safety & zero downtime",
};

const PROBE_ANSWER_LABELS: Record<string, string> = {
  hours_5: "1 - 5 hours/week (~1 hr/day)",
  hours_15: "10 - 20 hours/week (~15 hrs avg)",
  hours_30: "25 - 40+ hours/week (Full-time workload)",
  grant_ready_immediate: "Ready to deploy in < 30 days with Exabytes",
  ready_immediate: "Ready to deploy in < 30 days with Exabytes",
  grant_mdec_applying: "Applying for MDEC SME 50% Matching Grant",
  mdec_grant: "Applying for MDEC SME 50% Matching Grant",
  grant_pilot_starter: "Starting with a targeted starter pilot (60–90 days)",
  pilot_60_days: "Starting with a targeted starter pilot (60–90 days)",
};

const BUDGET_TIER_LABELS: Record<string, string> = {
  under_500: "Below RM 500 / month",
  "500_2000": "RM 500 – RM 2,000 / month",
  above_2000: "RM 2,000+ / month",
  mdec_grant: "Applying for 50% MDEC SME Grant",
};

function getAssignedAdvisor(industry: string): { name: string; role: string; badge: string } {
  const ind = (industry || "").toLowerCase();
  if (ind.includes("food") || ind.includes("f&b") || ind.includes("retail") || ind.includes("e-commerce")) {
    return { name: "Sarah Lim", role: "Commerce Solutions Lead", badge: "bg-rose-50 text-rose-700 border-rose-200" };
  }
  if (ind.includes("manufacturing") || ind.includes("service") || ind.includes("logistics")) {
    return { name: "Ahmad Zulkifli", role: "SME Cloud Advisor", badge: "bg-blue-50 text-blue-700 border-blue-200" };
  }
  return { name: "Priya Nair", role: "Digital Growth Consultant", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" };
}

function formatLabel(val: string, dictionary: Record<string, string>): string {
  if (!val) return "Not Specified";
  if (dictionary[val]) return dictionary[val];
  return val
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminLeadsView({ initialLeads, adminKey }: AdminLeadsViewProps) {
  const [leads] = useState<LeadRow[]>(initialLeads);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [copiedLead, setCopiedLead] = useState(false);

  // Industry list for filter dropdown
  const industries = useMemo(() => {
    const set = new Set(leads.map((l) => l.industry));
    return Array.from(set).filter(Boolean);
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const payload = l.assessment_payload as unknown as Record<string, unknown>;
      const rawBottleneck = (payload?.primaryBottleneck || payload?.bottlenecks || "") as string;

      const matchesSearch =
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.company && l.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rawBottleneck.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIndustry = filterIndustry === "all" || l.industry === filterIndustry;

      const matchesTier =
        filterTier === "all" ||
        (filterTier === "emerging" && l.maturity_score < 40) ||
        (filterTier === "developing" && l.maturity_score >= 40 && l.maturity_score < 70) ||
        (filterTier === "mature" && l.maturity_score >= 70);

      return matchesSearch && matchesIndustry && matchesTier;
    });
  }, [leads, searchTerm, filterIndustry, filterTier]);

  // Summary Metrics
  const totalLeads = leads.length;
  const avgMaturity =
    totalLeads > 0
      ? Math.round(leads.reduce((acc, l) => acc + (l.maturity_score || 0), 0) / totalLeads)
      : 0;

  const mdecInterestCount = useMemo(() => {
    return leads.filter((l) => {
      const payload = l.assessment_payload as unknown as Record<string, unknown>;
      const fu = payload?.followUpAnswers as Record<string, string> | undefined;
      if (!fu) return false;
      return Object.values(fu).some(
        (v) => typeof v === "string" && (v.includes("mdec") || v.includes("grant"))
      );
    }).length;
  }, [leads]);

  // CSV Exporter
  const handleExportCsv = () => {
    if (filteredLeads.length === 0) return;

    const headers = [
      "ID",
      "Date",
      "Name",
      "Email",
      "Company",
      "Industry",
      "Team Size",
      "Maturity Score",
      "Primary Bottleneck",
      "Top Solution",
      "Estimated Annual ROI (RM)",
    ];

    const rows = filteredLeads.map((lead) => {
      const prods = Array.isArray(lead.recommended_products)
        ? (lead.recommended_products as unknown as RecommendedProduct[])
        : [];
      const topProd = prods[0]?.name || "None";
      const topRoi = prods[0]?.estimatedRoiAnnual || 0;
      const payload = lead.assessment_payload as unknown as Record<string, unknown>;
      const rawBottleneck = (payload?.primaryBottleneck || payload?.bottlenecks || "") as string;
      const formattedBottleneck = formatLabel(rawBottleneck, BOTTLENECK_LABELS);

      return [
        `"${lead.id}"`,
        `"${new Date(lead.created_at).toISOString()}"`,
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${lead.email.replace(/"/g, '""')}"`,
        `"${(lead.company || "").replace(/"/g, '""')}"`,
        `"${lead.industry.replace(/"/g, '""')}"`,
        `"${lead.team_size}"`,
        lead.maturity_score,
        `"${formattedBottleneck.replace(/"/g, '""')}"`,
        `"${topProd.replace(/"/g, '""')}"`,
        topRoi,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `solverx_exabytes_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLeadDetails = (lead: LeadRow) => {
    const payload = lead.assessment_payload as unknown as Record<string, unknown>;
    const prods = Array.isArray(lead.recommended_products)
      ? (lead.recommended_products as unknown as RecommendedProduct[])
      : [];

    const summary = `SOLVERX SME LEAD PROFILE
Company: ${lead.company || "Independent SME"}
Contact: ${lead.name} (${lead.email})
Industry: ${lead.industry} | Team: ${lead.team_size}
Digital Maturity: ${lead.maturity_score}/100
Primary Bottleneck: ${formatLabel((payload?.primaryBottleneck || payload?.bottlenecks || "") as string, BOTTLENECK_LABELS)}
Target Goal: ${formatLabel((payload?.primaryOutcome || "") as string, OUTCOME_LABELS)}
Top Recommended Solution: ${prods.map((p) => p.name).join(", ")}
Date: ${new Date(lead.created_at).toLocaleDateString("en-MY")}`;

    navigator.clipboard.writeText(summary);
    setCopiedLead(true);
    setTimeout(() => setCopiedLead(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* ─── Metric KPI Cards (Exabytes Executive Styling) ──────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-white border border-slate-200/90 shadow-2xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Captured Leads</p>
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#002244] mt-2 tracking-tight">{totalLeads}</p>
          <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Malaysian SME submissions</span>
          </div>
        </div>

        <div className="card p-5 bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Avg Digital Maturity</p>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#002244] mt-2 tracking-tight">
            {avgMaturity}
            <span className="text-sm font-semibold text-slate-400"> / 100</span>
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{avgMaturity < 40 ? "Emerging Tier (Benchmark 36)" : avgMaturity < 70 ? "Developing Tier" : "Mature Tier"}</span>
          </div>
        </div>

        <div className="card p-5 bg-white border border-slate-200/90 shadow-2xs hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">MDEC Grant Prospects</p>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-indigo-700 mt-2 tracking-tight">{mdecInterestCount}</p>
          <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Inquired for 50% co-funding</span>
          </div>
        </div>

        <div className="card p-5 bg-white border border-slate-200/90 shadow-2xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">High Opportunity</p>
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-700 mt-2 tracking-tight">
            {leads.filter((l) => l.maturity_score < 45).length}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Score &lt; 45 (Immediate sales focus)</span>
          </div>
        </div>
      </div>

      {/* ─── Search & Actions Bar ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search SME name, email, company, bottleneck..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input !pl-9 !text-[13px] !w-full"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="input !w-auto !text-[13px]"
          >
            <option value="all">All Industries ({industries.length})</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="input !w-auto !text-[13px]"
          >
            <option value="all">All Maturity Tiers</option>
            <option value="emerging">Emerging (&lt; 40)</option>
            <option value="developing">Developing (40–69)</option>
            <option value="mature">Digitally Mature (70+)</option>
          </select>
        </div>

        <button onClick={handleExportCsv} className="btn-secondary !text-[12px] !py-2 !px-3.5 font-semibold flex items-center gap-2 shadow-2xs cursor-pointer">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export CSV ({filteredLeads.length})</span>
        </button>
      </div>

      {/* ─── Leads Data Table ────────────────────────────────────────── */}
      <div className="card overflow-hidden border border-slate-200/90 bg-white shadow-2xs rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Submission Date</th>
                <th className="px-5 py-3.5">SME Contact &amp; Company</th>
                <th className="px-5 py-3.5">Sector &amp; Scale</th>
                <th className="px-5 py-3.5">Maturity Score</th>
                <th className="px-5 py-3.5">Core Operational Bottleneck</th>
                <th className="px-5 py-3.5 text-right">Consultation Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-slate-500">
                    <p className="text-base font-bold text-slate-700">No leads match your filter criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing search keywords or industry filters.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const prods = Array.isArray(lead.recommended_products)
                    ? (lead.recommended_products as unknown as RecommendedProduct[])
                    : [];
                  const payload = lead.assessment_payload as unknown as Record<string, unknown>;
                  const rawBottleneck = (payload?.primaryBottleneck || payload?.bottlenecks || "") as string;
                  const formattedBottleneck = formatLabel(rawBottleneck, BOTTLENECK_LABELS);
                  const createdDate = new Date(lead.created_at);

                  const initials = lead.name
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "SME";

                  return (
                    <tr key={lead.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                        <div className="font-semibold text-slate-800">
                          {createdDate.toLocaleDateString("en-MY", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {createdDate.toLocaleTimeString("en-MY", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-[13.5px]">{lead.name}</div>
                            <div className="text-xs text-blue-600 font-medium hover:underline">{lead.email}</div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">
                              {lead.company || "Independent SME"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                          {lead.industry}
                        </span>
                        <div className="text-[11.5px] text-slate-500 mt-1 font-medium">Team: {lead.team_size}</div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                            lead.maturity_score < 40
                              ? "bg-amber-50 border-amber-200 text-amber-800"
                              : lead.maturity_score < 70
                              ? "bg-blue-50 border-blue-200 text-blue-800"
                              : "bg-emerald-50 border-emerald-200 text-emerald-800"
                          }`}
                        >
                          {lead.maturity_score} / 100
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-[12.5px] font-semibold text-slate-800 line-clamp-1">
                          {formattedBottleneck}
                        </div>
                        {prods[0] && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            Matched: <span className="font-medium text-blue-700">{prods[0].name}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="btn-secondary !text-xs !py-1.5 !px-3 font-semibold !text-blue-700 !border-blue-200 hover:!bg-blue-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Inspect Diagnosis</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Detail Modal (Enhanced Human-Readable View) ─────────────── */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto custom-scrollbar"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto custom-scrollbar p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    LEAD // EXA-{selectedLead.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 font-medium capitalize">
                    {selectedLead.industry} Sector
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#002244] mt-2">
                  {selectedLead.company || selectedLead.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Contact: <strong className="text-slate-800">{selectedLead.name}</strong> ({selectedLead.email})
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ── Pre-Call Sales Strategy Briefing ───────────────────────────────── */}
            {(() => {
              const payload = selectedLead.assessment_payload as unknown as Record<string, unknown>;
              const advisor = getAssignedAdvisor(selectedLead.industry);
              const rawBottleneck = (payload?.primaryBottleneck || payload?.bottlenecks || "") as string;
              const prods = Array.isArray(selectedLead.recommended_products)
                ? (selectedLead.recommended_products as unknown as RecommendedProduct[])
                : [];
              const budgetTier = (payload?.budget_tier || "") as string;
              return (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-blue-600/10 border border-blue-600/20 text-blue-600 flex items-center justify-center">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <h4 className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-800">
                        Pre-Call Sales Strategy Briefing
                      </h4>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${advisor.badge}`}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{advisor.name} · {advisor.role}</span>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-slate-600 block mb-0.5">Business Size</span>
                      <span className="text-slate-800 font-medium capitalize">{selectedLead.team_size} · {selectedLead.industry}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-slate-600 block mb-0.5">Investment Budget</span>
                      <span className="text-slate-800 font-medium">
                        {budgetTier ? formatLabel(budgetTier, BUDGET_TIER_LABELS) : <span className="text-slate-400 italic">Not captured</span>}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-slate-600 block mb-0.5">Primary Pain Point</span>
                      <span className="text-slate-800 font-medium">{formatLabel(rawBottleneck, BOTTLENECK_LABELS)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-slate-600 block mb-0.5">Top Matched Solution</span>
                      <span className="text-slate-800 font-medium">{prods[0]?.name || "—"}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-6 my-6">
              {/* Score & Profile Banner */}
              <div className="grid grid-cols-2 gap-4 bg-gradient-to-r from-slate-50 to-blue-50/40 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Digital Maturity Score
                  </span>
                  <div className="text-3xl font-extrabold text-blue-700 mt-1">
                    {selectedLead.maturity_score}
                    <span className="text-sm font-semibold text-slate-400"> / 100</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Team Scale &amp; Sector
                  </span>
                  <div className="text-sm font-bold text-slate-800 capitalize mt-1.5">
                    {selectedLead.industry}
                  </div>
                  <div className="text-xs text-slate-500">
                    Team: {selectedLead.team_size} members
                  </div>
                </div>
              </div>

              {/* Discovery Questionnaire Data (Cleaned & Formatted) */}
              {(() => {
                const payload = selectedLead.assessment_payload as unknown as Record<string, unknown>;
                const rawTools = Array.isArray(payload?.currentTools) ? (payload.currentTools as string[]) : [];
                const rawBottleneck = (payload?.primaryBottleneck || payload?.bottlenecks || "") as string;
                const rawOutcome = (payload?.primaryOutcome || "") as string;
                const followUpObj = (payload?.followUpAnswers || {}) as Record<string, string>;

                return (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      SME Discovery Profile
                    </h4>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-3">
                      <div>
                        <span className="font-bold text-slate-900 block mb-1">Current Tech Stack:</span>
                        {rawTools.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {rawTools.map((t) => (
                              <span
                                key={t}
                                className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium"
                              >
                                {formatLabel(t, TOOL_LABELS)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No tools recorded</span>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                        <div>
                          <span className="font-bold text-slate-900 block mb-0.5">Primary Bottleneck:</span>
                          <span className="text-slate-700 font-medium">
                            {formatLabel(rawBottleneck, BOTTLENECK_LABELS)}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block mb-0.5">6–12 Month Growth Target:</span>
                          <span className="text-slate-700 font-medium">
                            {formatLabel(rawOutcome, OUTCOME_LABELS)}
                          </span>
                        </div>
                      </div>

                      {/* AI Consultative Follow-up Probes */}
                      {Object.keys(followUpObj).length > 0 && (
                        <div className="pt-2.5 border-t border-slate-200/60">
                          <span className="font-bold text-slate-900 block mb-2">
                            Gemini Consultative Probes (Severity &amp; Grant Readiness):
                          </span>
                          <div className="space-y-2">
                            {Object.entries(followUpObj)
                              .filter(([k]) => k !== "scenarioId")
                              .map(([k, val], idx) => (
                                <div
                                  key={k}
                                  className="p-2.5 rounded-xl bg-white border border-blue-100 flex items-start justify-between gap-3"
                                >
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wide block">
                                      Probe {idx + 1}: {k.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-800">
                                      {formatLabel(val, PROBE_ANSWER_LABELS)}
                                    </span>
                                  </div>
                                  {val.includes("grant") || val.includes("mdec") ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                      MDEC 50% Grant
                                    </span>
                                  ) : null}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Recommended Exabytes Solutions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Matched Exabytes Solutions &amp; AI Rationale
                </h4>
                <div className="space-y-3">
                  {(Array.isArray(selectedLead.recommended_products)
                    ? (selectedLead.recommended_products as unknown as RecommendedProduct[])
                    : []
                  ).map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#002244]">{p.name}</span>
                        <span className="text-[11px] text-blue-700 font-bold uppercase px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                          {p.category || "SOLUTIONS"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {p.whyThisFitsYou || "Engineered for Malaysian SME scale and reliability."}
                      </p>
                      {p.estimatedRoiAnnual && (
                        <div className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <span>Estimated Economic Value: RM {p.estimatedRoiAnnual.toLocaleString()} / year</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLeadDetails(selectedLead)}
                  className="btn-secondary !text-xs !py-2 !px-3 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>{copiedLead ? "Copied to Clipboard!" : "Copy Lead Summary"}</span>
                </button>
                <a
                  href={`mailto:${selectedLead.email}?subject=Exabytes%20Digital%20Growth%20Advisory%20Follow-Up&body=Hi%20${encodeURIComponent(
                    selectedLead.name
                  )},%0D%0A%0D%0AThank%20you%20for%20completing%20the%20SolverX%20Digital%20Growth%20Assessment.%0D%0A%0D%0AWe%20reviewed%20your%20digital%20maturity%20score%20(${
                    selectedLead.maturity_score
                  }/100)%20and%20prepared%20recommendations%20for%20your%20${encodeURIComponent(
                    selectedLead.industry
                  )}%20business.`}
                  className="btn-primary !text-xs !py-2 !px-3.5 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email Client</span>
                </a>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="btn-secondary !text-xs !py-2 !px-4 font-semibold text-slate-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
