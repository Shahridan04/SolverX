# Project Memory & State

## Current Status
- Phase: Phase 3 — Admin Dashboard, UI Polish, Print CSS, Rehearsal
- Current task: Rehearsal & Demo Preparation

## Resolved
- [x] PRD + Tech Design finalized (Admin dashboard added)
- [x] Agent config files aligned (AGENTS.md, GEMINI.md, tech_stack.md)
- [x] Next.js 16 scaffold + Gemini Flash server connection verified
- [x] Exabytes catalog + 7 trigger scenarios + AI follow-up engine built
- [x] Digital Maturity Score (0-100 gauge) + ROI calculator implemented
- [x] Assessment wizard UI + consultative telemetry loading screens built
- [x] Lead capture API route + Admin Dashboard (/admin) built
- [x] Production build & TypeScript checks pass with 0 errors
- [x] `.env.local` fixed: SUPABASE_SERVICE_ROLE_KEY now set, lead INSERT works (real UUID confirmed)

## Phase 3 — Current State
1. **Consultative Telemetry Loading** — 3-stage animated telemetry sequence while real-time Gemini API runs with static fallback.
2. **Admin Dashboard** — `/admin?key=ADMIN_SECRET` server page, reads `leads` table via service role, shows name/email/company/score/timestamp.
3. **UI/Brand polish** — matching live Exabytes brand styling.
4. **Print CSS** — `@media print` stylesheet for clean browser-native PDF export.
5. **End-to-end rehearsal** — ready for live pitch.

## Decisions locked
- Real-time Gemini inference with 3-stage consultative telemetry screen (no background pre-fetch)
- Browser print-to-PDF (not a PDF library — do not revisit)
- Supabase: server-only writes and reads, service role key, no client-side DB access
- Admin dashboard: protected by ADMIN_SECRET env var in query param — no auth library

## Open items
- Add `ADMIN_SECRET` to `.env.local` before building admin dashboard (user to provide or generate one)
- Verify Gemini Flash free-tier rate limits with new 45s timeout before demo day
- Get exact Exabytes brand hex values from live site for UI polish
- Test on actual PWCC device/network before 7 Oct