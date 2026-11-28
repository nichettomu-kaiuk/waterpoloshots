import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase client for PUBLIC READS (tournaments, matches, standings, ...).
//
// Unlike lib/supabase/server.ts it never touches cookies, so Next.js can
// cache what it fetches (Data Cache) instead of querying the database on
// every visit. Every request is tagged PUBLIC_DATA_TAG so it can be purged
// at once.
//
// Freshness: whenever the Admin saves something, the browser client calls
// /api/revalidate (see lib/supabase/client.ts), which purges the tag, so
// changes show up almost immediately. PUBLIC_REVALIDATE_SECONDS is only the
// safety net for edits made outside the app (e.g. the Supabase SQL editor).
export const PUBLIC_DATA_TAG = "public-data";
export const PUBLIC_REVALIDATE_SECONDS = 120;

export function createPublicClient(): SupabaseClient {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [PUBLIC_DATA_TAG] },
        } as RequestInit),
    },
  });
}
