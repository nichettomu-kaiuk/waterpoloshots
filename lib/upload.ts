import type { SupabaseClient } from "@supabase/supabase-js";

// Supabase Storage rejects object keys containing spaces, accents,
// apostrophes and similar characters (typical of phone/camera file names
// such as "Città di Napoli (1).png"). Normalise to a safe ASCII key.
export function safeFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1) : "";
  const clean = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  const safeBase = clean(base) || "file";
  const safeExt = clean(ext).toLowerCase();
  return safeExt ? `${safeBase}.${safeExt}` : safeBase;
}

export function brandingPath(folder: string, fileName: string): string {
  return `${folder}/${Date.now()}-${safeFileName(fileName)}`;
}

// Uploads a file to the public "branding" bucket and reports the outcome
// explicitly, so callers can show the error instead of silently dropping it.
export async function uploadToBranding(
  supabase: SupabaseClient<any, any, any>,
  folder: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const path = brandingPath(folder, file.name);
  const { error } = await supabase.storage.from("branding").upload(path, file);
  if (error) return { url: null, error: error.message };
  return { url: supabase.storage.from("branding").getPublicUrl(path).data.publicUrl, error: null };
}
