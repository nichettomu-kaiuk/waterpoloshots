"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Pencil, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Team, Venue } from "@/lib/supabase/types";

export default function AdminTeamsPage() {
  const supabase = createClient();
  const [teams, setTeams] = useState<(Team & { venue?: Venue })[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [name, setName] = useState("");
  const [venueId, setVenueId] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    const [{ data: t }, { data: v }] = await Promise.all([
      supabase.from("teams").select("*, venue:venues(*)").order("name"),
      supabase.from("venues").select("*").order("name"),
    ]);
    setTeams((t as any) ?? []);
    setVenues(v ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(team: Team) {
    setEditingId(team.id);
    setName(team.name);
    setVenueId(team.venue_id ?? "");
    setLogoFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setVenueId("");
    setLogoFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    let logo_url: string | null | undefined = undefined;
    if (logoFile) {
      const path = `teams/${Date.now()}-${logoFile.name}`;
      const { error: uploadError } = await supabase.storage.from("branding").upload(path, logoFile);
      if (!uploadError) {
        logo_url = supabase.storage.from("branding").getPublicUrl(path).data.publicUrl;
      }
    }

    if (editingId) {
      await supabase
        .from("teams")
        .update({
          name: name.trim(),
          venue_id: venueId || null,
          ...(logo_url !== undefined ? { logo_url } : {}),
        })
        .eq("id", editingId);
    } else {
      await supabase.from("teams").insert({
        name: name.trim(),
        venue_id: venueId || null,
        logo_url: logo_url ?? null,
      });
    }

    cancelEdit();
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questa squadra e tutti i giocatori collegati?")) return;
    await supabase.from("teams").delete().eq("id", id);
    if (editingId === id) cancelEdit();
    load();
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">Squadre</h2>

      <form onSubmit={handleSubmit} className="mb-6 max-w-xl space-y-2 rounded-2xl border border-line bg-surface p-4">
        {editingId && (
          <div className="mb-1 flex items-center justify-between text-xs text-gold">
            <span>Modifica squadra</span>
            <button type="button" onClick={cancelEdit} className="flex items-center gap-1 text-muted hover:text-white">
              <X size={13} /> Annulla
            </button>
          </div>
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome squadra"
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">Piscina di riferimento (opzionale)</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs text-muted">
          <Upload size={14} />
          {logoFile ? logoFile.name : editingId ? "Sostituisci logo (opzionale)" : "Carica logo (opzionale)"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Plus size={15} /> {saving ? "Salvataggio..." : editingId ? "Salva modifiche" : "Aggiungi squadra"}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
        {teams.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
            {t.logo_url ? (
              <Image src={t.logo_url} alt={t.name} width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-xs text-muted">
                {t.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{t.name}</p>
              {t.venue && <p className="truncate text-[11px] text-muted">{t.venue.name}</p>}
            </div>
            <button onClick={() => startEdit(t)} className="text-muted hover:text-gold">
              <Pencil size={16} />
            </button>
            <button onClick={() => handleDelete(t.id)} className="text-muted hover:text-primary">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
