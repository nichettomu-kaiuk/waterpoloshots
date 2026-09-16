"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, ChevronRight, AlertTriangle, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tournament } from "@/lib/supabase/types";

// Words that would collide with real routes if used as a tournament slug
// (/admin is its own route, not a campionato; the others are reserved for
// future/framework use).
const RESERVED_SLUGS = new Set(["admin", "login", "api", "_next"]);

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The template's entry point in the admin panel: create a new campionato
// (which starts empty — its own settings/teams/matches/etc. are then filled
// in from its own Admin → Squadre/Partite/... once you open it) or delete
// one, permanently, along with everything inside it (teams, players,
// matches, news, branding — tournament_id is `on delete cascade`
// everywhere, see supabase/schema.sql).
export default function AdminCampionatiPage() {
  const supabase = createClient();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("tournaments").select("*").order("created_at", { ascending: true });
    if (error) {
      setError(
        error.code === "42P01"
          ? "La tabella \"tournaments\" non esiste ancora sul tuo progetto Supabase. Esegui la sezione MULTI-CAMPIONATO di supabase/schema.sql nell'SQL Editor, poi riprova."
          : `Impossibile caricare i campionati: ${error.message}`
      );
    } else {
      setError(null);
      setTournaments(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanSlug = slugify(slug);
    if (!cleanName || !cleanSlug) return;
    if (RESERVED_SLUGS.has(cleanSlug)) {
      setError(`"${cleanSlug}" è un indirizzo riservato: scegli un altro indirizzo per questo campionato.`);
      return;
    }
    setSaving(true);
    setError(null);

    const { data: tournament, error: insertError } = await supabase
      .from("tournaments")
      .insert({ name: cleanName, slug: cleanSlug })
      .select()
      .single();

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? `L'indirizzo "${cleanSlug}" è già usato da un altro campionato: scegline un altro.`
          : `Creazione fallita: ${insertError.message}`
      );
      setSaving(false);
      return;
    }

    // A brand-new campionato needs its own settings row too (branding
    // needs exactly one per tournament — see Admin → Impostazioni).
    if (tournament) {
      const { error: settingsError } = await supabase.from("settings").insert({
        tournament_id: tournament.id,
        tournament_title: cleanName,
      });
      if (settingsError) {
        setError(`Campionato creato, ma non ho potuto inizializzarne le impostazioni: ${settingsError.message}`);
      }
    }

    setName("");
    setSlug("");
    setSlugEdited(false);
    setSaving(false);
    load();
  }

  async function handleDelete(t: Tournament) {
    if (
      !confirm(
        `Eliminare "${t.name}"? Verranno eliminati anche tutte le sue squadre, giocatori, partite, news e impostazioni. L'operazione non è reversibile.`
      )
    )
      return;
    const { error: deleteError } = await supabase.from("tournaments").delete().eq("id", t.id);
    if (deleteError) {
      setError(`Eliminazione fallita: ${deleteError.message}`);
      return;
    }
    load();
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">I tuoi campionati</h2>
      <p className="mb-4 text-sm text-muted">
        Crea un nuovo campionato per usare questo sito come template per un altro torneo: avrà le sue squadre,
        partite, giocatori, news e il suo aspetto grafico, indipendenti da tutti gli altri.
      </p>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-xs text-primary">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-6 max-w-xl space-y-2 rounded-2xl border border-line bg-surface p-4">
        <label className="block text-xs text-muted">Nome campionato</label>
        <input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Es. Serie A - Girone 1"
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <label className="block text-xs text-muted">Indirizzo (nell&apos;URL del sito)</label>
        <input
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugEdited(true);
          }}
          placeholder="serie-a-girone-1"
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Plus size={15} /> {saving ? "Creazione..." : "Crea campionato"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-muted">Caricamento...</p>
      ) : tournaments.length === 0 ? (
        <p className="text-sm text-muted">Nessun campionato ancora: creane uno qui sopra.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
          {tournaments.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-raised text-gold">
                <Trophy size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.name}</p>
                <p className="truncate text-[11px] text-muted">/{t.slug}</p>
              </div>
              <Link href={`/admin/${t.slug}`} className="text-muted hover:text-gold" aria-label="Gestisci">
                <ChevronRight size={18} />
              </Link>
              <button onClick={() => handleDelete(t)} className="text-muted hover:text-primary" aria-label="Elimina campionato">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
