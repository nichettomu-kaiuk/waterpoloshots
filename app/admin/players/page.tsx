"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Player, PlayerRole, Team } from "@/lib/supabase/types";

const roles: PlayerRole[] = ["portiere", "difensore", "centroboa", "attaccante"];

export default function AdminPlayersPage() {
  const supabase = createClient();
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<(Player & { team?: Team })[]>([]);
  const [form, setForm] = useState({
    team_id: "",
    first_name: "",
    last_name: "",
    cap_number: "",
    position: "attaccante" as PlayerRole,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [{ data: teamsData }, { data: playersData }] = await Promise.all([
      supabase.from("teams").select("*").order("name"),
      supabase.from("players").select("*, team:teams(*)").order("last_name"),
    ]);
    setTeams(teamsData ?? []);
    setPlayers((playersData as any) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.team_id || !form.first_name || !form.last_name || !form.cap_number) return;
    setSaving(true);

    let photo_url: string | null = null;
    if (photoFile) {
      const path = `players/${Date.now()}-${photoFile.name}`;
      const { error: uploadError } = await supabase.storage.from("branding").upload(path, photoFile);
      if (!uploadError) {
        photo_url = supabase.storage.from("branding").getPublicUrl(path).data.publicUrl;
      }
    }

    await supabase.from("players").insert({
      team_id: form.team_id,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      cap_number: Number(form.cap_number),
      position: form.position,
      photo_url,
      goals_count: 0,
    });

    setForm({ team_id: form.team_id, first_name: "", last_name: "", cap_number: "", position: "attaccante" });
    setPhotoFile(null);
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo giocatore?")) return;
    await supabase.from("players").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">Giocatori</h2>

      <form onSubmit={handleAdd} className="mb-6 max-w-xl space-y-2 rounded-2xl border border-line bg-surface p-4">
        <select
          value={form.team_id}
          onChange={(e) => setForm({ ...form, team_id: e.target.value })}
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">Seleziona squadra</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            placeholder="Nome"
            className="w-1/2 rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            placeholder="Cognome"
            className="w-1/2 rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={form.cap_number}
            onChange={(e) => setForm({ ...form, cap_number: e.target.value })}
            placeholder="N. calottina"
            className="w-1/2 rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value as PlayerRole })}
            className="w-1/2 rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs text-muted">
          <Upload size={14} />
          {photoFile ? photoFile.name : "Carica foto (opzionale)"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Plus size={15} /> {saving ? "Salvataggio..." : "Aggiungi giocatore"}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
        {players.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
            {p.photo_url ? (
              <Image src={p.photo_url} alt={p.first_name} width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-xs text-muted">
                {p.cap_number}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{p.first_name} {p.last_name}</p>
              <p className="text-[11px] text-muted">{p.team?.name} · {p.goals_count} gol</p>
            </div>
            <button onClick={() => handleDelete(p.id)} className="text-muted hover:text-primary">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
