"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Trophy, LogOut, ChevronRight, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Championship } from "@/lib/supabase/types";
import { slugify, championshipSlug } from "@/lib/slug";

// Just the interactive "Campionati" list (state, CRUD, sign-out) — split out
// so app/admin/page.tsx can be a Server Component and render the Hero above
// it, the same way app/admin/login/page.tsx does.
export default function AdminChampionshipsList() {
  const supabase = createClient();
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const { data } = await supabase.from("championships").select("*").order("created_at", { ascending: true });
    setChampionships(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Lo slug del campionato viene generato da titolo + sottotitolo, non da un
  // nome a parte: finché l'utente non tocca manualmente il campo slug, resta
  // agganciato a quello che digita in questi due campi (utile quando più
  // campionati condividono lo stesso titolo e si distinguono solo per
  // stagione/girone nel sottotitolo).
  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(championshipSlug(value, subtitle));
  }

  function handleSubtitleChange(value: string) {
    setSubtitle(value);
    if (!slugTouched) setSlug(championshipSlug(title, value));
  }

  function resetForm() {
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setSubtitle("");
    setError(null);
    setShowForm(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const baseSlug = slugify(slug || championshipSlug(trimmedTitle, subtitle));
    if (!trimmedTitle || !baseSlug) {
      setError("Inserisci un titolo valido.");
      return;
    }
    setCreating(true);
    setError(null);

    // Tries the requested slug, then "-2", "-3", ... if it's already taken.
    let candidate = baseSlug;
    let championship: Championship | null = null;
    for (let attempt = 1; attempt <= 20 && !championship; attempt++) {
      const { data, error: insertError } = await supabase
        .from("championships")
        .insert({ slug: candidate, name: trimmedTitle, subtitle: subtitle.trim() || null })
        .select()
        .single();

      if (!insertError && data) {
        championship = data as Championship;
        break;
      }
      if (insertError?.code === "23505") {
        attempt += 1;
        candidate = `${baseSlug}-${attempt}`;
        continue;
      }
      setError("Impossibile creare il campionato. Riprova.");
      setCreating(false);
      return;
    }

    if (!championship) {
      setError("Impossibile trovare uno slug libero. Modifica lo slug manualmente.");
      setCreating(false);
      return;
    }

    // A championship needs its own settings row from the start so its
    // public pages (Hero, tema, ecc.) have sensible defaults immediately.
    await supabase.from("settings").insert({
      championship_id: championship.id,
      tournament_title: trimmedTitle,
      tournament_subtitle: subtitle.trim() || null,
    });

    setCreating(false);
    resetForm();
    await load();
    // Hard navigation, not router.push: this crosses into a freshly created
    // championship's admin area, and a full request cycle guarantees the
    // server sees the just-created row (and, for the sign-out/sign-in flows
    // elsewhere, the just-set/cleared auth cookie) rather than racing a
    // client-side soft navigation against it.
    window.location.href = `/admin/${championship.slug}`;
  }

  async function handleDelete(c: Championship) {
    if (!confirm(`Eliminare "${c.name}"? Squadre, partite, giocatori, news e impostazioni di questo campionato verranno eliminati per sempre.`)) return;
    await supabase.from("championships").delete().eq("id", c.id);
    load();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    // Hard navigation (not router.push + router.refresh): a client-side
    // soft navigation right after signOut() can reach the middleware before
    // the cleared auth cookie is visible to it, so the next page sometimes
    // rendered as if still logged in. A full page load always sees the
    // up-to-date cookie.
    window.location.href = "/admin/login";
  }

  return (
    <div>
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-gold">Pannello di controllo</p>
          <h1 className="font-display text-xl font-bold">Campionati</h1>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-white"
        >
          <LogOut size={13} /> Esci
        </button>
      </header>

      <div className="mb-6 rounded-2xl border border-line bg-surface p-4">
        {showForm ? (
          <form onSubmit={handleCreate} className="space-y-2">
            <div className="mb-1 flex items-center justify-between text-xs text-gold">
              <span>Nuovo campionato</span>
              <button type="button" onClick={resetForm} className="flex items-center gap-1 text-muted hover:text-white">
                <X size={13} /> Annulla
              </button>
            </div>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Nome campionato (es. Serie A1 - Girone 1)"
              autoFocus
              className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div>
              <label className="mb-1 block text-[11px] text-muted">Indirizzo pubblico (slug)</label>
              <div className="flex items-center gap-1 rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm">
                <span className="shrink-0 text-muted">/</span>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="serie-a1-girone-1"
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>
            <input
              value={subtitle}
              onChange={(e) => handleSubtitleChange(e.target.value)}
              placeholder="Stagione (opzionale)"
              className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
            />
            {error && <p className="text-xs text-primary">{error}</p>}
            <button
              type="submit"
              disabled={creating}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Plus size={15} /> {creating ? "Creazione..." : "Crea campionato"}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white"
          >
            <Plus size={15} /> Crea nuovo campionato
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Caricamento...</p>
      ) : championships.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Nessun campionato ancora. Creane uno per iniziare.
        </p>
      ) : (
        <div className="space-y-2">
          {championships.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Trophy size={17} />
              </div>
              <Link href={`/admin/${c.slug}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="truncate text-[11px] text-muted">/{c.slug}</p>
              </Link>
              <Link
                href={`/${c.slug}`}
                target="_blank"
                className="hidden shrink-0 text-[11px] text-primary hover:underline sm:block"
              >
                Vedi sito
              </Link>
              <Link href={`/admin/${c.slug}`} className="text-muted hover:text-gold">
                <ChevronRight size={16} />
              </Link>
              <button onClick={() => handleDelete(c)} className="text-muted hover:text-primary">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
