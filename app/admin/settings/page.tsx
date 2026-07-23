"use client";

import { useEffect, useState } from "react";
import { Upload, Save, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Settings } from "@/lib/supabase/types";

const emptySettings: Omit<Settings, "id"> = {
  tournament_title: "Torneo di Pallanuoto",
  tournament_subtitle: "",
  logo_url: null,
  home_bg_url: null,
  header_bg_url: null,
  primary_color: "#e10f21",
  secondary_color: "#d4af37",
  active_round: "Girone di andata",
};

export default function AdminSettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [form, setForm] = useState(emptySettings);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle();
      if (data) {
        setSettingsId(data.id);
        setForm(data);
      }
    })();
  }, []);

  async function uploadImage(file: File, folder: string) {
    const path = `${folder}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("branding").upload(path, file);
    if (error) return null;
    return supabase.storage.from("branding").getPublicUrl(path).data.publicUrl;
  }

  async function handleFile(field: "logo_url" | "home_bg_url" | "header_bg_url", file: File | null) {
    if (!file) return;
    const url = await uploadImage(file, field);
    if (url) setForm((f) => ({ ...f, [field]: url }));
  }

  async function handleSave() {
    setSaving(true);
    if (settingsId) {
      await supabase.from("settings").update(form).eq("id", settingsId);
    } else {
      const { data } = await supabase.from("settings").insert(form).select().single();
      if (data) setSettingsId(data.id);
    }
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 1800);
    router.refresh();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-bold">Branding &amp; impostazioni</h2>

      <div className="space-y-2 rounded-2xl border border-line bg-surface p-4">
        <label className="block text-xs text-muted">Titolo torneo</label>
        <input
          value={form.tournament_title}
          onChange={(e) => setForm({ ...form, tournament_title: e.target.value })}
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <label className="block text-xs text-muted">Sottotitolo</label>
        <input
          value={form.tournament_subtitle ?? ""}
          onChange={(e) => setForm({ ...form, tournament_subtitle: e.target.value })}
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <label className="block text-xs text-muted">Giornata attiva</label>
        <input
          value={form.active_round ?? ""}
          onChange={(e) => setForm({ ...form, active_round: e.target.value })}
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <p className="text-xs uppercase tracking-widest text-muted">Colori brand</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-[11px] text-muted">Primario (CTA)</label>
            <input
              type="color"
              value={form.primary_color ?? "#e10f21"}
              onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
              className="h-10 w-full rounded-lg border border-line bg-surface-raised"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[11px] text-muted">Oro (podi)</label>
            <input
              type="color"
              value={form.secondary_color ?? "#d4af37"}
              onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
              className="h-10 w-full rounded-lg border border-line bg-surface-raised"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <p className="text-xs uppercase tracking-widest text-muted">Immagini</p>
        {(
          [
            ["logo_url", "Logo torneo"],
            ["home_bg_url", "Sfondo Home"],
            ["header_bg_url", "Sfondo Header"],
          ] as const
        ).map(([field, label]) => (
          <label key={field} className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs text-muted">
            <Upload size={14} />
            {form[field] ? `${label} caricato ✓` : `Carica ${label.toLowerCase()}`}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(field, e.target.files?.[0] ?? null)} />
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        <Save size={15} /> {saving ? "Salvataggio..." : savedMsg ? "Salvato ✓" : "Salva impostazioni"}
      </button>

      <button
        onClick={handleSignOut}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-sm font-medium text-muted"
      >
        <LogOut size={15} /> Esci
      </button>
    </div>
  );
}
