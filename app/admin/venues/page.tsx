"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AdminError from "@/components/AdminError";
import { useAdminTournament } from "@/components/admin/AdminTournament";
import type { Venue } from "@/lib/supabase/types";

export default function AdminVenuesPage() {
  const supabase = createClient();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [form, setForm] = useState({ name: "", location_tag: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { current } = useAdminTournament();
  const tournamentId = current?.id;

  async function load() {
    if (!tournamentId) return;
    const { data, error: loadError } = await supabase
      .from("venues")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("name");
    if (loadError) setError(`Impossibile caricare le piscine: ${loadError.message}`);
    setVenues(data ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !tournamentId) return;
    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from("venues").insert({
      tournament_id: tournamentId,
      name: form.name.trim(),
      location_tag: form.location_tag.trim() || null,
      address: form.address.trim() || null,
    });
    setSaving(false);
    if (insertError) {
      setError(`Salvataggio non riuscito: ${insertError.message}`);
      return;
    }
    setForm({ name: "", location_tag: "", address: "" });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questa piscina?")) return;
    setError(null);
    const { error: deleteError } = await supabase.from("venues").delete().eq("id", id);
    if (deleteError) {
      setError(`Eliminazione non riuscita: ${deleteError.message}`);
      return;
    }
    load();
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">Piscine</h2>

      <AdminError message={error} />

      <form onSubmit={handleAdd} className="mb-6 max-w-xl space-y-2 rounded-2xl border border-line bg-surface p-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nome Piscina (es. Stadio del Nuoto)"
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          value={form.location_tag}
          onChange={(e) => setForm({ ...form, location_tag: e.target.value })}
          placeholder="Tag (es. Molo San Nicola Sea Field)"
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Indirizzo"
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Plus size={15} /> {saving ? "Salvataggio..." : "Aggiungi piscina"}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
        {venues.map((v) => (
          <div key={v.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
            <div className="flex-1">
              <p className="text-sm font-medium">{v.name}</p>
              {v.location_tag && <p className="text-[11px] text-muted">{v.location_tag}</p>}
            </div>
            <button onClick={() => handleDelete(v.id)} className="text-muted hover:text-primary">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
