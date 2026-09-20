"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Upload, Save, LogOut, Pencil, Trash2, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChampionship } from "@/lib/admin-championship-context";
import { championshipSlug } from "@/lib/slug";
import { compressImage } from "@/lib/compressImage";
import type { AppTheme, Settings } from "@/lib/supabase/types";

const BUCKET = "branding";

// Dimensione massima (lato più lungo, in px) per ciascun campo immagine,
// passata a compressImage prima dell'upload — vedi lib/compressImage.ts.
// Gli sfondi restano più grandi perché occupano tutta la larghezza pagina;
// logo e immagine Info sono mostrati piccoli, quindi possono essere più
// compatti.
const IMAGE_LIMITS: Record<ImageField, number> = {
  logo_url: 600,
  home_bg_url: 1920,
  header_bg_url: 1920,
  info_image_url: 1000,
};

const emptySettings: Omit<Settings, "id" | "championship_id"> = {
  tournament_title: "Serie B - Girone 3",
  tournament_subtitle: "",
  logo_url: null,
  home_bg_url: null,
  header_bg_url: null,
  primary_color: "#e10f21",
  secondary_color: "#d4af37",
  active_round: "Girone di andata",
  info_text: "(c) 2026 Nicola De Santis - Waterpolo Shots. Tutti i diritti sono riservati.",
  info_image_url: null,
  info_email: null,
  theme: "classic",
};

type ImageField = "logo_url" | "home_bg_url" | "header_bg_url" | "info_image_url";

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
  const championship = useChampionship();
  const router = useRouter();
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [form, setForm] = useState(emptySettings);
  // Sottotitolo così come caricato dal DB, per capire al salvataggio se
  // l'admin l'ha cambiato (lo slug dipende anche da questo, non solo dal
  // titolo — vedi handleSave).
  const [originalSubtitle, setOriginalSubtitle] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [busyField, setBusyField] = useState<ImageField | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("settings")
        .select("*")
        .eq("championship_id", championship.id)
        .maybeSingle();
      if (data) {
        setSettingsId(data.id);
        setForm(data);
        setOriginalSubtitle(data.tournament_subtitle ?? null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [championship.id]);

  async function uploadImage(file: File, folder: string) {
    const compressed = await compressImage(file, {
      maxDimension: IMAGE_LIMITS[folder as ImageField] ?? 1600,
    });
    const path = `${folder}/${Date.now()}-${compressed.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, compressed);
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
      const { data } = await supabase
        .from("settings")
        .insert({ ...form, championship_id: championship.id })
        .select()
        .single();
      if (data) setSettingsId(data.id);
    }

    // Lo slug pubblico (e il nome mostrato in Admin → Campionati) seguono
    // titolo + sottotitolo del torneo: se uno dei due è cambiato rispetto a
    // quello attuale, rigeneriamo lo slug (aggiungendo -2, -3... in caso di
    // collisione con un altro campionato) e aggiorniamo anche nome e
    // sottotitolo salvati sul campionato. I link già condivisi con lo slug
    // precedente smettono di funzionare — comportamento scelto
    // esplicitamente per tenere slug, titolo e sottotitolo sempre allineati.
    const trimmedTitle = form.tournament_title.trim();
    const trimmedSubtitle = (form.tournament_subtitle ?? "").trim();
    const titleChanged = trimmedTitle !== championship.name;
    const subtitleChanged = trimmedSubtitle !== (originalSubtitle ?? "").trim();
    let newSlug = championship.slug;
    if (trimmedTitle && (titleChanged || subtitleChanged)) {
      const baseSlug = championshipSlug(trimmedTitle, trimmedSubtitle);
      let candidate = baseSlug || championship.slug;
      let suffix = 2;
      while (suffix <= 50) {
        const { data: clash } = await supabase
          .from("championships")
          .select("id")
          .eq("slug", candidate)
          .neq("id", championship.id)
          .maybeSingle();
        if (!clash) break;
        candidate = `${baseSlug}-${suffix}`;
        suffix += 1;
      }
      newSlug = candidate;
      await supabase
        .from("championships")
        .update({ name: trimmedTitle, subtitle: trimmedSubtitle || null, slug: newSlug })
        .eq("id", championship.id);
      setOriginalSubtitle(trimmedSubtitle || null);
    }

    // Il sito pubblico è in cache (ISR, 15s — vedi app/[slug]/layout.tsx):
    // senza questa chiamata, tema/colori/logo appena salvati restavano
    // "vecchi" sul sito finché la cache non scadeva da sola. Nessun
    // parametro da passare: la route invalida il layout condiviso da tutti
    // i campionati (vedi il suo stesso commento sul perché). Best-effort:
    // se fallisce (rete assente, ecc.) le impostazioni sono comunque salvate
    // correttamente, il sito si aggiornerà comunque entro 15s.
    try {
      await fetch("/api/revalidate-championship", { method: "POST" });
    } catch {
      // ignorato volutamente: vedi commento sopra.
    }

    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 1800);

    if (newSlug !== championship.slug) {
      // Lo slug nell'URL corrente non esiste più: passiamo a quello nuovo
      // invece di un refresh, che darebbe 404 sulla pagina attuale.
      router.push(`/admin/${newSlug}/settings`);
    } else {
      router.refresh();
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    // Hard navigation (not router.push + router.refresh): a client-side
    // soft navigation right after signOut() can reach the /admin/login
    // middleware check before the cleared auth cookie is visible to it — a
    // full page load always sees the up-to-date cookie.
    window.location.href = "/admin/login";
  }

  const imageFields: { field: ImageField; label: string; hint: string }[] = [
    { field: "logo_url", label: "Logo campionato", hint: "Consigliato: quadrato, sfondo trasparente" },
    { field: "home_bg_url", label: "Sfondo Home", hint: "Sfondo dell'header/hero in cima alla home" },
    { field: "header_bg_url", label: "Bg home", hint: "Sfondo del corpo della home page, sotto l'header" },
    { field: "info_image_url", label: "Immagine Info", hint: "Mostrata nella finestra Informazioni (icona \"i\")" },
  ];

  return (
    <div className="max-w-4xl space-y-5">
      <h2 className="font-display text-lg font-bold">Branding &amp; impostazioni</h2>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="space-y-2 rounded-2xl border border-line bg-surface p-4">
            <p className="mb-1 text-xs uppercase tracking-widest text-muted">Informazioni campionato</p>
            <label className="block text-xs text-muted">Nome campionato</label>
            <input
              value={form.tournament_title}
              onChange={(e) => setForm({ ...form, tournament_title: e.target.value })}
              className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <label className="block text-xs text-muted">Stagione</label>
            <input
              value={form.tournament_subtitle ?? ""}
              onChange={(e) => setForm({ ...form, tournament_subtitle: e.target.value })}
              className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <label className="block text-xs text-muted">Altre info</label>
            <input
              value={form.active_round ?? ""}
              onChange={(e) => setForm({ ...form, active_round: e.target.value })}
              className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted">
              <Palette size={13} /> Aspetto grafico
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "classic", label: "Classico", hint: "Card arrotondate, stile attuale", dark: true },
                  { value: "classic-light", label: "Classico Chiaro", hint: "Stesse forme, sfondo bianco", dark: false },
                  { value: "lane", label: "Corsia", hint: "Card a biglietto, hero diagonale", dark: true },
                  { value: "lane-light", label: "Corsia Chiara", hint: "Stesse forme, sfondo bianco", dark: false },
                  { value: "regulation", label: "Regolamento", hint: "Card piatte, badge a cuffia", dark: true },
                  { value: "regulation-light", label: "Regolamento Chiaro", hint: "Stesse forme, sfondo bianco", dark: false },
                  { value: "impact", label: "Onda d'Urto", hint: "Energico: diagonali, card a biglietto dorate", dark: true },
                  { value: "impact-light", label: "Onda d'Urto Chiaro", hint: "Stesse forme, sfondo bianco", dark: false },
                  { value: "broadcast", label: "Broadcast Gold", hint: "Premium TV: hairline dorate, card vetro", dark: true },
                  { value: "broadcast-light", label: "Broadcast Gold Chiaro", hint: "Stesse forme, sfondo bianco", dark: false },
                  { value: "poster", label: "Poster Arena", hint: "Manifesto: blocchi netti, badge squadrati", dark: true },
                  { value: "poster-light", label: "Poster Arena Chiaro", hint: "Stesse forme, sfondo bianco", dark: false },
                  { value: "tabellone", label: "Tabellone", hint: "Sportivo: angoli squadrati, podio in classifica", dark: true },
                  { value: "tabellone-light", label: "Tabellone Chiaro", hint: "Stesse forme, sfondo bianco", dark: false },
                  { value: "magazine", label: "Magazine", hint: "Editoriale: fascia rossa, card piatte, Space Grotesk", dark: true },
                  { value: "magazine-light", label: "Magazine Chiaro", hint: "Stesse forme, sfondo bianco", dark: false },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, theme: opt.value })}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    form.theme === opt.value ? "border-primary bg-primary/10" : "border-line bg-surface-raised"
                  }`}
                >
                  <span
                    className={`mb-1.5 inline-block h-3 w-3 rounded-full border ${
                      opt.dark ? "border-line bg-ink" : "border-line bg-white"
                    }`}
                  />
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{opt.hint}</p>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted">
              Cambia l&apos;aspetto grafico dell&apos;intero sito. Le versioni &quot;Chiaro&quot; hanno le stesse forme
              e gli stessi colori d&apos;accento, solo con sfondo bianco e testo scuro al posto di sfondo nero e
              testo chiaro. Ricorda di premere &quot;Salva impostazioni&quot; qui sotto per rendere effettiva la
              scelta.
            </p>
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

          <div className="space-y-2 rounded-2xl border border-line bg-surface p-4">
            <p className="mb-1 text-xs uppercase tracking-widest text-muted">
              Informazioni (icona &quot;i&quot;)
            </p>
            <label className="block text-xs text-muted">Testo</label>
            <textarea
              value={form.info_text ?? ""}
              onChange={(e) => setForm({ ...form, info_text: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <label className="block text-xs text-muted">Email di contatto (opzionale)</label>
            <input
              type="email"
              value={form.info_email ?? ""}
              onChange={(e) => setForm({ ...form, info_email: e.target.value || null })}
              placeholder="info@esempio.it"
              className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
            />
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
