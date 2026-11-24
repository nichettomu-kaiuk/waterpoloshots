import { createClient } from "@/lib/supabase/server";
import { Users, UserRound, MapPinned, Radio, CalendarDays, Goal, Newspaper } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = createClient();

  const [teams, players, venues, matches, liveMatches, goals, news] = await Promise.all([
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("players").select("*", { count: "exact", head: true }),
    supabase.from("venues").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "live"),
    // Every goal is one row in match_goals (with or without a known scorer).
    supabase.from("match_goals").select("*", { count: "exact", head: true }),
    supabase.from("news_posts").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Squadre", value: teams.count ?? 0, icon: Users },
    { label: "Giocatori", value: players.count ?? 0, icon: UserRound },
    { label: "Piscine", value: venues.count ?? 0, icon: MapPinned },
    { label: "Partite", value: matches.count ?? 0, icon: CalendarDays },
    { label: "Match live", value: liveMatches.count ?? 0, icon: Radio },
    { label: "Gol fatti", value: goals.count ?? 0, icon: Goal },
    { label: "News", value: news.count ?? 0, icon: Newspaper },
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
        Usa il menu qui sopra per gestire partite, squadre, giocatori, piscine, news e il branding del torneo.
      </div>
    </div>
  );
}
