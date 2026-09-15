# PRD — SolverX (v2, condensed)

**Challenge:** AI Horizon Solution Challenge 2026 — Exabytes track
**Dates:** Submission 21 Sept 2026 · Finalists announced 28 Sept · Live demo 7 Oct 2026 (must be live/functional — no slides accepted)

## Overview
AI-powered digital growth advisor for Malaysian SMEs: ~5-question discovery → AI-reasoned follow-ups (7 documented scenarios) → diagnosis + specific Exabytes product recommendations, ROI estimate, and a Digital Maturity Score. Goal: win the competition AND be something Exabytes could plausibly deploy.

**Users:** SME owner (primary) · Exabytes sales team (secondary, via lead capture) · judges (tertiary, via the demo video/live show)

## User story
Sarah runs a 12-person catering business. Answers 5 questions → flags "Operational Workload" → AI follow-up surfaces ~15 hrs/week on manual WhatsApp replies → diagnosed "medium AI readiness" → recommended Lark + FreshChat with an annual savings estimate → enters her email to unlock the full report, Maturity Score, and download.

## MVP Features (Must-Have)
| # | Feature | Key detail |
|---|---|---|
| 1 | Discovery Questionnaire | 5 base questions, mobile-friendly, no AI needed |
| 2 | AI Follow-up Engine | Gemini-reasoned (not if/else), covers all 7 documented scenarios — core "AI Innovation" story (25% of score) |
| 3 | Recommendation Report | Maps to the Exabytes catalog; each product includes an LLM-generated "why this fits you" line |
| 4 | ROI Calculator | Deterministic math (hrs/week x labour value), not AI |
| 5 | Live interactive demo | Hard competition rule — no static mockups accepted |
| 6 | Digital Maturity Score | 0-100 gauge from readiness tier + answer pattern |
| 7 | Downloadable report | Browser print-to-PDF — decided, no PDF library |
| 8 | Lead Capture | Name/email/company gates the full report -> saved to Supabase server-side, fire-and-forget, never blocks the user |

**Out of scope for MVP:** real Exabytes checkout, multi-language support, saved reports/user accounts, admin dashboard, full Freshsales CRM sync (basic capture in feature 8 is in scope; live syncing to Freshsales is not).

## Success Metrics
- Full flow completes in <3 min live, without errors
- 4+ of 7 scenarios demonstrable on stage
- Recommendations match the documented solution mapping
- Every recommendation shows genuine "why this fits you" reasoning, not a generic blurb
- Lead-capture failure never blocks or delays the visible report

## Brand
Match the live Exabytes site, not a custom look: deep royal blue / white / off-white cards / soft pastel gold highlights / bright green CTAs, card-based layout, 12-16px radius, heavy whitespace. Pull exact hex values from the live site rather than approximating.

## Risks
| Risk | Mitigation |
|---|---|
| AI follow-ups feel generic on demo | Ground prompts tightly in the documented scenario data; test against real personas before recording |
| Live AI latency or failure | Mandatory fallback response per scenario — see TechDesign |
| Scope creep past this list | This Must-Have list is the ceiling, not a floor — see AGENTS.md |
| Real PII collected at a live event | Add a simple consent line to the lead form — you're handling real personal data under Malaysia's PDPA even at MVP scale |

## Handoff
- Stage: prd-v2 (condensed, reconciled with build decisions)
- Stack: see `tech_stack.md` · Budget: $0/month

```json
{
  "appName": "SolverX",
  "mustHave": ["Discovery Questionnaire", "AI Follow-up Engine", "Recommendation Report w/ reasoning", "ROI Calculator", "Live demo", "Digital Maturity Score", "Downloadable report (browser print)", "Lead Capture (Supabase, server-only)"],
  "notInMvp": ["Real checkout", "Multi-language", "Saved accounts", "Admin dashboard", "Full Freshsales sync"]
}
```
