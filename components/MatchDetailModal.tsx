"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Clock, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Match } from "@/lib/supabase/types";
import LiveBadge from "./LiveBadge";

type ScorerLine = { name: string; count: number };

export default function MatchDetailModal({ match, onClose }: { match: Match; onClose: () => void }) {
  const date = match.date_time ? new Date(match.date_time) : null;
  const roundLabel = match.round_type === "ritorno" ? "Ritorno" : "Andata";
  const showScorers = match.status === "live" || match.status === "completed";

  const [homeScorers, setHomeScorers] = useState<ScorerLine[]>([]);
  const [awayScorers, setAwayScorers] = useState<ScorerLine[]>([]);
  const [loadingScorers, setLoadingScorers] = useState(showScorers);

  useEffect(() => {
    if (!showScorers) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("match_goals")
        .select("team_id, player:players(first_name, last_name)")
        .eq("match_id", match.id);

      if (cancelled) return;

      // Tallies goals per player within each team, so a player who scored
      // twice shows once as "Cognome x2" instead of two separate lines.
      const tally = (teamId: string): ScorerLine[] => {
        const counts = new Map<string, number>();
        for (const g of (data as any[]) ?? []) {
          if (g.team_id !== teamId || !g.player) continue;
          const name = `${g.player.first_name} ${g.player.last_name}`;
          counts.set(name, (counts.get(name) ?? 0) + 1);
        }
        return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
      };

      setHomeScorers(tally(match.home_team_id));
      setAwayScorers(tally(match.away_team_id));
      setLoadingScorers(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [match.id, match.home_team_id, match.away_team_id, showScorers]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={onClose}>
      <div
        className="w-full max-w-md animate-rise rounded-t-3xl border-t border-line bg-surface p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          {match.status === "live" ? (
            <LiveBadge />
          ) : (
            <span className="text-xs uppercase tracking-widest text-muted">
              {match.status === "completed" ? "Terminata" : "Programmata"}
            </span>
          )}
          <span className="text-[11px] font-medium text-gold">
            {roundLabel} · Giornata {match.giornata}
          </span>
          <button onClick={onClose} className="text-muted hover:text-white" aria-label="Chiudi">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="mx-auto mb-2 h-14 w-14 rounded-full border border-line bg-surface-raised" />
            <p className="text-sm font-medium">{match.home_team?.name ?? "TBD"}</p>
          </div>
          <div className="px-4 text-center">
            <p className="font-display tabular text-3xl font-bold">
              {match.status === "scheduled" ? "—" : `${match.home_score} : ${match.away_score}`}
            </p>
          </div>
          <div className="flex-1 text-center">
            <div className="mx-auto mb-2 h-14 w-14 rounded-full border border-line bg-surface-raised" />
            <p className="text-sm font-medium">{match.away_team?.name ?? "TBD"}</p>
          </div>
        </div>

        {showScorers && (
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted">
              <Target size={12} /> Marcatori
            </p>
            {loadingScorers ? (
              <p className="text-xs text-muted">Caricamento...</p>
            ) : homeScorers.length === 0 && awayScorers.length === 0 ? (
              <p className="text-xs text-muted">Nessun gol registrato.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  {homeScorers.map((s) => (
                    <p key={s.name} className="text-muted">
                      {s.name}
                      {s.count > 1 && <span className="text-gold"> x{s.count}</span>}
                    </p>
                  ))}
                </div>
                <div className="space-y-1 text-right">
                  {awayScorers.map((s) => (
                    <p key={s.name} className="text-muted">
                      {s.count > 1 && <span className="text-gold">x{s.count} </span>}
                      {s.name}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 rounded-2xl border border-line bg-surface-raised p-4 text-sm">
          <div className="flex items-center gap-2 text-muted">
            <Clock size={15} />
            {date
              ? `${date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })} · ${date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`
              : "Data da definire"}
          </div>
          {match.venue && (
            <div className="flex items-center gap-2 text-muted">
              <MapPin size={15} />
              {match.venue.name}
              {match.venue.location_tag ? ` · ${match.venue.location_tag}` : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
