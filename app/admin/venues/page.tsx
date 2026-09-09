"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Venue } from "@/lib/supabase/types";

export default function AdminVenuesPage() {
  const supabase = createClient();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [form, setForm] = useState({ name: "", location_tag: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("venues").select("*").order("name");
    setVenues(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(venue: Venue) {
    setEditingId(venue.id);
    setForm({
      name: venue.name,
      location_tag: venue.location_tag ?? "",
      address: venue.address ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", location_tag: "", address: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      location_tag: form.location_tag.trim() || null,
      address: form.address.trim() || null,
    };

    if (editingId) {
      await supabase.from("venues").update(payload).eq("id", editingId);
    } else {
      await supabase.from("venues").insert(payload);
    }

    cancelEdit();
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questa piscina?")) return;
    await supabase.from("venues").delete().eq("id", id);
    if (editingId === id) cancelEdit();
    load();
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">Piscine</h2>

      <form onSubmit={handleSubmit} className="mb-6 max-w-xl space-y-2 rounded-2xl border border-line bg-surface p-4">
        {editingId && (
          <div className="mb-1 flex items-center justify-between text-xs text-gold">
            <span>Modifica piscina</span>
            <button type="button" onClick={cancelEdit} className="flex items-center gap-1 text-muted hover:text-white">
              <X size={13} /> Annulla
            </button>
          </div>
        )}
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
          <Plus size={15} /> {saving ? "Salvataggio..." : editingId ? "Salva modifiche" : "Aggiungi piscina"}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
        {venues.map((v) => (
          <div key={v.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
            <div className="flex-1">
              <p className="text-sm font-medium">{v.name}</p>
              {v.location_tag && <p className="text-[11px] text-muted">{v.location_tag}</p>}
            </div>
            <button onClick={() => startEdit(v)} className="text-muted hover:text-gold">
              <Pencil size={16} />
            </button>
            <button onClick={() => handleDelete(v.id)} className="text-muted hover:text-primary">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
