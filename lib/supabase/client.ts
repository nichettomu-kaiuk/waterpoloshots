import { createBrowserClient } from "@supabase/ssr";

// Not typed with the Database generic on purpose: a hand-written Database
// type that doesn't match @supabase/supabase-js's exact expected shape can
// make insert()/update() argument types silently collapse to `never` and
// fail `next build`. Once the project is linked, run
// `supabase gen types typescript --project-id <id> > lib/supabase/types.ts`
// to get real generated types, then pass them here as
// `createBrowserClient<Database>(...)` for full type safety.

// Public pages are cached (see lib/supabase/public.ts). Every successful
// write to the database made from the browser (i.e. from the Admin panel)
// asks the server to purge that cache, so visitors see the change right
// away instead of after the cache expires. Debounced: a burst of writes
// (e.g. tapping + on a goal several times) results in a single purge.
const WRITE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);
let purgeTimer: ReturnType<typeof setTimeout> | undefined;

function schedulePurge() {
  if (purgeTimer) clearTimeout(purgeTimer);
  purgeTimer = setTimeout(() => {
    fetch("/api/revalidate", { method: "POST", keepalive: true }).catch(() => {});
  }, 250);
}

const fetchAndPurge: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  try {
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (response.ok && WRITE_METHODS.has(method) && url.includes("/rest/v1/")) schedulePurge();
  } catch {
    // never let the purge bookkeeping break a real request
  }
  return response;
};

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: fetchAndPurge } }
  );
}
