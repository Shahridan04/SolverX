# Tech Stack — SolverX

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + Tailwind CSS + shadcn/ui |
| Backend | Next.js API routes / server actions — no separate backend |
| Database | Supabase (Postgres) — `leads` table only, server-only writes |
| AI | Google Gemini API (Flash), server-side only, structured output (`response_mime_type: "application/json"`) |
| PDF export | Browser print-to-PDF — no PDF library, decided |
| Hosting | Vercel (free tier) |

## `leads` table (live)
```sql
CREATE TABLE IF NOT EXISTS public.leads (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name                 TEXT        NOT NULL,
  email                TEXT        NOT NULL,
  company              TEXT,
  industry             TEXT        NOT NULL,
  team_size            TEXT        NOT NULL,
  maturity_score       INTEGER     NOT NULL CHECK (maturity_score BETWEEN 0 AND 100),
  recommended_products JSONB       NOT NULL DEFAULT '[]'::jsonb,
  assessment_payload   JSONB       NOT NULL DEFAULT '{}'::jsonb
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_insert_only" ON public.leads FOR INSERT TO service_role WITH CHECK (true);
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads (email);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);
```
No SELECT policy exists for anon or authenticated — intentional. Any future read goes through the service role key, server-side only.

## Env vars (all server-only — no NEXT_PUBLIC_ prefix)
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ replaces `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the current `.env.local` — see `MEMORY.md`

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`