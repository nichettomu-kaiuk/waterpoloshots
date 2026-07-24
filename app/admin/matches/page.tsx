"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Match, MatchStatus, RoundType, Team, Venue } from "@/lib/supabase/types";
import MatchResultEditor from "./MatchResultEditor";

export default function AdminMatchesPage() {
  const supabase = createClient();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [form, setForm] = useState({
    home_team_id: "",
    away_team_id: "",
    venue_id: "",
    date_time: "",
    round_type: "andata" as RoundType,
    giornata: "1",
  });
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function load() {
    const [{ data: m }, { data: t }, { data: v }] = await Promise.all([
      supabase
        .from("matches")
        .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*), venue:venues(*)")
        .order("giornata", { ascending: true })
        .order("date_time", { ascending: true }),
      supabase.from("teams").select("*").order("name"),
      supabase.from("venues").select("*").order("name"),
    ]);
    setMatches((m as any) ?? []);
    setTeams(t ?? []);
    setVenues(v ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.home_team_id || !form.away_team_id || !form.date_time) return;
    if (form.home_team_id === form.away_team_id) {
      alert("Seleziona due squadre diverse.");
      return;
    }
    setSaving(true);
    await supabase.from("matches").insert({
      home_team_id: form.home_team_id,
      away_team_id: form.away_team_id,
      venue_id: form.venue_id || null,
      date_time: new Date(form.date_time).toISOString(),
      round_type: form.round_type,
      giornata: Number(form.giornata) || 1,
      status: "scheduled",
      home_score: 0,
      away_score: 0,
    });
    setForm({ ...form, home_team_id: "", away_team_id: "", date_time: "" });
    setSaving(false);
    load();
  }

  // Auto-generates the Girone di Ritorno: for every Andata fixture, creates
  // the mirrored fixture (home/away swapped, same giornata number) if it
  // doesn't already exist. Date and venue are left empty on purpose — the
  // admin only has to fill those in per match.
  async function handleGenerateRitorno() {
    setGenerating(true);
    const andata = matches.filter((m) => m.round_type === "andata");
    const ritorno = matches.filter((m) => m.round_type === "ritorno");

    const existingKeys = new Set(
      ritorno.map((m) => `${m.giornata}-${m.home_team_id}-${m.away_team_id}`)
    );

    const toInsert = andata
      .filter((m) => !existingKeys.has(`${m.giornata}-${m.away_team_id}-${m.home_team_id}`))
      .map((m) => ({
        home_team_id: m.away_team_id,
        away_team_id: m.home_team_id,
        venue_id: null,
        date_time: null,
        round_type: "ritorno" as RoundType,
        giornata: m.giornata,
        status: "scheduled" as MatchStatus,
        home_score: 0,
        away_score: 0,
      }));

    if (toInsert.length === 0) {
      alert(
        andata.length === 0
          ? "Crea prima le partite del Girone di Andata."
          : "Le partite di Ritorno sono già state generate per tutte le giornate di Andata."
      );
      setGenerating(false);
      return;
    }

    const { error } = await supabase.from("matches").insert(toInsert);
    setGenerating(false);
    if (error) {
      alert(`Generazione fallita: ${error.message}`);
      return;
    }
    alert(`Create ${toInsert.length} partite di Ritorno. Inserisci data e piscina per ciascuna.`);
    load();
  }

  async function updateStatus(matchId: string, status: MatchStatus) {
    await supabase.from("matches").update({ status }).eq("id", matchId);
    load();
  }

  // Girone di Andata first, then Girone di Ritorno; within each, grouped by
  // giornata number ascending.
  const groupedByGirone = useMemo(() => {
    const girons: RoundType[] = ["andata", "ritorno"];
    return girons.map((round) => {
      const roundMatches = matches.filter((m) => m.round_type === round);
      const giornateMap = new Map<number, Match[]>();
      for (const m of roundMatches) {
        const list = giornateMap.get(m.giornata) ?? [];
        list.push(m);
        giornateMap.set(m.giornata, list);
      }
      const giornate = Array.from(giornateMap.entries()).sort((a, b) => a[0] - b[0]);
      return { round, giornate };
    });
  }, [matches]);

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">Partite</h2>

      <form onSubmit={handleAdd} className="mb-4 max-w-xl space-y-2 rounded-2xl border border-line bg-surface p-4">
        <div className="flex gap-2">
          <select
            value={form.home_team_id}
            onChange={(e) => setForm({ ...form, home_team_id: e.target.value })}
            className="w-1/2 rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Squadra casa</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select
            value={form.away_team_id}
            onChange={(e) => setForm({ ...form, away_team_id: e.target.value })}
            className="w-1/2 rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Squadra ospite</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <select
          value={form.venue_id}
          onChange={(e) => setForm({ ...form, venue_id: e.target.value })}
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">Campo (opzionale)</option>
          {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={form.date_time}
            onChange={(e) => setForm({ ...form, date_time: e.target.value })}
            className="w-1/2 rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            type="number"
            min={1}
            value={form.giornata}
            onChange={(e) => setForm({ ...form, giornata: e.target.value })}
            placeholder="Giornata"
            className="w-1/4 rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={form.round_type}
            onChange={(e) => setForm({ ...form, round_type: e.target.value as RoundType })}
            className="w-1/4 rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="andata">Andata</option>
            <option value="ritorno">Ritorno</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Plus size={15} /> {saving ? "Salvataggio..." : "Crea match"}
        </button>
      </form>

      <button
        onClick={handleGenerateRitorno}
        disabled={generating}
        className="mb-6 flex w-full max-w-xl items-center justify-center gap-1.5 rounded-xl border border-gold/50 bg-gold/10 py-2 text-sm font-semibold text-gold disabled:opacity-60"
      >
        <Wand2 size={15} /> {generating ? "Generazione..." : "Genera calendario di Ritorno"}
      </button>

      {matches.length === 0 ? (
        <p className="text-sm text-muted">Nessuna partita creata ancora.</p>
      ) : (
        <div className="space-y-8">
          {groupedByGirone.map(({ round, giornate }) =>
            giornate.length === 0 ? null : (
              <div key={round}>
                <h3 className="mb-3 font-display text-base font-bold uppercase tracking-wide text-gold">
                  Girone di {round === "andata" ? "Andata" : "Ritorno"}
                </h3>
                <div className="space-y-6">
                  {giornate.map(([giornataNum, giornataMatches]) => (
                    <div key={giornataNum}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                        Giornata {giornataNum}
                      </p>
                      <div className="space-y-3">
                        {giornataMatches.map((m) => (
                          <MatchResultEditor
                            key={m.id}
                            match={m}
                            venues={venues}
                            onStatusChange={(status) => updateStatus(m.id, status)}
                            onSaved={load}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
