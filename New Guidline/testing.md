# Testing — SolverX

## Commands
`npm run dev` · `npm run build` · `npm run lint`

## Non-negotiable checks before demo day
- [ ] All 7 follow-up scenarios trigger correctly
- [ ] Gemini timeout simulated (mock a slow/failed response) → fallback shows, UI doesn't crash
- [ ] Lead insert succeeds via the service role key; separately confirm the anon key **cannot** read or write `leads` — test this directly, don't assume RLS is correct
- [ ] Lead-capture write forced to fail → report still renders normally for the user
- [ ] ROI calculator and Digital Maturity Score sanity-checked across low/medium/high test personas
- [ ] Full flow tested on the actual device/network for the PWCC demo, not just localhost

## Rules for the agent
- Don't assume npm scripts beyond Next.js defaults unless added to `package.json`.
- A UI task isn't done until `npm run build` passes with no errors.
