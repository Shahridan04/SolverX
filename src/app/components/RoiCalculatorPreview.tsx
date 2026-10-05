"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export default function RoiCalculatorPreview() {
  const [teamSize, setTeamSize] = useState<number>(8);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(80000); // RM 80k

  // Calculations calibrated for Malaysian SMEs (Exabytes stack, MDEC SME Digitalisation Initiative benchmarks)
  const calculations = useMemo(() => {
    // ~3.5 hrs/week manual inefficiency per employee — within McKinsey / SME Corp MY 2–5 hr range
    const hoursSavedPerEmployeeWeekly = 3.5;
    const totalWeeklyHoursSaved = Math.round(teamSize * hoursSavedPerEmployeeWeekly);
    const totalAnnualHoursSaved = totalWeeklyHoursSaved * 50;

    // Blended SME employee cost ~RM 22/hr (≈ RM 3,800/mo ÷ 176 hrs), conservative for KL/PJ market
    const annualLaborSavingsRM = Math.round(totalAnnualHoursSaved * 22);

    // CRM + web uplift: 2.4% of ARR — mid-range of 1.5%–5% per Salesforce/HubSpot studies
    const annualRevenueGrowthRM = Math.round((monthlyRevenue * 12) * 0.024);

    const totalAnnualEconomicImpactRM = annualLaborSavingsRM + annualRevenueGrowthRM;

    // Realistic Exabytes digital stack (subject to eligibility for MDEC 50% co-funding):
    //   Business SSD Hosting: RM 89/mo
    //   Google Workspace Business Starter: RM 25/user/mo
    //   Freshsales Growth CRM: RM 55/user/mo (≈ USD 15 at current rate)
    const hosting = 89;
    const gwsPerSeat = 25;       // GWS Business Starter
    const crmPerSeat = 55;       // Freshsales Growth
    // Note: typically 60–70% of team uses CRM; full team uses GWS
    const gwsCost = Math.round(teamSize * gwsPerSeat);
    const crmCost = Math.round(Math.ceil(teamSize * 0.7) * crmPerSeat);
    const estimatedMonthlyInvestmentRM = Math.min(
      hosting + gwsCost + crmCost,
      5000  // practical ceiling for teams up to ~80 pax
    );

    const netAnnualGainRM = totalAnnualEconomicImpactRM - (estimatedMonthlyInvestmentRM * 12);
    const paybackMonths = Math.max(
      0.8,
      Number(((estimatedMonthlyInvestmentRM * 12) / (totalAnnualEconomicImpactRM / 12)).toFixed(1))
    );

    return {
      totalWeeklyHoursSaved,
      totalAnnualHoursSaved,
      annualLaborSavingsRM,
      annualRevenueGrowthRM,
      totalAnnualEconomicImpactRM,
      estimatedMonthlyInvestmentRM,
      netAnnualGainRM,
      paybackMonths,
    };
  }, [teamSize, monthlyRevenue]);

  return (
    <div className="card p-6 sm:p-8 bg-white border border-slate-200/90 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Sliders Input Area */}
        <div className="lg:w-1/2 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-2">
              Interactive ROI Simulator
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Calculate Your Digital Growth Upside
            </h3>
            <p className="text-[13px] text-slate-500 mt-1">
              Adjust your business metrics to preview estimated annual gains with Exabytes digital solutions.
            </p>
          </div>

          {/* Slider 1: Team Size */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[13px]">
              <label htmlFor="team-size-slider" className="font-semibold text-slate-800">Team Size (Full-time employees)</label>
              <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200/80">
                {teamSize} {teamSize === 1 ? "person" : "people"}
              </span>
            </div>
            <input
              id="team-size-slider"
              aria-label="Team Size (Full-time employees)"
              type="range"
              min="1"
              max="50"
              step="1"
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Solo (1)</span>
              <span>Micro (10)</span>
              <span>SME (30)</span>
              <span>Growth (50)</span>
            </div>
          </div>

          {/* Slider 2: Monthly Revenue */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[13px]">
              <label htmlFor="monthly-revenue-slider" className="font-semibold text-slate-800">Average Monthly Turnover</label>
              <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200/80">
                RM {monthlyRevenue.toLocaleString()} / mo
              </span>
            </div>
            <input
              id="monthly-revenue-slider"
              aria-label="Average Monthly Turnover"
              type="range"
              min="10000"
              max="500000"
              step="5000"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>RM 10k</span>
              <span>RM 150k</span>
              <span>RM 300k</span>
              <span>RM 500k</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[12px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              MDEC SME Digitalisation Initiative (SDI) Co-Funding:
            </div>
            <p className="text-slate-500 leading-normal">
              Eligible Malaysian SMEs may qualify for up to 50% matching grant on Exabytes approved digital solutions — subject to SME eligibility criteria and current programme allocation.
            </p>
          </div>
        </div>

        {/* Results Card Output Area */}
        <div className="lg:w-1/2 flex flex-col justify-between p-6 rounded-xl bg-gradient-to-br from-[#002244] to-[#0A3366] text-white shadow-md">
          <div>
            <div className="flex items-center justify-between border-b border-blue-400/20 pb-4 mb-4">
              <span className="text-[12px] uppercase tracking-wider text-blue-200 font-semibold">
                Projected Annual Impact
              </span>
              <span className="text-[11px] text-emerald-300 font-medium bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                ~{calculations.paybackMonths} Mo. Payback
              </span>
            </div>

            <div className="mb-6">
              <span className="text-xs text-blue-200">Total Net 1-Year Projected Value</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-0.5">
                RM {calculations.netAnnualGainRM.toLocaleString()}
              </div>
              <p className="text-[12px] text-blue-200/80 mt-1">
                Net value after estimated Exabytes solution costs (~RM {calculations.estimatedMonthlyInvestmentRM}/mo)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
                <span className="text-[11px] text-blue-200 block">Staff Time Reclaimed</span>
                <span className="text-lg font-bold text-white mt-0.5 block">
                  {calculations.totalWeeklyHoursSaved} hrs/wk
                </span>
                <span className="text-[10px] text-blue-300 block mt-0.5">
                  ~{calculations.totalAnnualHoursSaved.toLocaleString()} hrs/year
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
                <span className="text-[11px] text-blue-200 block">Labor Waste Reduction</span>
                <span className="text-lg font-bold text-white mt-0.5 block">
                  RM {calculations.annualLaborSavingsRM.toLocaleString()}
                </span>
                <span className="text-[10px] text-blue-300 block mt-0.5">
                  Automated operations
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/assessment"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-semibold text-[13px] transition-all shadow-md hover:shadow-blue-500/30"
            >
              Get Exact Personalized AI Diagnosis
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="text-center text-[11px] text-blue-300/70 mt-2">
              Takes ~3 minutes · Zero commitment · AI-generated report
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
