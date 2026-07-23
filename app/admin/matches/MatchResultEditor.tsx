"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Plus, Minus, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Match, MatchStatus, Player } from "@/lib/supabase/types";

const statusLabels: Record<MatchStatus, string> = {
  scheduled: "Programmata",
  live: "In corso",
  completed: "Terminata",
};

export default function MatchResultEditor({
  match,
  onStatusChange,
  onSaved,
}: {
  match: Match;
  onStatusChange: (status: MatchStatus) => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [homeScore, setHomeScore] = useState(match.home_score);
  const [awayScore, setAwayScore] = useState(match.away_score);
  const [homeRoster, setHomeRoster] = useState<Player[]>([]);
  const [awayRoster, setAwayRoster] = useState<Player[]>([]);

  useEffect(() => {
    if (!expanded) return;
    (async () => {
      const [{ data: hp }, { data: ap }] = await Promise.all([
        supabase.from("players").select("*").eq("team_id", match.home_team_id),
        supabase.from("players").select("*").eq("team_id", match.away_team_id),
      ]);
      setHomeRoster(hp ?? []);
      setAwayRoster(ap ?? []);
    })();
  }, [expanded]);

  async function saveScore() {
    await supabase.from("matches").update({ home_score: homeScore, away_score: awayScore }).eq("id", match.id);
    onSaved();
  }

  // Assigns a goal to a player: bumps their goal tally and logs the event,
  // which keeps the top-scorers table (`getTopScorers`) accurate in real time.
  async function assignGoal(player: Player, teamId: string) {
    await supabase.from("match_goals").insert({ match_id: match.id, player_id: player.id, team_id: teamId });
    await supabase.from("players").update({ goals_count: player.goals_count + 1 }).eq("id", player.id);

    if (teamId === match.home_team_id) {
      const next = homeScore + 1;
      setHomeScore(next);
      await supabase.from("matches").update({ home_score: next }).eq("id", match.id);
    } else {
      const next = awayScore + 1;
      setAwayScore(next);
      await supabase.from("matches").update({ away_score: next }).eq("id", match.id);
    }

    setHomeRoster((r) => r.map((p) => (p.id === player.id ? { ...p, goals_count: p.goals_count + 1 } : p)));
    setAwayRoster((r) => r.map((p) => (p.id === player.id ? { ...p, goals_count: p.goals_count + 1 } : p)));
    onSaved();
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <button className="flex w-full items-center justify-between text-left" onClick={() => setExpanded((v) => !v)}>
        <div>
          <p className="text-sm font-medium">
            {match.home_team?.name} <span className="text-muted">vs</span> {match.away_team?.name}
          </p>
          <p className="text-[11px] text-muted">
            {new Date(match.date_time).toLocaleString("it-IT")} · {statusLabels[match.status]}
          </p>
        </div>
        <span className="font-display tabular text-lg font-bold text-gold">
          {match.home_score}-{match.away_score}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-line pt-4">
          <div className="flex gap-2">
            {(["scheduled", "live", "completed"] as MatchStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={clsx(
                  "flex-1 rounded-full border px-2 py-1.5 text-[11px] font-medium",
                  match.status === s ? "border-primary bg-primary/15 text-primary" : "border-line text-muted"
                )}
              >
                {statusLabels[s]}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <button onClick={() => setHomeScore((v) => Math.max(0, v - 1))} className="rounded-full border border-line p-1.5"><Minus size={14} /></button>
              <span className="font-display tabular w-6 text-center text-xl font-bold">{homeScore}</span>
              <button onClick={() => setHomeScore((v) => v + 1)} className="rounded-full border border-line p-1.5"><Plus size={14} /></button>
            </div>
            <span className="text-muted">-</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setAwayScore((v) => Math.max(0, v - 1))} className="rounded-full border border-line p-1.5"><Minus size={14} /></button>
              <span className="font-display tabular w-6 text-center text-xl font-bold">{awayScore}</span>
              <button onClick={() => setAwayScore((v) => v + 1)} className="rounded-full border border-line p-1.5"><Plus size={14} /></button>
            </div>
          </div>
          <button onClick={saveScore} className="w-full rounded-xl border border-line py-2 text-xs font-medium text-muted hover:border-primary hover:text-white">
            Salva punteggio manuale
          </button>

          <div>
            <p className="mb-2 flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted">
              <Target size={12} /> Assegna gol
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted">{match.home_team?.name}</p>
                {homeRoster.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => assignGoal(p, match.home_team_id)}
                    className="flex w-full items-center justify-between rounded-lg border border-line px-2 py-1.5 text-xs"
                  >
                    <span>{p.last_name} #{p.cap_number}</span>
                    <span className="text-gold">{p.goals_count}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted">{match.away_team?.name}</p>
                {awayRoster.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => assignGoal(p, match.away_team_id)}
                    className="flex w-full items-center justify-between rounded-lg border border-line px-2 py-1.5 text-xs"
                  >
                    <span>{p.last_name} #{p.cap_number}</span>
                    <span className="text-gold">{p.goals_count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
