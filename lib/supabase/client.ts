import { createBrowserClient } from "@supabase/ssr";

// Not typed with the Database generic on purpose: a hand-written Database
// type that doesn't match @supabase/supabase-js's exact expected shape can
// make insert()/update() argument types silently collapse to `never` and
// fail `next build`. Once the project is linked, run
// `supabase gen types typescript --project-id <id> > lib/supabase/types.ts`
// to get real generated types, then pass them here as
// `createBrowserClient<Database>(...)` for full type safety.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
