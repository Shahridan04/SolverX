# Tech Design — SolverX (v2, condensed & reconciled)

**Stack:** Next.js (App Router) + Tailwind + shadcn/ui - Next.js API routes (no separate backend) - Supabase Postgres (server-only) - Gemini API Flash (server-only, structured JSON) - Vercel - $0 budget

## Key decisions (and why, briefly)
- **No PDF library** — browser print-to-PDF. Puppeteer doesn't fit Vercel's free serverless limits (size/time caps, chrome-binary headaches); a real PDF lib is unneeded complexity for a single-session export.
- **Supabase server-only** — service role key, RLS on, insert-only for `service_role`, no SELECT for anyone. Real personal data deserves this even in a demo.
- **No database beyond `leads`** — the Exabytes catalog and scenario mappings are static config shipped with the app, not stored data.

## `leads` table (live — see `tech_stack.md` for full SQL)
Columns: id, created_at, name, email, company, industry, team_size, maturity_score, recommended_products (jsonb), assessment_payload (jsonb). RLS on; INSERT restricted to `service_role`; no SELECT policy for anyone.

## Build order & complexity
| Feature | Complexity | Note |
|---|---|---|
| Discovery Questionnaire | Easy | Pure frontend, local state |
| AI Follow-up Engine | Hard | Core differentiator — budget the most time here |
| Recommendation Report | Medium | One more Gemini call, structured JSON, grounded in the catalog |
| ROI Calculator | Easy | Deterministic, no AI |
| Digital Maturity Score | Easy-Medium | Weighted formula + gauge component |
| Downloadable report | Medium | Print-optimized CSS, not a new dependency |
| Lead Capture | Easy | Insert after the report renders, fire-and-forget |

## AI Architecture
- Gemini Flash, server-side only, `response_mime_type: "application/json"` on every call
- Every call: ~6s timeout → fall back to a pre-written, scenario-matched static response — never show a raw error
- Data sent to the model: the user's answers + static Exabytes catalog context only

## Reliability Plan — the #1 priority, not a nice-to-have
1. Every AI call has the fallback above, no exceptions
2. Rehearse one full persona run (e.g. Sarah) until it's a known-good path
3. Keep a screen-recording backup for total wifi failure (insurance, not the plan — live demo is still required)
4. Test on the actual PWCC device/network before demo day, not just localhost
5. Lead-capture write is fire-and-forget — its failure is invisible to the user

## Env vars (server-only unless noted)
`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — **not** `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The current `.env.local` has the anon key, but the RLS policy only grants INSERT to `service_role` — the anon key cannot write to `leads`. Fix before wiring up lead capture.

## Open Questions
- Gemini Flash's current free-tier rate limits — verify before demo day
- Whether sponsor API credits are available (worth asking in the WhatsApp group)
- Exact Exabytes brand hex values, pulled from the live site

## Definition of Done
Runs all 7 scenarios without crashing - every Must-Have feature works end-to-end - deployed on a public Vercel URL - survives a full rehearsal on the actual demo device/network - $0/month cost.

## Handoff
```json
{
  "appName": "SolverX",
  "stack": {
    "frontend": "Next.js (App Router) + Tailwind + shadcn/ui",
    "backend": "Next.js API routes",
    "database": "Supabase (Postgres) - leads table, server-only writes",
    "aiProvider": "Google Gemini API (Flash)",
    "hosting": "Vercel",
    "pdf": "browser print-to-PDF, no library"
  },
  "openQuestions": ["Gemini free-tier rate limits", "possible sponsor API credits", "exact Exabytes brand hex values"]
}
```
