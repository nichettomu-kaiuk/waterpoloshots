import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// See lib/supabase/client.ts for why this isn't typed with a hand-written
// Database generic.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component: middleware handles refresh
          }
        },
      },
    }
  );
}
