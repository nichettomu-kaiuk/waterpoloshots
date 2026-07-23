"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Team } from "@/lib/supabase/types";

export default function AdminTeamsPage() {
  const supabase = createClient();
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("teams").select("*").order("name");
    setTeams(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    let logo_url: string | null = null;
    if (logoFile) {
      const path = `teams/${Date.now()}-${logoFile.name}`;
      const { error: uploadError } = await supabase.storage.from("branding").upload(path, logoFile);
      if (!uploadError) {
        logo_url = supabase.storage.from("branding").getPublicUrl(path).data.publicUrl;
      }
    }

    await supabase.from("teams").insert({ name: name.trim(), logo_url });
    setName("");
    setLogoFile(null);
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questa squadra e tutti i giocatori collegati?")) return;
    await supabase.from("teams").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">Squadre</h2>

      <form onSubmit={handleAdd} className="mb-6 space-y-2 rounded-2xl border border-line bg-surface p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome squadra"
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs text-muted">
          <Upload size={14} />
          {logoFile ? logoFile.name : "Carica logo (opzionale)"}
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
          <Plus size={15} /> {saving ? "Salvataggio..." : "Aggiungi squadra"}
        </button>
      </form>

      <div className="space-y-2">
        {teams.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
            {t.logo_url ? (
              <Image src={t.logo_url} alt={t.name} width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-xs text-muted">
                {t.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="flex-1 text-sm font-medium">{t.name}</span>
            <button onClick={() => handleDelete(t.id)} className="text-muted hover:text-primary">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
