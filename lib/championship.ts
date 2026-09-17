import { notFound } from "next/navigation";
import { getChampionshipBySlug } from "@/lib/queries";
import type { Championship } from "@/lib/supabase/types";

// Shared by every page under app/[slug]/... : resolves the slug from the
// URL into the championship row, or renders the nearest not-found page if
// the slug doesn't match any championship (deleted, mistyped, etc.).
export async function getChampionshipOrNotFound(slug: string): Promise<Championship> {
  const championship = await getChampionshipBySlug(slug);
  if (!championship) notFound();
  return championship;
}
