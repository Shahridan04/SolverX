<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — SolverX Build Rules

## Mission
AI SME Digital Growth Advisor for AI Horizon Solution Challenge 2026 (Exabytes track). Win with a genuinely impressive, working *live* demo — free tier only. Scope: `agent_docs/PRD-SolverX-MVP.md`. Architecture: `agent_docs/TechDesign-SolverX-MVP.md`.

## How to work
- Move autonomously within these rules. Only stop for explicit approval on: (1) anything touching secrets/keys, (2) schema changes to `leads`, (3) adding a new paid dependency. Everything else — build it, test it, move on. Don't ask permission to write code that's already in scope.
- No `any` — use `unknown` + type guards.
- Business logic (Gemini calls, scoring, recommendations) lives in server actions/API routes, never in UI components.

## Security (non-negotiable)
- `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY`: server-side only. Never `NEXT_PUBLIC_*`, never in client bundles.
- `leads` table: RLS on, no SELECT policy for anyone, INSERT restricted to `service_role` only.
- Admin dashboard reads via service role server-side only — never expose a client-side DB query.
- Collect no more PII than the lead form asks for (name, email, company).

## Reliability — the #1 project risk, not optional
- Pre-fetch the AI follow-up on Q4 — result is cached in state before user submits Q5. This is the primary latency mitigation.
- Every Gemini call still has a static fallback (scenario-matched). Never surface a raw error to the user.
- Timeout is now 45s (not 6s) — pre-fetch removes the UX pressure so we can wait for a real Gemini response.
- Lead-capture DB write: fire-and-forget, fires *after* the report is already shown. Its failure must never block or delay what the user sees.
- PDF export: browser print-to-PDF only. Decided — no `@react-pdf/renderer`, no puppeteer, don't revisit.

## Scope boundary
Features in `agent_docs/PRD-SolverX-MVP.md` Must-Have list (including pre-fetch follow-up and admin dashboard). Do not add: a real PDF pipeline, multi-language, auth/accounts, or full Freshsales CRM sync.

## Current Phase
Phase 3: Pre-fetch AI follow-up, admin dashboard, UI/brand polish, print CSS, end-to-end rehearsal.
