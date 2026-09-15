import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the SERVICE ROLE key.
 * Must ONLY be imported in Server Components, Server Actions, or API routes.
 * NEVER import in client components — the service role key bypasses RLS.
 */
export function createServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "[SolverX] Missing Supabase env vars. " +
        "Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local (no NEXT_PUBLIC_ prefix)."
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
