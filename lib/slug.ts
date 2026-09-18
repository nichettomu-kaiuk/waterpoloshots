// Turns a tournament title into a URL-friendly slug: lowercase, accents
// stripped, anything that isn't a letter/number collapsed to a single "-".
// Shared by app/admin/page.tsx (new championship) and
// app/admin/[slug]/settings/page.tsx (slug follows the title after edits).
export function slugify(title: string) {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
