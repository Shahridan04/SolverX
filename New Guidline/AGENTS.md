# AGENTS.md — SolverX Build Rules

## Mission
AI SME Digital Growth Advisor for AI Horizon Solution Challenge 2026 (Exabytes track). Win with a genuinely impressive, working *live* demo — free tier only. Scope: `PRD-SolverX-MVP.md`. Architecture: `TechDesign-SolverX-MVP.md`.

## How to work
- Move autonomously within these rules. Only stop for explicit approval on: (1) anything touching secrets/keys, (2) schema changes to `leads`, (3) adding a new paid dependency. Everything else — build it, test it, move on. Don't ask permission to write code that's already in scope.
- No `any` — use `unknown` + type guards.
- Business logic (Gemini calls, scoring, recommendations) lives in server actions/API routes, never in UI components.

## Security (non-negotiable)
- `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY`: server-side only. Never `NEXT_PUBLIC_*`, never in client bundles.
- `leads` table: RLS on, no SELECT policy for anyone, INSERT restricted to `service_role` only. Already built correctly — don't weaken it.
- Collect no more PII than the lead form asks for (name, email, company).

## Reliability — the #1 project risk, not optional
- Every Gemini call: ~6s timeout → fall back to a pre-written, scenario-matched static response. Never surface a raw error to the user.
- Lead-capture DB write: fire-and-forget, fires *after* the report is already shown. Its failure must never block or delay what the user sees.
- PDF export: browser print-to-PDF only. Decided — no `@react-pdf/renderer`, no puppeteer, don't revisit.

## Scope boundary
Build every feature in `PRD-SolverX-MVP.md`'s Must-Have list to a genuinely polished, correct standard — that's where "impressive" comes from. Do not add: a real PDF pipeline, admin dashboard, multi-language, auth/accounts, or CRM sync beyond the `leads` table. That's a line being held so demo-critical features get the time, not a corner being cut.

## Current Phase
Phase 1 done: repo, Next.js scaffold, Supabase `leads` table (live, schema in `tech_stack.md`). Phase 2: discovery questionnaire → AI follow-up engine, building the fallback pattern in from line one, not bolted on after.
