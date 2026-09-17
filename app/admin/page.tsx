"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Trophy, LogOut, ChevronRight, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Championship } from "@/lib/supabase/types";

// Turns a championship name into a URL-friendly slug: lowercase, accents
// stripped, anything that isn't a letter/number collapsed to a single "-".
function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminChampionshipsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
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

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function resetForm() {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setSubtitle("");
    setError(null);
    setShowForm(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const baseSlug = slugify(slug || trimmedName);
    if (!trimmedName || !baseSlug) {
      setError("Inserisci un nome valido.");
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
        .insert({ slug: candidate, name: trimmedName, subtitle: subtitle.trim() || null })
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
      tournament_title: trimmedName,
      tournament_subtitle: subtitle.trim() || null,
    });

    setCreating(false);
    resetForm();
    await load();
    router.push(`/admin/${championship.slug}`);
  }

  async function handleDelete(c: Championship) {
    if (!confirm(`Eliminare "${c.name}"? Squadre, partite, giocatori, news e impostazioni di questo campionato verranno eliminati per sempre.`)) return;
    await supabase.from("championships").delete().eq("id", c.id);
    load();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md lg:max-w-3xl">
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
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
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
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Sottotitolo / stagione (opzionale)"
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
