"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Plus, Minus, Target, CalendarClock, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Match, MatchStatus, Player, Venue } from "@/lib/supabase/types";

const statusLabels: Record<MatchStatus, string> = {
  scheduled: "Programmata",
  live: "In corso",
  completed: "Terminata",
};

// Converts an ISO timestamp to the `YYYY-MM-DDTHH:mm` format the
// datetime-local input expects, in local time.
function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MatchResultEditor({
  match,
  venues,
  onStatusChange,
  onSaved,
}: {
  match: Match;
  venues: Venue[];
  onStatusChange: (status: MatchStatus) => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [homeScore, setHomeScore] = useState(match.home_score);
  const [awayScore, setAwayScore] = useState(match.away_score);
  const [homeRoster, setHomeRoster] = useState<Player[]>([]);
  const [awayRoster, setAwayRoster] = useState<Player[]>([]);
  const [dateTime, setDateTime] = useState(toLocalInputValue(match.date_time));
  const [venueId, setVenueId] = useState(match.venue_id ?? "");
  const [savingDetails, setSavingDetails] = useState(false);

  const needsDetails = !match.date_time || !match.venue_id;

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

  async function saveDetails() {
    setSavingDetails(true);
    await supabase
      .from("matches")
      .update({
        date_time: dateTime ? new Date(dateTime).toISOString() : null,
        venue_id: venueId || null,
      })
      .eq("id", match.id);
    setSavingDetails(false);
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
    <div className={clsx("rounded-2xl border bg-surface p-4", needsDetails ? "border-gold/50" : "border-line")}>
      <button className="flex w-full items-center justify-between text-left" onClick={() => setExpanded((v) => !v)}>
        <div>
          <p className="text-sm font-medium">
            {match.home_team?.name} <span className="text-muted">vs</span> {match.away_team?.name}
          </p>
          <p className="text-[11px] text-muted">
            {match.date_time ? new Date(match.date_time).toLocaleString("it-IT") : "Data da definire"}
            {" · "}
            {statusLabels[match.status]}
            {needsDetails && <span className="ml-1 text-gold">· da completare</span>}
          </p>
        </div>
        <span className="font-display tabular text-lg font-bold text-gold">
          {match.home_score}-{match.away_score}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-line pt-4">
          <div>
            <p className="mb-2 flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted">
              <CalendarClock size={12} /> Data e piscina
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="flex-1 rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="flex-1 rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Campo da definire</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={saveDetails}
              disabled={savingDetails}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gold/50 bg-gold/10 py-2 text-xs font-semibold text-gold disabled:opacity-60"
            >
              <Save size={13} /> {savingDetails ? "Salvataggio..." : "Salva data e piscina"}
            </button>
          </div>

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
