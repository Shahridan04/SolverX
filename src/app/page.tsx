import Link from "next/link";
import RoiCalculatorPreview from "./components/RoiCalculatorPreview";

const ECOSYSTEM_PILLARS = [
  {
    category: "Foundation",
    title: "Cloud & Web Presence",
    description:
      "Enterprise cPanel AI Hosting, SSD VPS, and official .MY domains backed by 99.9% uptime SLA.",
    products: ["cPanel AI Hosting", "Business Web Hosting", ".MY Domains", "BuyDirect"],
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
  {
    category: "Operations",
    title: "Productivity & Collaboration",
    description:
      "Custom business email and Google Workspace / Lark integrations eliminating siloed spreadsheets and communication chaos.",
    products: ["Google Workspace", "Business Email", "Lark Enterprise", "Cloud Backup"],
    icon: (
      <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    category: "Revenue",
    title: "Sales & Customer Retention",
    description:
      "Freshsales CRM and omnichannel chat to capture 100% of inbound leads, prevent forgotten WhatsApp follow-ups, and accelerate deals.",
    products: ["Freshsales CRM", "Omnichannel Live Chat", "Freshdesk", "Automated Sequences"],
    icon: (
      <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    category: "Resilience",
    title: "Cybersecurity & Data Protection",
    description:
      "Ransomware defense, Acronis automated cloud backups, SSL, and DDoS mitigation safeguarding critical business data.",
    products: ["Acronis Cyber Protect", "Cloudflare Pro", "Enterprise SSL", "Sucuri Security"],
    icon: (
      <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const COMPARISON_ROWS = [
  {
    criteria: "Cost to SME",
    solverx: "100% Free & Open Access",
    consultants: "RM 10,000 – RM 25,000+",
    genericAi: "RM 90/mo subscription",
  },
  {
    criteria: "Turnaround Time",
    solverx: "3 Minutes (Instant AI report)",
    consultants: "3 to 6 Weeks of meetings",
    genericAi: "Instant, but unstructured",
  },
  {
    criteria: "Tailored to Malaysia",
    solverx: "Malaysian SME context & MYR pricing",
    consultants: "Varies; high consultant bias",
    genericAi: "Generic US enterprise focus",
  },
  {
    criteria: "Actionable Product Mapping",
    solverx: "Directly mapped to verified Exabytes tools",
    consultants: "Vague high-level slide decks",
    genericAi: "Hallucinates random SaaS tools",
  },
  {
    criteria: "Financial ROI Model",
    solverx: "Quantified labor hours & ringgit savings",
    consultants: "Complex manual spreadsheets",
    genericAi: "No localized formulas",
  },
  {
    criteria: "Gov Grant Compatibility",
    solverx: "Pre-screened for MDEC Matching Grant",
    consultants: "Extra fee for grant paperwork",
    genericAi: "Zero grant awareness",
  },
];

const CASE_STUDIES = [
  {
    business: "Klang Valley Wholesale & Logistics",
    size: "18 Employees",
    beforeScore: 34,
    afterScore: 82,
    result: "RM 42,000 Annual Savings",
    quote:
      "SolverX identified that we were losing 20+ hours every week juggling inventory in WhatsApp and disparate spreadsheets. Freshsales CRM and Business Email transformed our operation.",
  },
  {
    business: "Penang F&B & Artisan Bakery Chain",
    size: "9 Employees",
    beforeScore: 28,
    afterScore: 78,
    result: "35% Inbound Inquiry Uplift",
    quote:
      "Instead of paying RM 15k to an agency, SolverX gave us an exact 30-day plan. Setting up BuyDirect and automated lead sequences doubled our corporate catering orders.",
  },
  {
    business: "Kuala Lumpur Engineering Consultancy",
    size: "24 Employees",
    beforeScore: 42,
    afterScore: 89,
    result: "100% Ransomware Resilience",
    quote:
      "The diagnostic flagged severe gaps in our data backup protocol. Acronis Cyber Protect gave our clients confidence that our proprietary CAD designs are strictly secured.",
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-grid-pattern border-b border-slate-200/90 pt-6 pb-20 overflow-hidden">
        <div className="hero-glow" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center w-full">
          {/* Top Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 bg-white/90 backdrop-blur-md text-blue-900 text-[12px] font-semibold mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>AI Horizon Solution Challenge 2026 · Exabytes Track</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-normal">Powered by Google Gemini</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#002244] leading-[1.12] tracking-tight">
            The Autonomous AI Advisor That Powers{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Malaysian SME Digital Growth
            </span>
          </h1>

          {/* Official Challenge Tagline */}
          <p className="mt-4 text-[15px] sm:text-base font-semibold text-blue-700 tracking-wide">
            &quot;Helping SMEs Discover Their Next Digital Step&quot;
          </p>

          <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Stop guessing which software your business needs. In just 3 minutes, SolverX diagnoses your digital bottlenecks, calculates your projected ROI in Ringgit, and delivers an execution-ready Exabytes solution roadmap.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/assessment"
              className="btn-primary !text-[15px] !px-8 !py-4 font-semibold shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
            >
              Start Free SME Assessment
              <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="#roi-calculator"
              className="btn-secondary !text-[14px] !px-6 !py-4 font-medium bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900"
            >
              Simulate ROI First
              <svg className="w-4 h-4 ml-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-16 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#002244]">160,000+</p>
              <p className="text-[12px] text-slate-500 mt-0.5">SMEs Powered by Exabytes in SEA</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">&lt; 3 Mins</p>
              <p className="text-[12px] text-slate-500 mt-0.5">Dynamic Gemini AI Diagnostic</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#002244]">RM 43,200</p>
              <p className="text-[12px] text-slate-500 mt-0.5">Avg. Projected Annual SME Upside</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600">50% Grant</p>
              <p className="text-[12px] text-slate-500 mt-0.5">MDEC Matching Grant Compatibility</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive ROI Simulator ───────────────────────────────── */}
      <section id="roi-calculator" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[12px] font-semibold mb-3">
            Real SME Economic Models
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#002244] tracking-tight">
            See What Digital Transformation Yields
          </h2>
          <p className="text-slate-600 text-[14px] mt-2">
            Calculate estimated annual cost recovery and revenue unlocked before completing the AI diagnostic.
          </p>
        </div>

        <RoiCalculatorPreview />
      </section>

      {/* ─── How It Works ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-slate-50/80 border-y border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="tag mb-3 font-semibold">Step-by-step Methodology</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#002244] tracking-tight">
              From Diagnostic to Deployment in 3 Steps
            </h2>
            <p className="text-slate-600 text-[14px] mt-2">
              Unlike generic AI chatbots, SolverX uses live Gemini reasoning to generate consultative probes tailored to your exact industry — then synthesises a full executive report in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-7 bg-white relative">
              <div className="w-10 h-10 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center font-bold text-lg mb-5">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">5 Smart Baseline Questions</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Tell us your industry, team size, current tools, biggest operational bottleneck, and 6-month growth goal. Takes under 90 seconds.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-blue-600 font-medium">
                ⏱ Under 90 seconds
              </div>
            </div>

            <div className="card p-7 bg-white relative border-blue-300 shadow-md">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-5 shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Gemini AI Consultative Probes</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Google Gemini analyses your answers and generates 2 targeted diagnostic probes — calibrating operational severity and your MDEC grant readiness — specific to your industry.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-emerald-600 font-medium">
                🤖 Live Gemini reasoning · ~3 min total
              </div>
            </div>

            <div className="card p-7 bg-white relative">
              <div className="w-10 h-10 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center font-bold text-lg mb-5">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Executive Growth Report</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Receive your Digital Maturity Score, AI Readiness breakdown, RM ROI estimate, 90-day Exabytes roadmap, and a print-ready consultant proposal.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-blue-600 font-medium">
                📄 Print · Share link · Claim MDEC Grant
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Exabytes Ecosystem Architecture ─────────────────────────── */}
      <section id="ecosystem" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[12px] font-semibold mb-3">
            Exabytes Official Stack
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#002244] tracking-tight">
            Integrated Solutions Built for SEA Businesses
          </h2>
          <p className="text-slate-600 text-[14px] mt-2">
            Every recommendation is grounded in real, battle-tested Exabytes products with 24/7/365 local Malaysian support.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ECOSYSTEM_PILLARS.map((pillar, i) => (
            <div key={i} className="card card-hover p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="p-3 w-fit rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
                  {pillar.icon}
                </div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  {pillar.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">
                  {pillar.title}
                </h3>
                <p className="text-[13px] text-slate-600 leading-relaxed mb-4">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Featured Products
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pillar.products.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Competitive Advantage Matrix ────────────────────────────── */}
      <section id="comparison" className="py-20 bg-white border-y border-slate-200/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="tag mb-3 font-semibold">Competitive Benchmark</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#002244] tracking-tight">
              Why SolverX Outperforms Alternatives
            </h2>
            <p className="text-slate-600 text-[14px] mt-2">
              See how our autonomous AI advisor stacks up against traditional management consultants and generic chatbots.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-4 px-4 font-bold text-slate-900">Capability</th>
                  <th className="py-4 px-4 font-bold text-blue-600 bg-blue-50/70 rounded-t-lg">
                    SolverX by Exabytes
                  </th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Traditional Consultant</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Generic AI (ChatGPT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{row.criteria}</td>
                    <td className="py-3.5 px-4 font-medium text-blue-900 bg-blue-50/40">
                      <span className="inline-flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {row.solverx}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{row.consultants}</td>
                    <td className="py-3.5 px-4 text-slate-500">{row.genericAi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Case Studies ────────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="tag mb-3 font-semibold">Malaysian SME Success</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#002244] tracking-tight">
            Validated by Real Malaysian Businesses
          </h2>
          <p className="text-slate-600 text-[14px] mt-2">
            See how SMEs across sectors upgraded their digital maturity and reclaimed productive team hours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {CASE_STUDIES.map((cs, idx) => (
            <div key={idx} className="card p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    {cs.size}
                  </span>
                  <span className="text-[12px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {cs.result}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{cs.business}</h3>
                <p className="text-[13px] text-slate-600 leading-relaxed italic mb-6">
                  &quot;{cs.quote}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[12px]">
                <span className="text-slate-500">Maturity Score Lift</span>
                <span className="font-bold text-slate-800">
                  <span className="text-red-500 line-through mr-1">{cs.beforeScore}</span>
                  → <span className="text-emerald-600">{cs.afterScore} / 100</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6 italic">
          * Scenarios illustrate projected outcomes based on Exabytes SME customer benchmarks and Gemini AI modelling. Individual results will vary.
        </p>
      </section>

      {/* ─── Final CTA ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-[#002244] via-[#0B2545] to-[#0052CC] p-10 sm:p-14 text-center text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Accelerate Your SME&apos;s Growth?
            </h2>
            <p className="mt-4 text-blue-100 text-base sm:text-lg leading-relaxed">
              Take the 3-minute assessment now. Unlock your customized digital maturity score, projected ringgit savings, and actionable Exabytes roadmap.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/assessment"
                className="btn-primary !bg-white !text-blue-900 hover:!bg-blue-50 !text-[15px] !px-8 !py-4 font-bold shadow-lg"
              >
                Start Free Assessment
                <svg className="w-4 h-4 ml-1.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <p className="text-[12px] text-blue-200/80 mt-4">
              Free forever · No credit card required · Instant download
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
