"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { BASE_QUESTIONS } from "@/lib/assessment-scenarios";
import type { DynamicFollowUpResult, DiagnosisReport } from "@/lib/gemini/engine";

type FlowStep = "questions" | "ai_probing" | "follow_up" | "ai_diagnosing" | "report";

// Consultant Notes Default Template
const DEFAULT_CONSULTANT_NOTES = `• SME qualifies for up to 50% MDEC SME Digitalization Co-Funding Grant on Exabytes cloud licenses.
• Immediate Priority: Consolidate high-volume customer inquiries off personal WhatsApp onto an automated Exabytes workspace.
• Target 90-day milestone: Deploy centralized cloud storage & custom business email to protect enterprise quotation credibility.`;

export default function AssessmentPage() {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [flowStep, setFlowStep] = useState<FlowStep>("questions");

  const [answers, setAnswers] = useState<{
    industry: string;
    teamSize: string;
    currentTools: string[];
    bottlenecks: string;
    primaryOutcome: string;
  }>({
    industry: "",
    teamSize: "",
    currentTools: [],
    bottlenecks: "",
    primaryOutcome: "",
  });

  // AI Follow-up (2 consultative probes: severity and readiness)
  const [dynamicFollowUp, setDynamicFollowUp] = useState<DynamicFollowUpResult | null>(null);
  const [activeProbeIdx, setActiveProbeIdx] = useState<number>(0);
  const [selectedProbeAnswers, setSelectedProbeAnswers] = useState<Record<string, string>>({});
  const [telemetryStage, setTelemetryStage] = useState<number>(1);

  // Report
  const [report, setReport] = useState<DiagnosisReport | null>(null);

  // Interactive Report State
  const [activeRoadmapPhase, setActiveRoadmapPhase] = useState<number>(0);
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
  const [productFilter, setProductFilter] = useState<string>("all");
  const [copiedLink, setCopiedLink] = useState(false);
  const [interactiveTeamSize, setInteractiveTeamSize] = useState<number>(8);
  const [interactiveAdoptionRate, setInteractiveAdoptionRate] = useState<number>(80);
  const [isSharedView, setIsSharedView] = useState<boolean>(false);

  // Consultant Notes & Strategic Advisory
  const [consultantNotes, setConsultantNotes] = useState<string>(DEFAULT_CONSULTANT_NOTES);
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  // Lead form
  const [leadForm, setLeadForm] = useState({ name: "", email: "", company: "", budgetTier: "" });
  const [leadSaved, setLeadSaved] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const currentQ = BASE_QUESTIONS[currentQuestionIdx];
  const totalBaseQuestions = BASE_QUESTIONS.length;

  // Check for shared diagnosis link on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get("share");
    if (!shareParam) return;
    try {
      const jsonStr = decodeURIComponent(atob(shareParam));
      const parsed = JSON.parse(jsonStr);
      if (parsed?.r && parsed?.a) {
        // eslint-disable-next-line
        setReport({
          maturityScore: parsed.r.s,
          maturityTier: parsed.r.t,
          summary: parsed.r.sm,
          keyGaps: parsed.r.g,
          recommendedProducts: parsed.r.rp,
          roiEstimate: parsed.r.roi,
          immediateActionPlan: parsed.r.ap,
          maturityCategories: parsed.r.mc || { website: 3, cloud: 2, crm: 1, marketing: 2, cybersecurity: 2, aiAdoption: 1 },
          aiReadiness: parsed.r.air || { leadership: 3, dataAvailability: 2, employeeSkills: 2, digitalWorkflow: 1, processMaturity: 2 },
          isAiGenerated: true,
        });
        setAnswers({
          industry: parsed.a.i || "Retail & E-Commerce",
          teamSize: parsed.a.ts || "6 - 20 Employees",
          currentTools: parsed.a.ct || [],
          bottlenecks: parsed.a.b || "ops_workload",
          primaryOutcome: parsed.a.po || "save_time",
        });
        if (parsed.a.c) {
          setLeadForm((prev) => ({ ...prev, company: parsed.a.c }));
        }
        if (parsed.r.cn) {
          setConsultantNotes(parsed.r.cn);
        }
        setIsSharedView(true);
        setFlowStep("report");
      }
    } catch (e) {
      console.warn("[SolverX] Error unpacking share link:", e);
    }
  }, []);

  // Initialize interactive slider when teamSize answer is provided
  useEffect(() => {
    if (answers.teamSize) {
      const parsed = parseInt(answers.teamSize.replace(/\D/g, ""), 10);
      if (!isNaN(parsed) && parsed > 0) {
        // eslint-disable-next-line
        setInteractiveTeamSize(parsed);
      }
    }
  }, [answers.teamSize]);

  /* ─── Telemetry stage progression for consultative loading screens ── */
  useEffect(() => {
    if (flowStep === "ai_probing" || flowStep === "ai_diagnosing") {
      // eslint-disable-next-line
      setTelemetryStage(1);
      const t1 = setTimeout(() => setTelemetryStage(2), 600);
      const t2 = setTimeout(() => setTelemetryStage(3), 1200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [flowStep]);

  /* ─── Option selection ─────────────────────────────────────────────── */
  const handleSelectOption = (optionId: string) => {
    if (currentQ.type === "single") {
      setAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }));
    } else {
      setAnswers((prev) => {
        const list = prev.currentTools || [];
        const exists = list.includes(optionId);
        return { ...prev, currentTools: exists ? list.filter((id) => id !== optionId) : [...list, optionId] };
      });
    }
  };

  const isCurrentStepValid = (): boolean => {
    if (!currentQ) return false;
    if (currentQ.type === "single") {
      const val = answers[currentQ.id as keyof typeof answers];
      return typeof val === "string" && val.length > 0;
    }
    return answers.currentTools.length > 0;
  };

  /* ─── Navigation ───────────────────────────────────────────────────── */
  const handleNext = async () => {
    if (currentQuestionIdx < totalBaseQuestions - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      return;
    }

    setFlowStep("ai_probing");
    try {
      const [res] = await Promise.all([
        fetch("/api/assessment/follow-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(answers),
        }),
        new Promise((resolve) => setTimeout(resolve, 1800)),
      ]);

      const data: DynamicFollowUpResult = await res.json();
      if (data) {
        setDynamicFollowUp(data);
        const probes = data.probes || [];
        const initAnswers: Record<string, string> = {};
        if (probes[0]?.options?.[0]) initAnswers[probes[0].id] = probes[0].options[0].id;
        if (probes[1]?.options?.[0]) initAnswers[probes[1].id] = probes[1].options[0].id;
        setSelectedProbeAnswers(initAnswers);
        setActiveProbeIdx(0);
      }
      setFlowStep("follow_up");
    } catch (err: unknown) {
      console.error("Follow-up fetch failed:", err);
      setFlowStep("follow_up");
    }
  };

  const handleBack = () => {
    if (currentQuestionIdx > 0) setCurrentQuestionIdx((prev) => prev - 1);
  };

  /* ─── Final diagnosis ──────────────────────────────────────────────── */
  const handleFinishAssessment = async () => {
    setFlowStep("ai_diagnosing");
    try {
      const [res] = await Promise.all([
        fetch("/api/assessment/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            industry: answers.industry,
            teamSize: answers.teamSize,
            currentTools: answers.currentTools,
            primaryBottleneck: answers.bottlenecks,
            secondaryBottleneck: null,
            primaryOutcome: answers.primaryOutcome,
            followUpAnswers: {
              ...selectedProbeAnswers,
              scenarioId: dynamicFollowUp?.scenarioId || "follow_up",
            },
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, 1800)),
      ]);

      const data: DiagnosisReport = await res.json();
      setReport(data);
      setFlowStep("report");
    } catch (err: unknown) {
      console.error("Diagnosis error:", err);
      setFlowStep("report");
    }
  };

  /* ─── Lead capture ─────────────────────────────────────────────────── */
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email || !report) return;
    setIsSubmittingLead(true);
    try {
      await fetch("/api/assessment/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadForm.name,
          email: leadForm.email,
          company: leadForm.company,
          budget_tier: leadForm.budgetTier,
          industry: answers.industry,
          team_size: answers.teamSize,
          maturity_score: report.maturityScore,
          recommended_products: report.recommendedProducts,
          assessment_payload: {
            ...answers,
            primaryBottleneck: answers.bottlenecks,
            bottlenecks: answers.bottlenecks,
            followUpAnswers: {
              ...selectedProbeAnswers,
              scenarioId: dynamicFollowUp?.scenarioId || "follow_up",
            },
          },
        }),
      });
      setLeadSaved(true);
    } catch (err: unknown) {
      console.error("Lead error:", err);
      setLeadSaved(true);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window === "undefined" || !report) return;
    try {
      const shareData = {
        r: {
          s: report.maturityScore,
          t: report.maturityTier,
          sm: report.summary,
          g: report.keyGaps,
          rp: report.recommendedProducts,
          roi: report.roiEstimate,
          ap: report.immediateActionPlan,
          mc: report.maturityCategories,
          air: report.aiReadiness,
          cn: consultantNotes,
        },
        a: {
          i: answers.industry,
          ts: answers.teamSize,
          ct: answers.currentTools,
          b: answers.bottlenecks,
          po: answers.primaryOutcome,
          c: leadForm.company,
        },
      };
      const jsonStr = JSON.stringify(shareData);
      const b64 = btoa(encodeURIComponent(jsonStr));
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${b64}`;
      navigator.clipboard.writeText(shareUrl);
      window.history.replaceState(null, "", shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {
      console.error("Failed to generate share URL:", err);
    }
  };

  const toggleMilestone = (key: string) => {
    setCompletedMilestones((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClaimGrantScroll = () => {
    setLeadForm((prev) => ({
      ...prev,
      budgetTier: prev.budgetTier || "mdec_grant",
    }));
    const el = document.getElementById("consultation-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Dynamic live ROI calculations for the report sidebar
  const liveRoi = useMemo(() => {
    const baseSavings = report?.roiEstimate?.estimatedAnnualSavingsRM || 24000;
    const baseHours = report?.roiEstimate?.hoursSavedWeekly || 12;

    const sizeMultiplier = Math.max(0.5, interactiveTeamSize / 8);
    const adoptionMultiplier = interactiveAdoptionRate / 100;

    const adjustedAnnualSavingsRM = Math.round(baseSavings * sizeMultiplier * adoptionMultiplier);
    const adjustedWeeklyHours = Math.round(baseHours * sizeMultiplier * adoptionMultiplier);
    const adjustedAnnualHours = adjustedWeeklyHours * 50;

    // Realistic Exabytes stack cost aligned with RoiCalculatorPreview:
    //   Business SSD Hosting: RM 89/mo (fixed)
    //   Google Workspace Business Starter: RM 25/user/mo
    //   Freshsales Growth CRM: RM 55/user/mo (~70% team adoption)
    const hosting = 89;
    const gwsCost = Math.round(interactiveTeamSize * 25);
    const crmCost = Math.round(Math.ceil(interactiveTeamSize * 0.7) * 55);
    const estMonthlyCostRM = Math.min(hosting + gwsCost + crmCost, 5000);
    const netAnnualUpsideRM = adjustedAnnualSavingsRM - estMonthlyCostRM * 12;
    const paybackMonths = Math.max(
      0.9,
      Number(((estMonthlyCostRM * 12) / (adjustedAnnualSavingsRM / 12)).toFixed(1))
    );

    return {
      adjustedAnnualSavingsRM,
      adjustedWeeklyHours,
      adjustedAnnualHours,
      estMonthlyCostRM,
      netAnnualUpsideRM,
      paybackMonths,
    };
  }, [report, interactiveTeamSize, interactiveAdoptionRate]);

  // Product filtering
  const filteredProducts = useMemo(() => {
    if (!report?.recommendedProducts) return [];
    if (productFilter === "all") return report.recommendedProducts;
    return report.recommendedProducts.filter(
      (p) => p.category.toLowerCase().includes(productFilter.toLowerCase())
    );
  }, [report, productFilter]);

  // Roadmap stages breakdown (distinct 3-stage sequential transformation without duplicates)
  const roadmapStages = useMemo(() => {
    if (!report) return [];
    const actions = report.immediateActionPlan || [];
    const products = report.recommendedProducts || [];

    return [
      {
        stage: 1,
        phase: "Phase 1: Quick Wins",
        timeline: "Month 1–3",
        roiHorizon: "ROI: 2–4 weeks",
        title: "Foundation & Quick Wins",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        goal: "Eliminate immediate manual friction and secure enterprise corporate presence.",
        action: actions[0] || "Audit current communication channels and register official corporate domain.",
        keyDeliverable: "Corporate email setup, domain verification & high-performance hosting deployment.",
        product: products[0] || null,
      },
      {
        stage: 2,
        phase: "Phase 2: Productivity",
        timeline: "Month 3–6",
        roiHorizon: "ROI: 3–6 months",
        title: "Sales & Workflow Automation",
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        goal: "Capture 100% of inbound customer inquiries and automate deal follow-ups.",
        action: actions[1] || "Centralize incoming leads from web, WhatsApp, and social channels into CRM.",
        keyDeliverable: "Automated deal pipeline, omnichannel lead capture & instant quotation sequences.",
        product: products[1] || null,
      },
      {
        stage: 3,
        phase: "Phase 3: Growth",
        timeline: "Month 6–12",
        roiHorizon: "ROI: 6–12 months",
        title: "AI-Driven Growth & Resilience",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        goal: "Defend proprietary data against ransomware, deploy AI customer support and claim up to 50% MDEC subsidy.",
        action: actions[2] || "Deploy automated cloud backups and compile invoices for MDEC matching grant claim.",
        keyDeliverable: "Automated ransomware-grade backup retention & MDEC 50% grant claim submission.",
        product: products[2] || products[0] || null,
      },
    ];
  }, [report]);

  /* ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F1F5F9] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] relative pb-20 overflow-x-hidden">
      {/* Ambient background glows (strictly behind content) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* ─── Top Utility / Step Indicator Bar ─────────────────────────── */}
      <div className="border-b border-slate-200/90 bg-white shadow-2xs print:hidden relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Exabytes AI Diagnostic
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[12px] text-slate-500 font-medium">Malaysian SME Advisory</span>
            </div>
            <h1 className="text-lg font-bold text-[#002244] mt-0.5">
              {flowStep === "report" ? "Executive Digital Growth Diagnosis" : "Digital Growth Assessment"}
            </h1>
          </div>

          {/* Progress bar during questions */}
          {flowStep === "questions" && (
            <div className="sm:w-64">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                <span>
                  Question {currentQuestionIdx + 1} of {totalBaseQuestions}
                </span>
                <span>{Math.round(((currentQuestionIdx + 1) / totalBaseQuestions) * 100)}%</span>
              </div>
              <div className="progress-track bg-slate-100">
                <div
                  className="progress-fill bg-blue-600"
                  style={{ width: `${((currentQuestionIdx + 1) / totalBaseQuestions) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Progress bar during AI Consultative Probes */}
          {flowStep === "follow_up" && (
            <div className="sm:w-64">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                <span className="font-semibold text-blue-600">
                  AI Consultation Probe {activeProbeIdx + 1} of 2
                </span>
                <span className="font-semibold text-slate-700">{activeProbeIdx === 0 ? "85%" : "95%"}</span>
              </div>
              <div className="progress-track bg-slate-100">
                <div
                  className="progress-fill bg-blue-600 transition-all duration-300"
                  style={{ width: activeProbeIdx === 0 ? "85%" : "95%" }}
                />
              </div>
            </div>
          )}

          {/* Report Action Buttons in Header */}
          {flowStep === "report" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyShareLink}
                className="btn-secondary !text-[12px] !py-1.5 !px-3 font-medium flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {copiedLink ? "Link Copied!" : "Share Report"}
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary !text-[12px] !py-1.5 !px-3 font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print / Save PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Container: Narrow for Quiz, Expansive (max-w-7xl) for Report ─── */}
      <div className={`relative z-10 ${flowStep === "report" ? "max-w-7xl mx-auto px-4 sm:px-6 py-8" : "max-w-3xl mx-auto px-4 sm:px-6 py-10"}`}>

        {/* ─── Question Steps ────────────────────────────────────────── */}
        {flowStep === "questions" && currentQ && (
          <div className="card p-6 md:p-10 bg-white border border-slate-200/90 shadow-md">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                  Question {currentQ.step} of {totalBaseQuestions}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {currentQuestionIdx === totalBaseQuestions - 1 ? "Final Step Before AI Consultation" : "Malaysian SME Diagnostic"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#002244] leading-snug">
                {currentQ.title}
              </h2>
              <p className="text-[13px] text-slate-500 mt-1">{currentQ.subtitle}</p>
            </div>

            <div className="space-y-2.5">
              {currentQ.options.map((opt) => {
                const isSelected =
                  currentQ.type === "single"
                    ? answers[currentQ.id as keyof typeof answers] === opt.id
                    : answers.currentTools.includes(opt.id);

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${isSelected
                        ? "border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600/30"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                  >
                    <div
                      className={`shrink-0 w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300"
                        }`}
                    >
                      {isSelected && (
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-semibold text-slate-900 block">{opt.label}</span>
                      {opt.description && (
                        <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{opt.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={handleBack}
                disabled={currentQuestionIdx === 0}
                className="btn-secondary !text-[13px] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!isCurrentStepValid()}
                className="btn-primary !text-[13px] font-semibold !px-6 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {currentQuestionIdx === totalBaseQuestions - 1 ? "Analyze Business" : "Continue"}
              </button>
            </div>
          </div>
        )}

        {/* ─── AI Loading (Probing Telemetry Engine) ──────────────────── */}
        {flowStep === "ai_probing" && (
          <div className="loading-overlay fixed inset-0 z-[100] flex items-center justify-center bg-[#001529] overflow-hidden">
            {/* Animated background grid */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            {/* Radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-lg w-full mx-auto px-6 text-center">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/30 text-blue-300 text-[11px] font-bold tracking-widest uppercase mb-8 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                SolverX Advisory Engine · Powered by Google Gemini
              </div>

              {/* Animated orb */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-blue-800" />
                <div className="absolute inset-0 rounded-full border-2 border-blue-400/60 border-t-transparent animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "2s" }} />
                <div className="absolute inset-3 rounded-full bg-blue-900/80 flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Calibrating Consultative Diagnostics
              </h2>
              <p className="text-[14px] text-blue-200/80 max-w-sm mx-auto leading-relaxed mb-8">
                Analyzing your <span className="font-bold text-white">{answers.industry || "SME"}</span> profile against Exabytes solution architecture and Malaysian SME baselines.
              </p>

              {/* Progress steps */}
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 text-left space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${telemetryStage >= 1 ? "bg-emerald-500 text-white" : "bg-white/10 text-white/40"
                    }`}>
                    {telemetryStage >= 1 ? "✓" : "1"}
                  </span>
                  <div className="flex-1">
                    <span className={`text-[13px] font-semibold ${telemetryStage >= 1 ? "text-white" : "text-white/40"}`}>
                      Auditing operational friction &amp; tech stack gaps
                    </span>
                    {telemetryStage >= 1 && <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} /></div>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${telemetryStage >= 2 ? "bg-emerald-500 text-white" : telemetryStage === 1 ? "bg-blue-500 text-white animate-pulse" : "bg-white/10 text-white/40"
                    }`}>
                    {telemetryStage >= 2 ? "✓" : "2"}
                  </span>
                  <div className="flex-1">
                    <span className={`text-[13px] font-semibold ${telemetryStage >= 2 ? "text-white" : telemetryStage === 1 ? "text-blue-300" : "text-white/40"}`}>
                      Benchmarking against Malaysian SME baselines
                    </span>
                    {telemetryStage >= 2 && <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} /></div>}
                    {telemetryStage === 1 && <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-blue-500/60 rounded-full animate-pulse" style={{ width: "60%" }} /></div>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${telemetryStage >= 3 ? "bg-blue-500 text-white animate-pulse" : "bg-white/10 text-white/40"
                    }`}>
                    {telemetryStage >= 3 ? "⚡" : "3"}
                  </span>
                  <div className="flex-1">
                    <span className={`text-[13px] font-semibold ${telemetryStage >= 3 ? "text-blue-300" : "text-white/40"}`}>
                      Formulating targeted consultative probes
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-blue-400/60 mt-6 tracking-wider">
                Official SolverX Advisory Engine · Exabytes Malaysia
              </p>
            </div>
          </div>
        )}



        {/* ─── AI Dynamic Follow-up Question (2 Consultative Probes) ─── */}
        {flowStep === "follow_up" && dynamicFollowUp && (() => {
          const probes =
            dynamicFollowUp.probes && dynamicFollowUp.probes.length > 0
              ? dynamicFollowUp.probes
              : [
                {
                  id: dynamicFollowUp.scenarioId || "probe_1",
                  question: dynamicFollowUp.question,
                  subtitle: dynamicFollowUp.subtitle,
                  options: dynamicFollowUp.options,
                  category: "severity" as const,
                },
              ];

          const safeProbeIdx = Math.min(activeProbeIdx, probes.length - 1);
          const currentProbe = probes[safeProbeIdx] || probes[0];
          const selectedVal = selectedProbeAnswers[currentProbe.id] || currentProbe.options?.[0]?.id;
          const isLastProbe = safeProbeIdx >= probes.length - 1;

          return (
            <div className="card p-6 md:p-10 bg-white border border-blue-200 shadow-lg">
              <div className="mb-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                    <span>✦</span> AI Consultation · Probe {safeProbeIdx + 1} of {probes.length}
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                    {currentProbe.category === "readiness"
                      ? "Grant & Readiness"
                      : "Operational Severity"}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#002244] leading-snug">
                  {currentProbe.question}
                </h2>
                <p className="text-[13px] text-slate-500 mt-1">{currentProbe.subtitle}</p>
              </div>

              <div className="space-y-2.5">
                {currentProbe.options.map((opt) => {
                  const isSelected = selectedVal === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() =>
                        setSelectedProbeAnswers((prev) => ({
                          ...prev,
                          [currentProbe.id]: opt.id,
                        }))
                      }
                      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${isSelected
                          ? "border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600/30"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                    >
                      <div
                        className={`shrink-0 w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300"
                          }`}
                      >
                        {isSelected && (
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="4" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[14px] font-semibold text-slate-900 block">{opt.label}</span>
                        {opt.description && (
                          <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{opt.description}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                {safeProbeIdx > 0 ? (
                  <button
                    onClick={() => setActiveProbeIdx((prev) => prev - 1)}
                    className="btn-secondary !text-[13px]"
                  >
                    ← Previous Probe
                  </button>
                ) : (
                  <button
                    onClick={() => setFlowStep("questions")}
                    className="btn-secondary !text-[13px]"
                  >
                    Back
                  </button>
                )}

                {isLastProbe ? (
                  <button
                    onClick={handleFinishAssessment}
                    className="btn-primary !text-[13px] font-semibold !px-6 shadow-sm flex items-center gap-2"
                  >
                    <span>Synthesize Executive Report</span>
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveProbeIdx((prev) => prev + 1)}
                    className="btn-primary !text-[13px] font-semibold !px-6 shadow-sm flex items-center gap-2"
                  >
                    <span>Continue to Probe 2</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* ─── AI Diagnosing Loading Telemetry ─────────────────────── */}
        {flowStep === "ai_diagnosing" && (
          <div className="loading-overlay fixed inset-0 z-[100] flex items-center justify-center bg-[#001529] overflow-hidden">
            {/* Animated background grid */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            {/* Radial glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-lg w-full mx-auto px-6 text-center">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold tracking-widest uppercase mb-8 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Generating Executive Growth Diagnosis
              </div>

              {/* Animated orb */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-900" />
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/70 border-t-transparent animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "3s" }} />
                <div className="absolute inset-3 rounded-full bg-emerald-900/80 flex items-center justify-center">
                  <svg className="w-7 h-7 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Synthesizing Executive Architecture
              </h2>
              <p className="text-[14px] text-emerald-200/80 max-w-sm mx-auto leading-relaxed mb-8">
                Calculating Digital Maturity Index, RM labour savings, and matching Exabytes solutions to your <span className="font-bold text-white">{answers.industry || "SME"}</span> profile.
              </p>

              {/* Progress steps */}
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 text-left space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${telemetryStage >= 1 ? "bg-emerald-500 text-white" : "bg-white/10 text-white/40"
                    }`}>
                    {telemetryStage >= 1 ? "✓" : "1"}
                  </span>
                  <div className="flex-1">
                    <span className={`text-[13px] font-semibold ${telemetryStage >= 1 ? "text-white" : "text-white/40"}`}>
                      Computing Digital Maturity Score (0–100)
                    </span>
                    {telemetryStage >= 1 && <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} /></div>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${telemetryStage >= 2 ? "bg-emerald-500 text-white" : "bg-emerald-500 text-white animate-pulse"
                    }`}>
                    {telemetryStage >= 2 ? "✓" : "2"}
                  </span>
                  <div className="flex-1">
                    <span className={`text-[13px] font-semibold ${telemetryStage >= 2 ? "text-white" : "text-emerald-300"}`}>
                      Calculating annual labour savings &amp; RM ROI payback
                    </span>
                    {telemetryStage >= 2 && <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} /></div>}
                    {telemetryStage < 2 && <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-emerald-500/70 rounded-full animate-pulse" style={{ width: "55%" }} /></div>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${telemetryStage >= 3 ? "bg-blue-500 text-white animate-pulse" : "bg-white/10 text-white/40"
                    }`}>
                    {telemetryStage >= 3 ? "⚡" : "3"}
                  </span>
                  <div className="flex-1">
                    <span className={`text-[13px] font-semibold ${telemetryStage >= 3 ? "text-blue-300" : "text-white/40"}`}>
                      Assembling 90-day roadmap &amp; Exabytes solution SKUs
                    </span>
                    {telemetryStage >= 3 && <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: "100%" }} /></div>}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-emerald-400/60 mt-6 tracking-wider">
                <a href="https://www.exabytes.my/sme-digital-grant" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 underline underline-offset-2">
                  MDEC SME Digitalization Co-Funding Framework Compatible
                </a>
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ─── EXECUTIVE REPORT DASHBOARD (EXPANSIVE 2-COLUMN LAYOUT) ─── */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {flowStep === "report" && report && (
          <div className="space-y-8">

            {/* ─── Print-Only Proposal Header (Bonus 3: Exabytes Proposal Standard) ─ */}
            <div className="hidden print:block pb-5 mb-5 border-b-2 border-[#002244]">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#002244] text-white flex items-center justify-center font-black text-xs">
                      X
                    </div>
                    <span className="text-xl font-black text-[#002244] tracking-tight">EXABYTES MALAYSIA</span>
                  </div>
                  <p className="text-[12px] font-bold text-blue-700 mt-1 uppercase tracking-wider">
                    Official AI SME Digital Growth Blueprint &amp; Proposal
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Prepared for: <strong className="text-slate-900">{leadForm.company || `${answers.industry} SME`}</strong> · Sector: {answers.industry}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <p className="font-bold text-slate-800">Proposal Ref: EXA-AI-{report.maturityScore}M</p>
                  <p>Generated: {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-emerald-700 font-semibold">MDEC SME Grant Eligible</p>
                </div>
              </div>
            </div>

            {/* ─── Shared Report Notice Banner ───────────────────────── */}
            {isSharedView && (
              <div className="p-4 rounded-2xl bg-blue-50/95 border border-blue-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-blue-900">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping shrink-0" />
                  <span className="text-sm font-semibold">
                    Viewing Shared Executive Digital Growth Diagnosis for{" "}
                    <span className="underline decoration-blue-400 font-bold">
                      {leadForm.company || answers.industry}
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.history.replaceState(null, "", window.location.pathname);
                    }
                    setIsSharedView(false);
                    setFlowStep("questions");
                    setCurrentQuestionIdx(0);
                  }}
                  className="btn-secondary !text-xs !py-1.5 !px-3.5 font-bold !text-blue-700 !bg-white hover:!bg-blue-50 border-blue-200 shrink-0 shadow-2xs"
                >
                  Run New Assessment →
                </button>
              </div>
            )}

            {/* ─── Top Executive Scorecard & Benchmark Banner ─────────── */}
            <div className="card p-6 sm:p-8 bg-white border-t-4 border-t-blue-600 border-x border-b border-slate-200/90 shadow-md rounded-2xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Official AI Growth Report
                    </span>
                    <span className="text-[12px] text-slate-400">·</span>
                    <span className="text-[12px] text-slate-500 font-medium capitalize">
                      {answers.industry} Sector
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002244] tracking-tight">
                    {leadForm.company || `${answers.industry.charAt(0).toUpperCase() + answers.industry.slice(1)} Business`}
                  </h2>
                  <p className="text-[13px] text-slate-500">
                    Team Size: <strong className="text-slate-800">{answers.teamSize} employees</strong> · Core Goal: <strong className="text-slate-800">{answers.primaryOutcome || "Operational Efficiency"}</strong>
                  </p>
                </div>

                {/* Score & Tier Capsule */}
                <div className="flex items-center gap-5 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/90 w-full lg:w-auto shadow-2xs">
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-blue-600 transition-all duration-1000"
                        strokeDasharray={`${report.maturityScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-lg font-extrabold text-[#002244]">
                      {report.maturityScore}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Digital Maturity
                    </span>
                    <span className="text-base font-bold text-[#002244] block">
                      {report.maturityTier}
                    </span>
                    <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">
                      {report.maturityScore >= 70 ? "Advanced Tier" : report.maturityScore >= 45 ? "Developing Tier" : "Emerging Tier"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Malaysian SME Benchmark Bar */}
              <div className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[12px] gap-2 mb-2">
                  <span className="font-semibold text-slate-700">
                    Industry Benchmark Position:
                  </span>
                  <span className="text-slate-500">
                    Your Score: <strong className="text-blue-600">{report.maturityScore}</strong> | Malaysian SME Average: <strong>36</strong> | Top 10% Leaders: <strong>85</strong>
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full relative overflow-hidden flex">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 relative z-10"
                    style={{ width: `${Math.min(100, Math.max(5, report.maturityScore))}%` }}
                  />
                  {/* Marker for SME Average (36%) */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-20"
                    style={{ left: "36%" }}
                    title="Malaysian SME Average (36)"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0 (Ad-hoc Manual)</span>
                  <span className="text-slate-600 font-medium">Avg Malaysian SME (36)</span>
                  <span>100 (Fully Automated AI Cloud)</span>
                </div>
              </div>

              {/* NEW: Per-Category Maturity Breakdown */}
              {report.maturityCategories && (
                <div className="pt-6 mt-6 border-t border-slate-200">
                  <h4 className="text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-4">
                    Dimension Breakdown
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(report.maturityCategories).map(([key, value]) => {
                      const labelMap: Record<string, string> = {
                        website: "Website",
                        cloud: "Cloud",
                        crm: "CRM",
                        marketing: "Marketing",
                        cybersecurity: "Cybersecurity",
                        aiAdoption: "AI Adoption",
                      };
                      const score = Math.min(5, Math.max(1, Math.round(Number(value)) || 1));
                      const stars = Array(5).fill(0).map((_, i) => (i < score ? "★" : "☆")).join("");
                      return (
                        <div key={key} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-semibold text-slate-900">{labelMap[key] || key}</span>
                            <span className="text-[10.5px] font-bold text-slate-400">{score}/5</span>
                          </div>
                          <span className="text-[14px] text-amber-500 tracking-widest">{stars}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ─── 2-Column Dashboard Grid ────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

              {/* ─── Left / Main Column (2/3 width) ───────────────────── */}
              <div className="lg:col-span-2 space-y-8">

                {/* 1. Executive Summary & Gaps */}
                <div className="card p-6 sm:p-7 bg-white border border-slate-200/90 shadow-sm rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-1.5 rounded-md bg-blue-50 text-blue-700">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <h3 className="text-base font-bold text-[#002244]">Executive AI Synthesis</h3>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 mb-6">
                    <p className="text-[13.5px] text-slate-700 leading-relaxed font-normal">
                      {report.summary}
                    </p>
                  </div>

                  {/* Step 4: Business Pain Point Analysis (Exact match to Challenge Step 4) */}
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                            Pain Point Analysis
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium capitalize">{answers.industry} Sector</span>
                        </div>
                        <h4 className="text-base font-bold text-[#002244] mt-1">
                          Top {report.keyGaps.length} Operational Bottlenecks
                        </h4>
                      </div>

                    </div>

                    <div className="space-y-2.5">
                      {report.keyGaps.map((gap, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all flex items-start gap-3.5 group"
                        >
                          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center text-[11px] font-black">
                              ✓
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 w-4 text-center">
                              {i + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-slate-800 font-medium leading-snug">
                              {gap}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 shrink-0 hidden sm:inline-block">
                            Bottleneck #{i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Readiness Score Panel */}
                {report.aiReadiness && (
                  <div className="card p-6 sm:p-7 bg-white border border-slate-200/90 shadow-sm rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                          AI Readiness Diagnostic
                        </span>
                        <h3 className="text-lg font-bold text-[#002244]">
                          AI Readiness Score
                        </h3>
                        <p className="text-[12.5px] text-slate-500 mt-0.5">
                          Evaluation of your foundational capability to deploy AI effectively.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(report.aiReadiness).map(([key, value]) => {
                        const labelMap: Record<string, string> = {
                          leadership: "Leadership Alignment",
                          dataAvailability: "Data Availability",
                          employeeSkills: "Employee Skills",
                          digitalWorkflow: "Digital Workflow",
                          processMaturity: "Process Maturity",
                        };
                        const score = Math.min(5, Math.max(1, Math.round(Number(value)) || 1));
                        const percentage = (score / 5) * 100;
                        return (
                          <div key={key}>
                            <div className="flex justify-between items-center text-[12px] mb-1">
                              <span className="font-semibold text-slate-700">{labelMap[key] || key}</span>
                              <span className="text-slate-500 font-medium">{score}/5</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Interactive Sequential 90-Day Transformation Roadmap (Zero Duplication) */}
                <div className="card p-6 sm:p-7 bg-white border border-slate-200/90 shadow-sm rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                        Sequential Implementation Pipeline
                      </span>
                      <h3 className="text-lg font-bold text-[#002244]">
                        90-Day Digital Transformation Roadmap
                      </h3>
                      <p className="text-[12.5px] text-slate-500 mt-0.5">
                        Each phase solves a specific operational hurdle with its dedicated Exabytes cloud tool.
                      </p>
                    </div>
                    <span className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-semibold shrink-0 flex items-center gap-1">
                      <span>✓</span> Interactive Milestone Tracker
                    </span>
                  </div>

                  {/* 3 Sequential Stages */}
                  <div className="space-y-4">
                    {roadmapStages.map((stage) => {
                      const task1Key = `stage-${stage.stage}-task-1`;
                      const task2Key = `stage-${stage.stage}-task-2`;
                      const isTask1Done = Boolean(completedMilestones[task1Key]);
                      const isTask2Done = Boolean(completedMilestones[task2Key]);

                      const borderAccent =
                        stage.stage === 1
                          ? "border-l-4 border-l-blue-600"
                          : stage.stage === 2
                            ? "border-l-4 border-l-indigo-600"
                            : "border-l-4 border-l-emerald-600";

                      return (
                        <div
                          key={stage.stage}
                          className={`p-5 rounded-xl border border-slate-200/90 bg-white ${borderAccent} hover:border-slate-300 transition-all shadow-xs`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-[#002244] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                                {stage.stage}
                              </span>
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wide ${stage.badgeColor}`}>
                                {stage.phase}
                              </span>
                              <h4 className="font-bold text-slate-900 text-[15px]">
                                {stage.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                {stage.timeline}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${stage.stage === 1 ? "bg-blue-50 text-blue-700 border-blue-200" :
                                  stage.stage === 2 ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                    "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}>
                                {stage.roiHorizon}
                              </span>
                            </div>
                          </div>

                          <p className="text-[12.5px] text-slate-600 mb-4 pl-8">
                            <strong className="text-slate-800 font-semibold">Goal:</strong> {stage.goal}
                          </p>

                          {/* Action Tasks with Checkboxes */}
                          <div className="space-y-2.5 pl-8 mb-4">
                            <div
                              onClick={() => toggleMilestone(task1Key)}
                              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${isTask1Done ? "bg-emerald-50/70 border-emerald-300" : "bg-slate-50/70 border-slate-200"
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={isTask1Done}
                                onChange={() => toggleMilestone(task1Key)}
                                className="mt-0.5 w-4 h-4 text-blue-600 rounded accent-blue-600 cursor-pointer"
                              />
                              <div className="flex-1 text-[12.5px]">
                                <span className={isTask1Done ? "text-emerald-900 line-through" : "text-slate-800 font-medium"}>
                                  {stage.action}
                                </span>
                              </div>
                            </div>

                            <div
                              onClick={() => toggleMilestone(task2Key)}
                              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${isTask2Done ? "bg-emerald-50/70 border-emerald-300" : "bg-slate-50/70 border-slate-200"
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={isTask2Done}
                                onChange={() => toggleMilestone(task2Key)}
                                className="mt-0.5 w-4 h-4 text-blue-600 rounded accent-blue-600 cursor-pointer"
                              />
                              <div className="flex-1 text-[12.5px]">
                                <span className={isTask2Done ? "text-emerald-900 line-through" : "text-slate-800 font-medium"}>
                                  {stage.keyDeliverable}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Linked Exabytes Solution SKU for High Sales Conversion */}
                          {stage.product && (
                            <div className="ml-8 p-3 rounded-lg bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="text-[12px]">
                                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                                  Required Exabytes Solution:
                                </span>
                                <span className="font-bold text-slate-900">{stage.product.name}</span>
                                <span className="text-slate-500 ml-2">({stage.product.startingPrice})</span>
                              </div>
                              <a
                                href={stage.product.productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary !py-1.5 !px-3 !text-[11px] font-semibold shrink-0"
                              >
                                Deploy Tool →
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Recommended All-In-One Exabytes Transformation Bundle (Sales Maximizer) */}
                <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#002244] via-[#082b54] to-[#0052cc] text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-400/20 text-blue-200 text-[11px] font-bold uppercase tracking-wider border border-blue-400/30">
                        Official Recommended SME Bundle
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        Exabytes All-in-One Digital Growth Stack
                      </h3>
                      <p className="text-[13px] text-blue-100 leading-relaxed">
                        Deploy your complete 90-day roadmap under one unified Exabytes account: Business Hosting + Freshsales CRM + Acronis Protection.
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[12px] text-blue-200 pt-1">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Up to 50% MDEC Grant Match
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          24/7/365 Local Support
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col sm:items-end gap-2.5">
                      <a
                        href="#consultation-form"
                        className="btn-primary !bg-white !text-[#002244] hover:!bg-blue-50 !py-3 !px-5 !text-[13px] font-bold shadow-md text-center"
                      >
                        Claim SME Package with Advisor →
                      </a>
                      <a
                        href="https://wa.me/60163351988?text=Hello%20Exabytes%2C%20I%20just%20completed%20the%20SolverX%20digital%20assessment%20and%20would%20like%20to%20consult%20about%20the%20recommended%20growth%20stack."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 text-[12px] text-emerald-300 hover:text-emerald-200 font-semibold"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Chat on WhatsApp (+60 16-335 1988)
                      </a>
                    </div>
                  </div>
                </div>

                {/* 4. Recommended Exabytes Solutions with Category Filters */}
                <div className="card p-6 sm:p-7 bg-white border border-slate-200/90 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                        Matched Architecture
                      </span>
                      <h3 className="text-lg font-bold text-[#002244]">
                        Recommended Individual Products
                      </h3>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "all", label: "All Products" },
                        { id: "hosting", label: "Cloud & Hosting" },
                        { id: "crm", label: "CRM & Sales" },
                        { id: "security", label: "Cybersecurity" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setProductFilter(tab.id)}
                          className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${productFilter === tab.id
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {filteredProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="rounded-2xl border border-slate-200/90 bg-white flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all shadow-xs overflow-hidden"
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                              {prod.category}
                            </span>
                            <span className="text-[12px] font-bold text-slate-900 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded">
                              {prod.startingPrice}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-[#002244] mt-1 mb-1">
                            {prod.name}
                          </h4>
                          <p className="text-[12px] text-slate-500 mb-3 leading-relaxed">
                            {prod.tagline}
                          </p>

                          {/* Why this fits */}
                          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100/90 text-[12px] text-slate-800 mb-3 leading-relaxed">
                            <strong className="text-blue-900 block mb-0.5">✦ Why Gemini Recommended This:</strong>
                            {prod.whyThisFitsYou}
                          </div>

                          <ul className="space-y-1.5 mb-4 text-[12px] text-slate-600">
                            {prod.features.slice(0, 3).map((feat, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-5 pt-0">
                          <a
                            href={prod.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary !w-full !text-[12px] !py-2.5 font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            Deploy on Exabytes.my
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Consultant Notes & Strategic Advisory */}
                <div id="consultant-notes" className="card p-6 sm:p-7 bg-white border border-slate-200/90 shadow-sm rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          Consultant Proposal Addendum
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">Exabytes Certified Advisor</span>
                      </div>
                      <h3 className="text-lg font-bold text-[#002244] mt-1">
                        Executive Consultant Notes &amp; Advisory Strategy
                      </h3>
                      <p className="text-[12.5px] text-slate-500">
                        Tailored strategic notes to guide your sales advisor meeting or MDEC grant application.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 print:hidden">
                      <button
                        type="button"
                        onClick={() => setIsEditingNotes(!isEditingNotes)}
                        className="btn-secondary !text-xs !py-1.5 !px-3 font-semibold flex items-center gap-1.5"
                      >
                        {isEditingNotes ? "Done Editing ✓" : "Edit Notes ✏️"}
                      </button>
                    </div>
                  </div>

                  {/* Preset quick buttons for rapid consultant note entry (hidden in print) */}
                  <div className="mb-3 flex flex-wrap items-center gap-2 print:hidden">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Quick Add:</span>
                    <button
                      type="button"
                      onClick={() => setConsultantNotes((prev) => prev + "\n• Approved for 50% MDEC SME Digitalization Co-Funding Grant matching on cloud setup.")}
                      className="text-[11px] font-medium text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md transition-colors"
                    >
                      + MDEC Grant Match
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultantNotes((prev) => prev + "\n• Urgently migrate customer chats from personal WhatsApp to Lark/Freshchat to prevent lead loss.")}
                      className="text-[11px] font-medium text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md transition-colors"
                    >
                      + WhatsApp SLA Fix
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultantNotes((prev) => prev + "\n• 14-day onboarding recommended for Phase 1 quick wins (Business Email & Cloud Backup).")}
                      className="text-[11px] font-medium text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md transition-colors"
                    >
                      + 14-Day Pilot Plan
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultantNotes(DEFAULT_CONSULTANT_NOTES)}
                      className="text-[11px] font-medium text-slate-500 hover:text-slate-800 underline ml-auto"
                    >
                      Reset Default
                    </button>
                  </div>

                  {/* Screen Edit Mode vs Display Mode */}
                  {isEditingNotes ? (
                    <div className="space-y-2 print:hidden">
                      <textarea
                        value={consultantNotes}
                        onChange={(e) => setConsultantNotes(e.target.value)}
                        rows={5}
                        className="w-full text-[13px] text-slate-800 p-3.5 rounded-xl border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none leading-relaxed font-sans"
                        placeholder="Add custom consultant advice, grant references, or implementation caveats..."
                      />
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>Notes automatically update in the PDF export and share link.</span>
                        <span>{consultantNotes.length} chars</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsEditingNotes(true)}
                      className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 cursor-pointer hover:border-blue-300 transition-colors group relative print:hidden"
                      title="Click to edit consultant notes"
                    >
                      <p className="text-[13px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {consultantNotes}
                      </p>
                      <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Click anywhere to edit ✏️
                      </span>
                    </div>
                  )}

                  {/* Print Document View (Always clean and visible during PDF print) */}
                  <div className="hidden print:block p-4 rounded-xl border-l-4 border-l-blue-600 bg-slate-50 text-[12.5px] text-slate-800">
                    <p className="whitespace-pre-wrap leading-relaxed font-sans">
                      {consultantNotes}
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                      <span>Verified: Exabytes SME Digital Growth Advisory</span>
                      <span>Status: Official Client Proposal Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Right / Strategic Sidebar (1/3 width) ──────────── */}
              <div className="space-y-6">

                {/* 1. Live Interactive ROI Widget (High-Contrast Navy Card, NO White Override) */}
                <div className="p-6 rounded-2xl bg-[#002244] text-white shadow-xl border border-blue-900 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-blue-800 pb-3 mb-4">
                    <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
                      Interactive ROI Simulator
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded font-bold">
                      ~{liveRoi.paybackMonths} Mo. Payback
                    </span>
                  </div>

                  <div className="mb-5">
                    <span className="text-[12px] text-slate-300 block font-medium">Projected Net 1-Year Upside</span>
                    <div className="text-3xl font-black text-white tracking-tight mt-0.5">
                      RM {liveRoi.netAnnualUpsideRM.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-blue-200 block mt-0.5">
                      Est. monthly investment: ~RM {liveRoi.estMonthlyCostRM}/mo
                    </span>
                  </div>

                  {/* Interactive Sliders */}
                  <div className="space-y-4 pt-3 border-t border-blue-800 mb-5">
                    <div>
                      <div className="flex justify-between items-center text-[12px] text-slate-200 mb-1.5">
                        <label htmlFor="team-size-report-slider" className="font-semibold text-white">Simulate Team Scale:</label>
                        <span className="font-bold text-cyan-300 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                          {interactiveTeamSize} pax
                        </span>
                      </div>
                      <input
                        id="team-size-report-slider"
                        aria-label="Simulate Team Scale"
                        type="range"
                        min="2"
                        max="40"
                        value={interactiveTeamSize}
                        onChange={(e) => setInteractiveTeamSize(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[12px] text-slate-200 mb-1.5">
                        <label htmlFor="adoption-rate-report-slider" className="font-semibold text-white">Adoption Depth:</label>
                        <span className="font-bold text-cyan-300 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                          {interactiveAdoptionRate}%
                        </span>
                      </div>
                      <input
                        id="adoption-rate-report-slider"
                        aria-label="Adoption Depth"
                        type="range"
                        min="40"
                        max="100"
                        step="10"
                        value={interactiveAdoptionRate}
                        onChange={(e) => setInteractiveAdoptionRate(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                      />
                    </div>
                  </div>

                  {/* Key Impact Stats */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-blue-800 text-[11px]">
                    <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                      <span className="text-slate-300 block">Weekly Hours Reclaimed</span>
                      <strong className="text-white text-[15px] font-black block mt-0.5">
                        {liveRoi.adjustedWeeklyHours} hrs/wk
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                      <span className="text-slate-300 block">Annual Time Saved</span>
                      <strong className="text-white text-[15px] font-black block mt-0.5">
                        ~{liveRoi.adjustedAnnualHours.toLocaleString()} hrs/yr
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 2. MDEC Malaysia Digital Grant Card */}
                <div className="card p-5 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 border border-blue-200/90 shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <h4 className="text-[13px] font-bold text-slate-900 uppercase tracking-wide">
                      MDEC SME Digitalisation Initiative (SDI)
                    </h4>
                  </div>
                  <p className="text-[12.5px] text-slate-600 leading-relaxed mb-3">
                    As an eligible Malaysian SME, your business may qualify for up to <strong>50% matching grant</strong> on Exabytes Cloud, CRM, and cybersecurity implementations — subject to SME eligibility criteria and current programme allocation. Applications are submitted through an authorised Digitalisation Partner (DP) like Exabytes.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-blue-100/80">
                    <button
                      type="button"
                      onClick={handleClaimGrantScroll}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold transition-all shadow-xs"
                    >
                      <span>Claim 50% Grant via Exabytes</span>
                      <span className="text-[13px]">↓</span>
                    </button>
                    <a
                      href="https://mdec.my"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11.5px] font-medium text-slate-500 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      Official MDEC Portal (mdec.my)
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* 3. Lead Capture & Advisor Handover (ID anchor for smooth scroll) */}
                <div id="consultation-form" className="card p-6 bg-white border border-slate-200/90 shadow-sm print:hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="text-base font-bold text-[#002244]">
                      Free Consultation Request
                    </h4>
                  </div>
                  <p className="text-[12px] text-slate-500 mb-4 leading-relaxed">
                    An assigned Exabytes specialist will review your blueprint and contact you within 24 hours.
                  </p>

                  {leadSaved ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[13px] text-emerald-900 font-medium space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <span>✓</span> Consultation Request Logged
                      </div>
                      <p className="text-[12px] text-emerald-700">
                        An Exabytes SME Growth Advisor will contact you at <strong>{leadForm.email}</strong> within 24 hours — pre-briefed with your full diagnostic.
                      </p>
                      <div className="mt-2 pt-2 border-t border-emerald-200 flex items-center gap-2 text-[11px] text-emerald-600">
                        <span>📋</span>
                        <span>Advisor pre-briefed: Industry, score, pain points & matched solutions.</span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitLead} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={leadForm.name}
                          onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                          placeholder="e.g. Tan Wei Ming"
                          className="input !py-2 !text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={leadForm.email}
                          onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                          placeholder="name@company.com.my"
                          className="input !py-2 !text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={leadForm.company}
                          onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                          placeholder="e.g. Apex Global Sdn Bhd"
                          className="input !py-2 !text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
                          Monthly Investment Budget *
                        </label>
                        <select
                          required
                          value={leadForm.budgetTier}
                          onChange={(e) => setLeadForm({ ...leadForm, budgetTier: e.target.value })}
                          className="input !py-2 !text-[13px]"
                        >
                          <option value="">Select budget range…</option>
                          <option value="under_500">Below RM 500 / month</option>
                          <option value="500_2000">RM 500 – RM 2,000 / month</option>
                          <option value="above_2000">RM 2,000+ / month</option>
                          <option value="mdec_grant">Applying for 50% MDEC SME Grant</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingLead}
                        className="btn-primary !w-full !py-3 !text-[13px] font-bold shadow-sm mt-2 flex items-center justify-center gap-2"
                      >
                        {isSubmittingLead ? (
                          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
                        ) : (
                          <>I Would Like a Free Consultation →</>
                        )}
                      </button>
                    </form>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[12px]">
                    <button
                      onClick={() => {
                        setFlowStep("questions");
                        setCurrentQuestionIdx(0);
                      }}
                      className="text-slate-500 hover:text-slate-800 font-medium transition-colors"
                    >
                      ← Retake Diagnostic
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Print PDF
                    </button>
                  </div>
                </div>

                {/* 4. Exabytes Official Support Line */}
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center text-[12px] text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-800 block">Exabytes SME Sales Hotline:</span>
                  <p className="text-slate-700 font-medium">+604-609 7888 / 1300-888-392</p>
                  <p className="text-[11px] text-slate-400">24/7/365 Local Technical Support</p>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
