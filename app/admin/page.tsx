import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getTournaments } from "@/lib/queries";
import { ADMIN_TOURNAMENT_COOKIE } from "@/lib/admin-tournament";
import { Users, UserRound, MapPinned, Radio, CalendarDays, Goal, Newspaper } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = createClient();

  // The dashboard counts the tournament selected in the Admin header.
  const { tournaments } = await getTournaments();
  const cookieId = cookies().get(ADMIN_TOURNAMENT_COOKIE)?.value;
  const tournament = tournaments.find((t) => t.id === cookieId) ?? tournaments[0] ?? null;
  const tid = tournament?.id ?? "";

  const [teamsRes, venues, matchesRes, news] = await Promise.all([
    supabase.from("teams").select("id").eq("tournament_id", tid),
    supabase.from("venues").select("*", { count: "exact", head: true }).eq("tournament_id", tid),
    supabase.from("matches").select("status, home_score, away_score").eq("tournament_id", tid),
    supabase.from("news_posts").select("*", { count: "exact", head: true }).eq("tournament_id", tid),
  ]);

  const teamIds = (teamsRes.data ?? []).map((t: { id: string }) => t.id);
  // Players belong to a tournament through their team.
  const playersCount = teamIds.length
    ? (await supabase.from("players").select("*", { count: "exact", head: true }).in("team_id", teamIds)).count ?? 0
    : 0;

  const matchRows = (matchesRes.data ?? []) as { status: string; home_score: number; away_score: number }[];
  // Match scores are derived from the goal ledger, so the goals of a
  // tournament are the sum of its match scores.
  const goalsTotal = matchRows.reduce((sum, m) => sum + (m.home_score ?? 0) + (m.away_score ?? 0), 0);
  const liveCount = matchRows.filter((m) => m.status === "live").length;

  const stats = [
    { label: "Squadre", value: teamIds.length, icon: Users },
    { label: "Giocatori", value: playersCount, icon: UserRound },
    { label: "Piscine", value: venues.count ?? 0, icon: MapPinned },
    { label: "Partite", value: matchRows.length, icon: CalendarDays },
    { label: "Match live", value: liveCount, icon: Radio },
    { label: "Gol fatti", value: goalsTotal, icon: Goal },
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
