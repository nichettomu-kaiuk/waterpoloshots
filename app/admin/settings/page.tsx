"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Upload, Save, LogOut, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Settings } from "@/lib/supabase/types";

const BUCKET = "branding";

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

type ImageField = "logo_url" | "home_bg_url" | "header_bg_url";

// Public Supabase Storage URLs look like:
// https://<project>.supabase.co/storage/v1/object/public/branding/<path>
// We only ever store the public URL, so deleting/replacing needs the path
// pulled back out of it.
function pathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

export default function AdminSettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [form, setForm] = useState(emptySettings);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [busyField, setBusyField] = useState<ImageField | null>(null);

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
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) return null;
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  // Replace: uploads the new file, swaps the field, then best-effort removes
  // the previous file from storage so old branding images don't pile up.
  async function handleReplace(field: ImageField, file: File | null) {
    if (!file) return;
    setBusyField(field);
    const previousUrl = form[field];
    const url = await uploadImage(file, field);
    if (url) {
      setForm((f) => ({ ...f, [field]: url }));
      if (previousUrl) {
        const previousPath = pathFromPublicUrl(previousUrl);
        if (previousPath) await supabase.storage.from(BUCKET).remove([previousPath]);
      }
    }
    setBusyField(null);
  }

  // Delete: removes the file from storage (if we can resolve its path) and
  // clears the field so the app falls back to the default styling.
  async function handleDelete(field: ImageField) {
    const url = form[field];
    if (!url) return;
    if (!confirm("Eliminare questa immagine?")) return;
    setBusyField(field);
    const path = pathFromPublicUrl(url);
    if (path) await supabase.storage.from(BUCKET).remove([path]);
    setForm((f) => ({ ...f, [field]: null }));
    setBusyField(null);
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

  const imageFields: { field: ImageField; label: string; hint: string }[] = [
    { field: "logo_url", label: "Logo torneo", hint: "Consigliato: quadrato, sfondo trasparente" },
    { field: "home_bg_url", label: "Sfondo Home", hint: "Sfondo dell'header/hero in cima alla home" },
    { field: "header_bg_url", label: "Bg home", hint: "Sfondo del corpo della home page, sotto l'header" },
  ];

  return (
    <div className="max-w-4xl space-y-5">
      <h2 className="font-display text-lg font-bold">Branding &amp; impostazioni</h2>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="space-y-2 rounded-2xl border border-line bg-surface p-4">
            <p className="mb-1 text-xs uppercase tracking-widest text-muted">Informazioni torneo</p>
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
        </div>

        <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
          <p className="text-xs uppercase tracking-widest text-muted">Immagini</p>

          {imageFields.map(({ field, label, hint }) => {
            const url = form[field];
            const busy = busyField === field;
            return (
              <div key={field} className="rounded-xl border border-line bg-surface-raised p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-ink">
                    {url ? (
                      <Image src={url} alt={label} width={64} height={64} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted">Nessuna</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="mb-2 text-[11px] text-muted">{hint}</p>

                    <div className="flex flex-wrap gap-2">
                      <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[11px] font-medium text-muted hover:border-primary hover:text-white">
                        {url ? <Pencil size={12} /> : <Upload size={12} />}
                        {busy ? "Caricamento..." : url ? "Sostituisci" : "Carica"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={busy}
                          onChange={(e) => handleReplace(field, e.target.files?.[0] ?? null)}
                        />
                      </label>

                      {url && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleDelete(field)}
                          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[11px] font-medium text-muted hover:border-primary hover:text-primary disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          Elimina
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Save size={15} /> {saving ? "Salvataggio..." : savedMsg ? "Salvato ✓" : "Salva impostazioni"}
        </button>

        <button
          onClick={handleSignOut}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-sm font-medium text-muted sm:flex-none sm:px-6"
        >
          <LogOut size={15} /> Esci
        </button>
      </div>
    </div>
  );
}
