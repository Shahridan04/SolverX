import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow @google/genai and @supabase/supabase-js to run as native Node.js
  // modules (not bundled by Turbopack), so they can make outbound network calls.
  serverExternalPackages: ["@google/genai", "@supabase/supabase-js"],
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
