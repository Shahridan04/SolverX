# Tech Design — SolverX (v2.1)

**Stack:** Next.js (App Router) + Tailwind + shadcn/ui — Next.js API routes (no separate backend) — Supabase Postgres (server-only) — Gemini API Flash (server-only, structured JSON) — Vercel — $0 budget

## Key decisions
- **No PDF library** — browser print-to-PDF. Decided. Don't revisit.
- **Supabase server-only** — service role key, RLS on, insert-only for `service_role`, no SELECT for anyone (except admin dashboard route, which also runs server-side with service role key).
- **Consultative Telemetry Loading** — Gemini calls are paired with an interactive 3-stage animated telemetry sequence. Provides a high-end consulting experience while comfortably allowing server-side Gemini inference and static fallback.

## Consultative Telemetry Architecture (Feature 2a)
This technique pairs real-time Gemini processing with a 3-stage animated telemetry sequence, giving the user a professional consulting assessment experience while masking API latency:

```
User submits base questions
  → UI transitions to flowStep: "ai_probing"
  → 3-stage telemetry sequence triggers:
      Stage 1 (0ms): "Analyzing operational bottlenecks..."
      Stage 2 (600ms): "Evaluating digital maturity index..."
      Stage 3 (1200ms): "Synthesizing consultative probes..."
  → Gemini API call runs concurrently (via /api/assessment/follow-up)
  → When resolved (min 1.8s for smooth animation) → transitions to follow_up probe screen

Fallback: if Gemini API errors or times out → instant static scenario fallback seamlessly displayed
```

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
| AI Follow-up Engine | Hard | Core differentiator — done |
| Consultative Telemetry | Easy-Medium | 3-stage animated UX loader with min-time guarantee — done |
| Recommendation Report | Medium | Done with Gemini reasoning + catalog grounding |
| ROI Calculator | Easy | Done |
| Digital Maturity Score | Easy-Medium | Done |
| Downloadable report | Medium | Print CSS for browser-native PDF export — done |
| Lead Capture | Easy | Done — Supabase service role write |
| Admin Dashboard | Easy | Server component, service role read, secret param guard — done |

## AI Architecture
- Gemini Flash, server-side only, `response_mime_type: "application/json"` on every call
- Dual-stage API: Follow-up probe generation + Comprehensive diagnosis report
- 45s timeout guard with instant static scenario fallback — never show a raw error

## Reliability Plan
1. Consultative telemetry animation masks perceived network latency
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
Runs all 7 scenarios without crashing — consultative telemetry delivers polished executive experience — admin dashboard shows real lead data — every Must-Have feature works end-to-end — deployed on a public Vercel URL — survives a full rehearsal on the actual demo device/network — $0/month cost.
