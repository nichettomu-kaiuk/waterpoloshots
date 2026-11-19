import { createClient } from "@/lib/supabase/server";
import { getChampionshipOrNotFound } from "@/lib/championship";
import { Users, UserRound, MapPinned, Radio, Shield, Target, Newspaper } from "lucide-react";

export default async function AdminChampionshipDashboard({ params }: { params: { slug: string } }) {
  const championship = await getChampionshipOrNotFound(params.slug);
  const supabase = createClient();

  const [teams, players, venues, liveMatches, allMatches, newsPosts] = await Promise.all([
    supabase.from("teams").select("*", { count: "exact", head: true }).eq("championship_id", championship.id),
    supabase.from("players").select("*, team:teams!inner(*)", { count: "exact", head: true }).eq("team.championship_id", championship.id),
    supabase.from("venues").select("*", { count: "exact", head: true }).eq("championship_id", championship.id),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("championship_id", championship.id).eq("status", "live"),
    // Serve sia il conteggio (Partite) sia i punteggi (Gol fatti, sotto): una
    // sola query invece di due, dato che qui i punteggi sono comunque leggeri
    // (due interi per riga). Include ogni partita (anche quelle non ancora
    // giocate, a 0-0 di default) perché "Partite" è il totale inserito, non
    // solo quelle concluse.
    supabase.from("matches").select("home_score, away_score", { count: "exact" }).eq("championship_id", championship.id),
    supabase.from("news_posts").select("*", { count: "exact", head: true }).eq("championship_id", championship.id),
  ]);

  const totalGoals = (allMatches.data ?? []).reduce((sum, m) => sum + m.home_score + m.away_score, 0);

  const stats = [
    { label: "Squadre", value: teams.count ?? 0, icon: Users },
    { label: "Giocatori", value: players.count ?? 0, icon: UserRound },
    { label: "Piscine", value: venues.count ?? 0, icon: MapPinned },
    { label: "Match live", value: liveMatches.count ?? 0, icon: Radio },
    { label: "Partite", value: allMatches.count ?? 0, icon: Shield },
    { label: "Gol fatti", value: totalGoals, icon: Target },
    { label: "News", value: newsPosts.count ?? 0, icon: Newspaper },
  ];

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">Panoramica</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-line bg-surface p-4">
            <Icon size={18} className="mb-2 text-primary" />
            <p className="font-display text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface-raised p-4 text-sm text-muted">
        Usa i pulsanti qui sotto per gestire Squadre, Giocatori, Partite, Piscine e il branding di{" "}
        <strong className="text-white">{championship.name}</strong>.
      </div>
    </div>
  );
}
