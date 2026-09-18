import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Plain, cookie-free Supabase client for read-only public data. Every table
// these queries touch has an RLS policy of `for select using (true)` — the
// response is identical for every visitor, admin or not, so it needs no
// session at all.
//
// This is deliberately NOT the @supabase/ssr cookie-bound client from
// server.ts: calling cookies() inside a Server Component (which that client
// does on every use) is a Next.js "Dynamic API" and opts the whole route out
// of static rendering/ISR. Before this, lib/queries.ts used that client for
// every read, which meant every public page — home, calendario, classifiche,
// squadre, giocatori, ecc. — was fully re-rendered and re-queried on every
// single request, with zero caching, even though the data behind it changes
// rarely. Using this client instead lets those routes declare
// `export const revalidate = ...` and actually benefit from it (see
// app/(site)/page.tsx and app/[slug]/layout.tsx). Admin keeps reading
// through the cookie-bound client where it needs one (writes always do, to
// pass the `auth.role() = 'authenticated'` RLS check) and stays fully
// dynamic via `export const dynamic = "force-dynamic"` on app/admin/layout.tsx,
// so this change doesn't make admin data go stale.
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );
}
