"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, CalendarClock, Video, Target, Trash2, UserX, Save, Plus, Minus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Match, MatchGoal, MatchStatus, Player, Venue } from "@/lib/supabase/types";

const statusLabels: Record<MatchStatus, string> = {
  scheduled: "Programmata",
  live: "In corso",
  completed: "Terminata",
};

type GoalRow = MatchGoal;

// Converts an ISO timestamp to the `YYYY-MM-DDTHH:mm` format the
// datetime-local input expects, in local time.
function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminMatchEditPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter();

  const [match, setMatch] = useState<Match | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [homeRoster, setHomeRoster] = useState<Player[]>([]);
  const [awayRoster, setAwayRoster] = useState<Player[]>([]);
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateTime, setDateTime] = useState("");
  const [venueId, setVenueId] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [status, setStatus] = useState<MatchStatus>("scheduled");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [{ data: m }, { data: v }, { data: g, error: goalsReadError }] = await Promise.all([
      supabase
        .from("matches")
        .select(
          "*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*), venue:venues(*)"
        )
        .eq("id", params.id)
        .maybeSingle(),
      supabase.from("venues").select("*").order("name"),
      supabase
        .from("match_goals")
        .select("*")
        .eq("match_id", params.id)
        .order("created_at", { ascending: true }),
    ]);

    if (goalsReadError) {
      setGoalError(
        `Impossibile caricare l'elenco gol: ${goalsReadError.message}. Probabile causa: lo schema del database non è aggiornato — esegui la migrazione più recente di supabase/schema.sql.`
      );
    }

    if (m) {
      setMatch(m as any);
      setDateTime(toLocalInputValue((m as any).date_time));
      setVenueId((m as any).venue_id ?? "");
      setStreamUrl((m as any).stream_url ?? "");
      setStatus((m as any).status);

      const [{ data: hp }, { data: ap }] = await Promise.all([
        supabase.from("players").select("*").eq("team_id", (m as any).home_team_id).order("cap_number"),
        supabase.from("players").select("*").eq("team_id", (m as any).away_team_id).order("cap_number"),
      ]);
      setHomeRoster(hp ?? []);
      setAwayRoster(ap ?? []);
    }
    setVenues(v ?? []);
    setGoals((g as any) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const [busy, setBusy] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  // The match score is always DERIVED by counting match_goals rows per
  // team — never adjusted by +1/-1 math, so it can't drift from the ledger.
  // Returns false (and surfaces the error) if the write didn't actually go
  // through, instead of failing silently.
  async function syncScoreFromGoals(): Promise<boolean> {
    if (!match) return false;
    const { data: allGoals, error: readError } = await supabase
      .from("match_goals")
      .select("team_id")
      .eq("match_id", match.id);
    if (readError) {
      setGoalError(`Impossibile leggere i gol: ${readError.message}`);
      return false;
    }
    const homeScore = (allGoals ?? []).filter((g) => g.team_id === match.home_team_id).length;
    const awayScore = (allGoals ?? []).filter((g) => g.team_id === match.away_team_id).length;
    const { error: writeError } = await supabase
      .from("matches")
      .update({ home_score: homeScore, away_score: awayScore })
      .eq("id", match.id);
    if (writeError) {
      setGoalError(`Impossibile aggiornare il risultato: ${writeError.message}`);
      return false;
    }
    return true;
  }

  // Adds a goal for a team, with or without a known scorer: logs the
  // match_goals row, bumps the player's personal tally (if any), then
  // recomputes the match score from the ledger.
  async function addGoal(teamId: string, player: Player | null) {
    if (!match || busy) return;
    setBusy(true);
    setGoalError(null);

    const { error: insertError } = await supabase
      .from("match_goals")
      .insert({ match_id: match.id, team_id: teamId, player_id: player?.id ?? null });
    if (insertError) {
      setGoalError(`Impossibile registrare il gol: ${insertError.message}`);
      setBusy(false);
      return;
    }

    if (player) {
      const { data: freshPlayer } = await supabase.from("players").select("goals_count").eq("id", player.id).single();
      const current = freshPlayer?.goals_count ?? player.goals_count;
      const { error: playerError } = await supabase
        .from("players")
        .update({ goals_count: current + 1 })
        .eq("id", player.id);
      if (playerError) setGoalError(`Gol registrato, ma non ho potuto aggiornare il marcatore: ${playerError.message}`);
    }

    await syncScoreFromGoals();
    await load();
    setBusy(false);
  }

  // Removes a previously logged goal: deletes the match_goals row, restores
  // the player's personal tally (if one was credited), then recomputes the
  // match score from what's left in the ledger.
  async function removeGoal(goal: GoalRow) {
    if (!match || busy) return;
    setBusy(true);
    setGoalError(null);

    const { error: deleteError } = await supabase.from("match_goals").delete().eq("id", goal.id);
    if (deleteError) {
      setGoalError(`Impossibile rimuovere il gol: ${deleteError.message}`);
      setBusy(false);
      return;
    }

    if (goal.player_id) {
      const { data: freshPlayer } = await supabase.from("players").select("goals_count").eq("id", goal.player_id).single();
      if (freshPlayer) {
        const { error: playerError } = await supabase
          .from("players")
          .update({ goals_count: Math.max(0, freshPlayer.goals_count - 1) })
          .eq("id", goal.player_id);
        if (playerError) setGoalError(`Gol rimosso, ma non ho potuto aggiornare il marcatore: ${playerError.message}`);
      }
    }

    await syncScoreFromGoals();
    await load();
    setBusy(false);
  }

  // Used by the "-" button next to a player (or "senza marcatore"): finds
  // that player's most recently logged goal for this match and removes it,
  // without having to go find it in the list below.
  async function removeLastGoalFor(teamId: string, playerId: string | null) {
    if (busy) return;
    const candidates = goals.filter((g) => g.team_id === teamId && g.player_id === playerId);
    const target = candidates[candidates.length - 1];
    if (!target) return;
    await removeGoal(target);
  }

  // Saves date/venue/stream/status, then returns to the match list.
  async function saveMatch() {
    if (!match) return;
    setSaving(true);
    await supabase
      .from("matches")
      .update({
        date_time: dateTime ? new Date(dateTime).toISOString() : null,
        venue_id: venueId || null,
        stream_url: streamUrl.trim() || null,
        status,
      })
      .eq("id", match.id);
    setSaving(false);
    router.push("/admin/matches");
  }

  if (loading) {
    return <p className="text-sm text-muted">Caricamento...</p>;
  }

  if (!match) {
    return (
      <div>
        <p className="text-sm text-muted">Partita non trovata.</p>
        <Link href="/admin/matches" className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
          <ArrowLeft size={13} /> Torna all'elenco
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/matches" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted hover:text-white">
        <ArrowLeft size={14} /> Torna all'elenco partite
      </Link>

      <div className="mb-5 rounded-2xl border border-line bg-surface p-4">
        <p className="text-[11px] uppercase tracking-widest text-muted">
          {match.round_type === "ritorno" ? "Ritorno" : "Andata"} · Giornata {match.giornata}
        </p>
        <p className="mt-1 text-lg font-medium">
          {match.home_team?.name} <span className="text-muted">vs</span> {match.away_team?.name}
        </p>
        <p className="mt-1 font-display tabular text-3xl font-bold text-gold">
          {match.home_score} - {match.away_score}
        </p>
      </div>

      <div className="mb-4 rounded-2xl border border-line bg-surface p-4">
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

        <p className="mb-2 mt-4 flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted">
          <Video size={12} /> Link diretta (opzionale)
        </p>
        <input
          type="url"
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />

        <div className="mt-4 flex gap-2">
          {(["scheduled", "live", "completed"] as MatchStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={clsx(
                "flex-1 rounded-full border px-2 py-1.5 text-[11px] font-medium",
                status === s ? "border-primary bg-primary/15 text-primary" : "border-line text-muted"
              )}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>

        <button
          onClick={saveMatch}
          disabled={saving}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Save size={14} /> {saving ? "Salvataggio..." : "Salva partita e torna all'elenco"}
        </button>
      </div>

      <div className="mb-4 rounded-2xl border border-line bg-surface p-4">
        <p className="mb-2 flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted">
          <Target size={12} /> Gol
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted">{match.home_team?.name}</p>
            <div className="flex items-center justify-between rounded-lg border border-dashed border-line px-2 py-1.5 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <UserX size={13} /> Senza marcatore
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gold">
                  {goals.filter((g) => g.team_id === match.home_team_id && !g.player_id).length}
                </span>
                <button
                  onClick={() => removeLastGoalFor(match.home_team_id, null)}
                  disabled={busy}
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-line hover:border-primary hover:text-primary disabled:opacity-40"
                  aria-label="Togli gol senza marcatore"
                >
                  <Minus size={11} />
                </button>
                <button
                  onClick={() => addGoal(match.home_team_id, null)}
                  disabled={busy}
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-line hover:border-gold hover:text-gold disabled:opacity-40"
                  aria-label="Aggiungi gol senza marcatore"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
            {homeRoster.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-line px-2 py-1.5 text-xs">
                <span>{p.last_name} #{p.cap_number}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gold">
                    {goals.filter((g) => g.player_id === p.id).length}
                  </span>
                  <button
                    onClick={() => removeLastGoalFor(match.home_team_id, p.id)}
                    disabled={busy}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-line hover:border-primary hover:text-primary disabled:opacity-40"
                    aria-label={`Togli gol a ${p.first_name} ${p.last_name}`}
                  >
                    <Minus size={11} />
                  </button>
                  <button
                    onClick={() => addGoal(match.home_team_id, p)}
                    disabled={busy}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-line hover:border-gold hover:text-gold disabled:opacity-40"
                    aria-label={`Aggiungi gol a ${p.first_name} ${p.last_name}`}
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted">{match.away_team?.name}</p>
            <div className="flex items-center justify-between rounded-lg border border-dashed border-line px-2 py-1.5 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <UserX size={13} /> Senza marcatore
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gold">
                  {goals.filter((g) => g.team_id === match.away_team_id && !g.player_id).length}
                </span>
                <button
                  onClick={() => removeLastGoalFor(match.away_team_id, null)}
                  disabled={busy}
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-line hover:border-primary hover:text-primary disabled:opacity-40"
                  aria-label="Togli gol senza marcatore"
                >
                  <Minus size={11} />
                </button>
                <button
                  onClick={() => addGoal(match.away_team_id, null)}
                  disabled={busy}
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-line hover:border-gold hover:text-gold disabled:opacity-40"
                  aria-label="Aggiungi gol senza marcatore"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
            {awayRoster.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-line px-2 py-1.5 text-xs">
                <span>{p.last_name} #{p.cap_number}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gold">
                    {goals.filter((g) => g.player_id === p.id).length}
                  </span>
                  <button
                    onClick={() => removeLastGoalFor(match.away_team_id, p.id)}
                    disabled={busy}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-line hover:border-primary hover:text-primary disabled:opacity-40"
                    aria-label={`Togli gol a ${p.first_name} ${p.last_name}`}
                  >
                    <Minus size={11} />
                  </button>
                  <button
                    onClick={() => addGoal(match.away_team_id, p)}
                    disabled={busy}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-line hover:border-gold hover:text-gold disabled:opacity-40"
                    aria-label={`Aggiungi gol a ${p.first_name} ${p.last_name}`}
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted">
          Gol segnati in questa partita ({goals.length})
        </p>
        {goals.length === 0 ? (
          <p className="text-xs text-muted">Nessun gol registrato ancora.</p>
        ) : (
          <div className="space-y-1.5">
            {goals.map((g) => {
              const isHome = g.team_id === match.home_team_id;
              const teamName = isHome ? match.home_team?.name : match.away_team?.name;
              const scorer = g.player_id ? [...homeRoster, ...awayRoster].find((p) => p.id === g.player_id) : null;
              const label = scorer ? `${scorer.first_name} ${scorer.last_name}` : "Gol senza marcatore";
              return (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-lg border border-line px-2.5 py-1.5 text-xs"
                >
                  <span>
                    <span className="text-muted">{teamName} · </span>
                    {label}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm("Rimuovere questo gol?")) removeGoal(g);
                    }}
                    className="flex items-center gap-1 text-muted hover:text-primary"
                    aria-label="Rimuovi gol"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
