import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getChampionshipOrNotFound } from "@/lib/championship";
import { Users, UserRound, MapPinned, Radio, Shield, Target, Newspaper } from "lucide-react";
import SignOutCard from "@/components/admin/SignOutCard";

export default async function AdminChampionshipDashboard({ params }: { params: { slug: string } }) {
  const championship = await getChampionshipOrNotFound(params.slug);
  const supabase = createClient();
  const base = `/admin/${championship.slug}`;

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

  // Ogni card porta alla pagina Admin di gestione corrispondente. "Match
  // live" e "Partite" puntano entrambe alla stessa pagina Partite (non c'è
  // una vista admin separata solo per le partite in corso — quelle "in
  // corso" sono comunque segnalate lì). "Gol fatti" non ha una pagina admin
  // dedicata (i gol si registrano dentro il dettaglio di ogni singola
  // partita, non in un elenco a sé) e porta invece alla pagina pubblica
  // Marcatori, l'unica del sito dedicata proprio ai gol segnati — su
  // richiesta esplicita.
  const stats = [
    { label: "Squadre", value: teams.count ?? 0, icon: Users, href: `${base}/teams` },
    { label: "Giocatori", value: players.count ?? 0, icon: UserRound, href: `${base}/players` },
    { label: "Piscine", value: venues.count ?? 0, icon: MapPinned, href: `${base}/venues` },
    { label: "Match live", value: liveMatches.count ?? 0, icon: Radio, href: `${base}/matches` },
    { label: "Partite", value: allMatches.count ?? 0, icon: Shield, href: `${base}/matches` },
    { label: "Gol fatti", value: totalGoals, icon: Target, href: `/${championship.slug}/marcatori` },
    { label: "News", value: newsPosts.count ?? 0, icon: Newspaper, href: `${base}/news` },
  ];

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">Panoramica</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-line bg-surface p-4 transition hover:border-primary hover:bg-surface-raised active:scale-[0.99]"
          >
            <Icon size={18} className="mb-2 text-primary" />
            <p className="font-display text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </Link>
        ))}
        <SignOutCard slug={championship.slug} />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface-raised p-4 text-sm text-muted">
        Usa i pulsanti qui sotto per gestire Squadre, Giocatori, Partite, Piscine e il branding di{" "}
        <strong className="text-white">{championship.name}</strong>.
      </div>
    </div>
  );
}
