# Project Memory & State

## Current Status
- Phase: Phase 3 — Pre-fetch AI, Admin Dashboard, UI Polish, Print CSS, Rehearsal
- Current task: NOT STARTED — guidelines updated, ready to build

## Resolved
- [x] PRD + Tech Design finalized (v2.1 — pre-fetch + admin dashboard added)
- [x] Agent config files aligned (AGENTS.md, GEMINI.md, tech_stack.md)
- [x] Next.js 16 scaffold + Gemini Flash server connection verified
- [x] Exabytes catalog + 7 trigger scenarios + AI follow-up engine built
- [x] Digital Maturity Score (0-100 gauge) + ROI calculator implemented
- [x] Assessment wizard UI + lead capture API route built
- [x] Production build & TypeScript checks pass with 0 errors
- [x] `.env.local` fixed: SUPABASE_SERVICE_ROLE_KEY now set, lead INSERT works (real UUID confirmed)

## Phase 3 — What to build next (in order)
1. **Pre-fetch AI follow-up** — fire `/api/assessment/follow-up` on Q4 mount, cache in state. Extend API timeout to 45s. Makes AI feel instant.
2. **Admin Dashboard** — `/admin?key=ADMIN_SECRET` server page, reads `leads` table via service role, shows name/email/company/score/timestamp. Read-only.
3. **UI/Brand polish** — match live Exabytes site hex values exactly (deep royal blue, bright green CTAs, off-white cards). Not approximated.
4. **Print CSS** — `@media print` stylesheet on the report page: hide nav/buttons, control page breaks, clean typography.
5. **End-to-end rehearsal** — run all 3 personas (Sarah, Tan, Alex) on actual device/network.

## Decisions locked
- Pre-fetch fires on Q4 mount (useEffect). Never start a second if one is in flight. Cache result in useRef.
- Browser print-to-PDF (not a PDF library — do not revisit)
- Supabase: server-only writes and reads, service role key, no client-side DB access
- Admin dashboard: protected by ADMIN_SECRET env var in query param — no auth library

## Open items
- Add `ADMIN_SECRET` to `.env.local` before building admin dashboard (user to provide or generate one)
- Verify Gemini Flash free-tier rate limits with new 45s timeout before demo day
- Get exact Exabytes brand hex values from live site for UI polish
- Test on actual PWCC device/network before 7 Oct