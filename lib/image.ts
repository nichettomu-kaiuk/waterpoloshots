// Shrinks an image in the browser BEFORE it is uploaded to storage. Phone
// photos are routinely 3–10 MB and 4000+ px wide; the site never shows them
// larger than ~1200 px, so keeping the original only slows every page down.
//
// - Longest side is capped at `maxDimension` (never enlarged).
// - Re-encoded as WebP (keeps transparency, so logos stay transparent).
// - Anything that can't or shouldn't be converted (SVG, GIF, unsupported
//   browser, decoding error, or a result that isn't actually smaller) is
//   returned untouched: this function never makes an upload fail.
const CONVERTIBLE = new Set(["image/jpeg", "image/png", "image/webp"]);

export const MAX_DIMENSION = {
  logo: 800, // team logos, player photos, tournament logo
  news: 1600,
  background: 1920,
} as const;

export async function optimizeImage(
  file: File,
  maxDimension: number,
  quality = 0.82
): Promise<File> {
  try {
    if (typeof document === "undefined" || typeof createImageBitmap !== "function") return file;
    if (!CONVERTIBLE.has(file.type)) return file;

    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
    const { width, height } = bitmap;
    const scale = Math.min(1, maxDimension / Math.max(width, height));

    // Already small enough in both pixels and bytes: leave it alone.
    if (scale === 1 && file.size <= 250 * 1024) {
      bitmap.close?.();
      return file;
    }

    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close?.();

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    // toBlob falls back to PNG when WebP isn't supported: only accept WebP,
    // and only if it's really smaller.
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() });
  } catch {
    return file;
  }
}
