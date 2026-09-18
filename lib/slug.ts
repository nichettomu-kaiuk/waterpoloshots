// Turns a string into a URL-friendly slug: lowercase, accents stripped,
// anything that isn't a letter/number collapsed to a single "-".
export function slugify(title: string) {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The public slug is composed of Titolo del torneo + Sottotitolo (e.g.
// "Serie A1 - Girone 1" + "2025/26" -> "serie-a1-girone-1-2025-26"), not the
// title alone — this way two championships that share a title but differ
// only by season/girone (a common case) don't collide on the same slug.
// Shared by components/admin/AdminChampionshipsList.tsx (new championship,
// live as the admin types) and app/admin/[slug]/settings/page.tsx (slug is
// regenerated on save whenever the title or subtitle changed).
export function championshipSlug(title: string, subtitle?: string | null) {
  return slugify([title, subtitle].filter(Boolean).join(" "));
}
