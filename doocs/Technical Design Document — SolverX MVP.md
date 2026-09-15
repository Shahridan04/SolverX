# Tech Design — SolverX (v2, condensed & reconciled)

> ⚠️ This file is superseded by `agent_docs/TechDesign-SolverX-MVP.md` — that is the source of truth.
> This copy is kept for reference. Do not edit here; edit `agent_docs/TechDesign-SolverX-MVP.md`.

**Stack:** Next.js (App Router) + Tailwind + shadcn/ui — Next.js API routes (no separate backend) — Supabase Postgres (server-only) — Gemini API Flash (server-only, structured JSON) — Vercel — $0 budget

## Key decisions
- **No PDF library** — browser print-to-PDF. Decided. Don't revisit.
- **Supabase server-only** — service role key, RLS on, insert-only for `service_role`, no SELECT for anyone.
- **No database beyond `leads`** — catalog and scenario mappings are static config.

## AI Architecture
- Gemini Flash, server-side only, `response_mime_type: "application/json"` on every call
- Every call: ~6s timeout → fall back to a pre-written, scenario-matched static response — never show a raw error

## Reliability Plan
1. Every AI call has the fallback above, no exceptions
2. Lead-capture write is fire-and-forget — its failure is invisible to the user
3. Test on the actual PWCC device/network before demo day

## Env vars (server-only — NO NEXT_PUBLIC_ prefix)
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ The current `.env.local` has the anon key, which cannot write to `leads`. Fix before demo.