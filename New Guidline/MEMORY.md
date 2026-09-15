# Project Memory & State

## Current Status
- Phase: Phase 1 complete → Phase 2 (core build)
- Current task: Discovery questionnaire → Gemini follow-up engine, with fallback built in from the start

## Resolved
- [x] PRD + Tech Design finalized (condensed v2 — PDF = browser print, Supabase = server-only via service role)
- [x] Agent config files reconciled (AGENTS.md/GEMINI.md no longer contradict tech_stack.md)
- [x] `leads` table live in Supabase — RLS on, insert restricted to `service_role`, no SELECT policy for anyone

## Blockers / Open Items
- 🔴 **`.env.local` bug:** currently has `NEXT_PUBLIC_SUPABASE_ANON_KEY`, but the RLS policy only allows `service_role` to insert. The anon key cannot write to `leads` — replace with a server-only `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix) before wiring up lead capture, or inserts will fail silently.
- Verify current Gemini Flash free-tier rate limits before demo day
- Confirm exact Exabytes brand hex values from the live site

## Decisions locked
- Browser print-to-PDF (not a PDF library)
- Supabase: server-only writes, service role key, no client-side DB access
- Build philosophy: polish the Must-Have list to win — no scope additions beyond it (see AGENTS.md Scope boundary)
