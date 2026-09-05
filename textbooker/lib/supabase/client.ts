/**
 * lib/supabase/client.ts
 * Browser-side Supabase client (safe for Client Components).
 * Uses @supabase/ssr to keep auth cookies in sync across client/server.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
