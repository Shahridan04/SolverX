import { createClient as _createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Browser-side Supabase client.
 * Safe to use in Client Components for reading non-sensitive data.
 * For writes and any server-side logic, use `src/lib/supabase/server.ts`.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "[SolverX] Missing Supabase environment variables. " +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
    );
  }

  return _createClient<Database>(url, key);
}
