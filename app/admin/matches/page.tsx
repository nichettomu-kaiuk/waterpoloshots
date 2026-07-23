"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
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
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    const [{ data: m }, { data: t }, { data: v }] = await Promise.all([
      supabase
        .from("matches")
        .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*), venue:venues(*)")
        .order("date_time", { ascending: false }),
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
      status: "scheduled",
      home_score: 0,
      away_score: 0,
    });
    setForm({ ...form, home_team_id: "", away_team_id: "", date_time: "" });
    setSaving(false);
    load();
  }

  async function updateStatus(matchId: string, status: MatchStatus) {
    await supabase.from("matches").update({ status }).eq("id", matchId);
    load();
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">Partite</h2>

      <form onSubmit={handleAdd} className="mb-6 max-w-xl space-y-2 rounded-2xl border border-line bg-surface p-4">
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
          <select
            value={form.round_type}
            onChange={(e) => setForm({ ...form, round_type: e.target.value as RoundType })}
            className="w-1/2 rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
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

      <div className="space-y-3">
        {matches.map((m) => (
          <MatchResultEditor
            key={m.id}
            match={m}
            onStatusChange={(status) => updateStatus(m.id, status)}
            onSaved={load}
          />
        ))}
      </div>
    </div>
  );
}
