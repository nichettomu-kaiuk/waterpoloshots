// Every tournament lives at its own public path, built from
// "Titolo torneo" + "Sottotitolo" (e.g. "Serie B - Girone 3" + "Stagione
// 2026" → /serie-b-girone-3-stagione-2026).
//
// KEEP IN SYNC with the backfill SQL at the bottom of supabase/schema.sql
// (lowercase, accents stripped, every run of non a-z/0-9 becomes one "-",
// leading/trailing "-" trimmed).
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function tournamentSlug(title: string, subtitle?: string | null): string {
  return slugify(`${title} ${subtitle ?? ""}`) || "torneo";
}

// First path segments that already mean something else in the app (admin
// panel, framework internals, and the old single-tournament URLs, which now
// redirect to the default tournament). A tournament can't take these slugs.
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "_next",
  "login",
  "static",
  "public",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.webmanifest",
  "calendario",
  "classifiche",
  "marcatori",
  "squadre",
  "squadra",
  "giocatori",
  "giocatore",
  "news",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

// Public path helper: tpath("serie-b", "/calendario") → "/serie-b/calendario".
export function tpath(slug: string, path = ""): string {
  return `/${slug}${path}`;
}
