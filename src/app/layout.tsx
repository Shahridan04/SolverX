import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SolverX — AI Digital Growth Advisor for Malaysian SMEs",
  description:
    "SolverX diagnoses your business's digital gaps and recommends specific Exabytes products with ROI estimates — in under 3 minutes.",
  keywords: ["Exabytes", "SME", "digital advisor", "AI", "Malaysia", "business growth"],
  openGraph: {
    title: "SolverX — AI Digital Growth Advisor",
    description: "Get a personalized digital growth report powered by AI. Built for Malaysian SMEs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        {/* ─── Exabytes Official Top Announcement Bar ──────────────────── */}
        <aside aria-label="Announcement" className="bg-[#002244] text-white text-[11px] sm:text-[12px] py-1.5 px-4 font-medium print:hidden border-b border-blue-950">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 text-[10px] font-bold tracking-wide uppercase">
                Official AI Advisor
              </span>
              <span className="truncate text-slate-200">
                Built for Malaysian SMEs with Exabytes & Google Gemini · AI Horizon Solution Challenge 2026
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4 shrink-0 text-slate-300">
              <a
                href="https://www.exabytes.my"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                exabytes.my
                <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <span className="text-blue-900">|</span>
              <span className="text-blue-200">24/7/365 SME Support</span>
            </div>
          </div>
        </aside>

        {/* ─── Header ──────────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-40 print:hidden border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group py-1">
              <Image
                src="/images/solverx-logo.png"
                alt="SolverX by Exabytes"
                width={150}
                height={42}
                priority
                className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-2 sm:gap-6 text-[13px] text-slate-700 font-medium">
              <Link href="/#how-it-works" className="hidden md:inline-block hover:text-blue-600 transition-colors">
                How It Works
              </Link>
              <Link href="/#ecosystem" className="hidden md:inline-block hover:text-blue-600 transition-colors">
                Exabytes Ecosystem
              </Link>
              <Link href="/#roi-calculator" className="hidden sm:inline-block hover:text-blue-600 transition-colors">
                ROI Calculator
              </Link>
              <Link href="/#comparison" className="hidden lg:inline-block hover:text-blue-600 transition-colors">
                Why SolverX
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-all"
                title="Admin Dashboard"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="hidden sm:inline">Admin</span>
              </Link>
              <Link
                href="/assessment"
                className="btn-primary !py-2 !px-4 !text-[13px] font-semibold shadow-sm hover:shadow-md"
              >
                Start Free Assessment
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* ─── Footer (Exabytes SME Ecosystem) ────────────────────── */}
        <footer className="border-t border-slate-200/90 bg-white mt-16 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
              {/* Brand Column */}
              <div className="md:col-span-2 space-y-4">
                <Link href="/" className="inline-block">
                  <Image
                    src="/images/solverx-logo.png"
                    alt="SolverX by Exabytes"
                    width={130}
                    height={36}
                    className="h-8 w-auto object-contain"
                  />
                </Link>
                <p className="text-[13px] text-slate-600 leading-relaxed max-w-sm">
                  Autonomous AI Digital Growth Advisor engineered for Malaysian SMEs. Powered by Google Gemini 2.5 Flash and grounded in Exabytes cloud solutions to deliver instant gap analysis and ROI projections.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200/80 text-[12px] text-blue-900 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  MDEC SME Digitalization Grant Compatible
                </div>
              </div>

              {/* Column 1: Hosting & Cloud */}
              <div className="text-[13px] space-y-2.5">
                <p className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                  Cloud & Infrastructure
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li><a href="https://www.exabytes.my/web-hosting/cpanel-web-hosting" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">cPanel AI Hosting</a></li>
                  <li><a href="https://www.exabytes.my/web-hosting/business-web-hosting" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">Business Web Hosting</a></li>
                  <li><a href="https://www.exabytes.my/servers/nvme-vps" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">NVMe Cloud VPS</a></li>
                  <li><a href="https://www.exabytes.my/domains/mydomain" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">.MY Domain Names</a></li>
                </ul>
              </div>

              {/* Column 2: Productivity & CRM */}
              <div className="text-[13px] space-y-2.5">
                <p className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                  Business & Sales
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li><a href="https://www.exabytes.my/freshworks/freshsales-crm" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">Freshsales CRM</a></li>
                  <li><a href="https://www.exabytes.my/google-workspace" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">Google Workspace</a></li>
                  <li><a href="https://www.exabytes.my/email/email-hosting" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">Business Email</a></li>
                  <li><a href="https://www.exabytes.my/commerce" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">Exabytes Commerce</a></li>
                </ul>
              </div>

              {/* Column 3: Security & Support */}
              <div className="text-[13px] space-y-2.5">
                <p className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                  Security & Advisor
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li><a href="https://www.exabytes.my/acronis/cyber-protect" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">Acronis Cyber Protect</a></li>
                  <li><a href="https://www.exabytes.my/web-security/ssl" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">Enterprise SSL</a></li>
                  <li><Link href="/assessment" className="text-blue-600 font-semibold hover:underline">Start AI Assessment</Link></li>
                  <li><Link href="/admin" className="hover:text-blue-600 transition-colors">Admin Lead Portal</Link></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-500">
              <p>
                © {new Date().getFullYear()} SolverX by Exabytes Malaysia. All rights reserved. Built for AI Horizon Solution Challenge 2026.
              </p>
              <div className="flex items-center gap-4 text-slate-500">
                <span>Exabytes Track</span>
                <span>·</span>
                <span>Google Gemini AI</span>
                <span>·</span>
                <span>Malaysian SME Digital Growth</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
