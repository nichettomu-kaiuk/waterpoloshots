import { createClient } from "@/lib/supabase/server";
import { getChampionshipOrNotFound } from "@/lib/championship";
import { Users, UserRound, MapPinned, Radio } from "lucide-react";

export default async function AdminChampionshipDashboard({ params }: { params: { slug: string } }) {
  const championship = await getChampionshipOrNotFound(params.slug);
  const supabase = createClient();

  const [teams, players, venues, liveMatches] = await Promise.all([
    supabase.from("teams").select("*", { count: "exact", head: true }).eq("championship_id", championship.id),
    supabase.from("players").select("*, team:teams!inner(*)", { count: "exact", head: true }).eq("team.championship_id", championship.id),
    supabase.from("venues").select("*", { count: "exact", head: true }).eq("championship_id", championship.id),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("championship_id", championship.id).eq("status", "live"),
  ]);

  const stats = [
    { label: "Squadre", value: teams.count ?? 0, icon: Users },
    { label: "Giocatori", value: players.count ?? 0, icon: UserRound },
    { label: "Campi", value: venues.count ?? 0, icon: MapPinned },
    { label: "Match live", value: liveMatches.count ?? 0, icon: Radio },
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
        Usa il menu qui sopra per gestire partite, squadre, giocatori, campi e il branding di{" "}
        <strong className="text-white">{championship.name}</strong>.
      </div>
    </div>
  );
}
