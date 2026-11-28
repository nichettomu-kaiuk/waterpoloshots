// Next's image optimizer URL, for places that can't use <Image> (CSS
// background-image). Resizes and re-encodes (AVIF/WebP) the stored original,
// which is often a multi-megabyte photo, and caches the result.
// `width` must be one of the sizes allowed in next.config.js
// (images.deviceSizes / imageSizes).
export function optimizedImageUrl(src: string, width: number, quality = 60): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
