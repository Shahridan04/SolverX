# Tech Design — SolverX (v2.1)

**Stack:** Next.js (App Router) + Tailwind + shadcn/ui — Next.js API routes (no separate backend) — Supabase Postgres (server-only) — Gemini API Flash (server-only, structured JSON) — Vercel — $0 budget

## Key decisions
- **No PDF library** — browser print-to-PDF. Decided. Don't revisit.
- **Supabase server-only** — service role key, RLS on, insert-only for `service_role`, no SELECT for anyone (except admin dashboard route, which also runs server-side with service role key).
- **No database beyond `leads`** — catalog and scenario mappings are static config shipped with the app.
- **Pre-fetch AI follow-up** — Gemini call fires client-side as soon as user reaches Q4, result is cached in component state. By the time the user submits Q5, the follow-up is already ready. Feels instant, no timeout pressure.

## Pre-fetch Architecture (Feature 2a)
This is the core technique that makes the AI feel fast. Implementation:

```
User lands on Q4
  → useEffect fires: POST /api/assessment/follow-up with answers so far
  → Result stored in React state: prefetchedFollowUp
  → AI call runs in background (20-40s is fine, user is still on Q4/Q5)

User submits Q5
  → Check: is prefetchedFollowUp ready?
    → YES → show it immediately (feels instant)
    → NO  → show spinner, wait for in-flight request to resolve
              (only happens if user blazed through Q4→Q5 in under 2s)

Fallback: if the prefetch errored → show the static scenario fallback
```

**Key rule:** Never cancel the in-flight prefetch. Never start a second one if one is already running. Use a `useRef` flag to track state.

## `leads` table (live — see `tech_stack.md` for full SQL)
Columns: id, created_at, name, email, company, industry, team_size, maturity_score, recommended_products (jsonb), assessment_payload (jsonb). RLS on; INSERT restricted to `service_role`; no SELECT policy for anyone.

## Admin Dashboard (Feature 9)
- Route: `/admin` — server-rendered page (no client-side DB access)
- Reads `leads` table using service role key server-side
- Displays: name, email, company, industry, maturity score, top recommended product, timestamp
- Protection: check for `ADMIN_SECRET` env var in a query param (`/admin?key=xxx`) or middleware — simple, no auth library needed
- Read-only — no edit/delete operations

## Build order & complexity
| Feature | Complexity | Note |
|---|---|---|
| Discovery Questionnaire | Easy | Pure frontend, local state — done |
| AI Follow-up Engine | Hard | Core differentiator — done, but currently timing out |
| Pre-fetch AI follow-up | Medium | useEffect on Q4 mount, cache result in state |
| Recommendation Report | Medium | Done, falling back to templates — needs real Gemini output |
| ROI Calculator | Easy | Done |
| Digital Maturity Score | Easy-Medium | Done |
| Downloadable report | Medium | Print CSS needs polish |
| Lead Capture | Easy | Done — service role key now fixed |
| Admin Dashboard | Easy | Server component, service role read, secret param guard |

## AI Architecture
- Gemini Flash, server-side only, `response_mime_type: "application/json"` on every call
- Pre-fetch fires on Q4 → result ready before user needs it
- Every call still has ~45s timeout (up from 6s — pre-fetch removes the UX pressure)
- Static fallback per scenario if Gemini errors — never show a raw error

## Reliability Plan
1. Pre-fetch mitigates latency — user never waits at a spinner during demo
2. Static fallback per scenario if Gemini errors — never show a raw error
3. Lead-capture write is fire-and-forget — its failure is invisible to the user
4. Rehearse Sarah persona until it's a known-good path
5. Test on actual PWCC device/network before demo day

## Env vars (server-only — NO NEXT_PUBLIC_ prefix)
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` ✅ Fixed — service role key is now in `.env.local`
- `ADMIN_SECRET` — a short password string for protecting `/admin`

## Definition of Done
Runs all 7 scenarios without crashing — pre-fetch makes follow-up feel instant — admin dashboard shows real lead data — every Must-Have feature works end-to-end — deployed on a public Vercel URL — survives a full rehearsal on the actual demo device/network — $0/month cost.
