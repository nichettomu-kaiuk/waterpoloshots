"use client";

// Resizes/re-encodes an image in the browser, before it gets uploaded to
// Supabase Storage. Every admin upload handler (logo/sfondi in Impostazioni,
// logo squadra, foto giocatore, immagine news) calls this first: a photo
// taken straight from a phone can easily be several MB, and none of that
// extra resolution is ever used — the biggest of these images (gli sfondi)
// is only ever displayed at page width, and most (loghi, foto giocatori)
// are shown as small thumbnails. Doing this client-side, before the upload,
// is what actually saves the upload time and the storage/bandwidth, on top
// of the automatic resizing Next.js already does when serving these images
// back out (see lib/optimizedImage.ts) — that only ever shrinks a copy for
// display, it can't undo how large the stored original is.
export async function compressImage(
  file: File,
  { maxDimension = 1600, quality = 0.82 }: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  // SVG e altri formati non raster non vanno ricodificati (un logo
  // vettoriale è già leggerissimo, e "ridimensionarlo" via canvas lo
  // trasformerebbe in un bitmap, perdendo la nitidezza a ogni zoom).
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));

    // Già abbastanza piccola: non vale la pena ricomprimerla (si rischia solo
    // di perdere qualità per un file PNG con trasparenza, senza guadagno di
    // peso apprezzabile).
    if (scale >= 1 && file.size < 400 * 1024) {
      bitmap.close?.();
      return file;
    }

    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    // I PNG restano PNG (preserva la trasparenza, importante per i loghi);
    // tutto il resto diventa JPEG, molto più leggero per le foto.
    const keepPng = file.type === "image/png";
    const outType = keepPng ? "image/png" : "image/jpeg";
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, outType, keepPng ? undefined : quality)
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = keepPng ? file.name : file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], newName, { type: outType });
  } catch {
    // Browser senza createImageBitmap, immagine corrotta, ecc.: meglio
    // caricare il file originale che bloccare l'operazione.
    return file;
  }
}
