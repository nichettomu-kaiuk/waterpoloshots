import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDefaultTournament } from "@/lib/queries";

// The site used to serve a single tournament at the root (/calendario,
// /squadra/<id>, ...). Those URLs may be saved or shared, so they keep
// working by redirecting into the tournament they belong to.

export async function redirectLegacy(path: string): Promise<never> {
  const tournament = await getDefaultTournament();
  redirect(tournament ? `/${tournament.slug}${path}` : "/");
}

// /squadra/<id>, /giocatore/<id>, /news/<id>: go to the tournament that owns
// that record (falling back to the default tournament).
export async function redirectLegacyEntity(kind: "squadra" | "giocatore" | "news", id: string): Promise<never> {
  let tournamentId: string | null = null;
  try {
    const supabase = createClient();
    if (kind === "squadra") {
      const { data } = await supabase.from("teams").select("tournament_id").eq("id", id).maybeSingle();
      tournamentId = data?.tournament_id ?? null;
    } else if (kind === "giocatore") {
      const { data: player } = await supabase.from("players").select("team_id").eq("id", id).maybeSingle();
      if (player) {
        const { data: team } = await supabase.from("teams").select("tournament_id").eq("id", player.team_id).maybeSingle();
        tournamentId = team?.tournament_id ?? null;
      }
    } else {
      const { data } = await supabase.from("news_posts").select("tournament_id").eq("id", id).maybeSingle();
      tournamentId = data?.tournament_id ?? null;
    }

    if (tournamentId) {
      const { data: tournament } = await supabase.from("settings").select("slug").eq("id", tournamentId).maybeSingle();
      if (tournament?.slug) redirect(`/${tournament.slug}/${kind}/${id}`);
    }
  } catch (e) {
    // redirect() works by throwing: let it through.
    if (e && typeof e === "object" && "digest" in e) throw e;
  }
  const fallback = await getDefaultTournament();
  redirect(fallback ? `/${fallback.slug}/${kind}/${id}` : "/");
}
