// Routes an image URL through Next.js's built-in image optimizer (resize,
// modern format like WebP/AVIF, edge caching) for the couple of spots that
// use an admin-uploaded image as a CSS `background-image` (Hero's
// home_bg_url, the home page's header_bg_url) instead of a plain <img> or
// next/image element. Those need CSS-level control (background-size,
// background-position, a mask-image, responsive behaviour across themes)
// that would be fragile to reproduce exactly with <Image>, so this keeps
// the existing CSS untouched while still getting the same optimization
// <Image> would give: without it, admin-uploaded photos (which can easily
// be several MB straight out of a phone) were being served completely
// unprocessed on every page load, since they're also not cached by ISR.
//
// Requires `images.remotePatterns` in next.config.js to allow the source
// host (already set for `**.supabase.co`).
export function optimizedBg(
  url: string | null | undefined,
  width = 1600,
  quality = 75
): string | undefined {
  if (!url) return undefined;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
}
