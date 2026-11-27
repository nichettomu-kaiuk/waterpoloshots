"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  Users,
  UserRound,
  MapPinned,
  Palette,
  Newspaper,
  Plus,
  ExternalLink,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isReservedSlug, tournamentSlug } from "@/lib/slug";
import type { Settings } from "@/lib/supabase/types";
import AdminError from "@/components/AdminError";
import { AdminTournamentProvider, useAdminTournament } from "@/components/admin/AdminTournament";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/matches", label: "Partite", icon: Shield },
  { href: "/admin/teams", label: "Squadre", icon: Users },
  { href: "/admin/players", label: "Giocatori", icon: UserRound },
  { href: "/admin/venues", label: "Piscine", icon: MapPinned },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/settings", label: "Impostazioni", icon: Palette },
];

// Used only when the database has no tournament at all yet.
const BLANK_TOURNAMENT = {
  logo_url: null,
  home_bg_url: null,
  header_bg_url: null,
  primary_color: "#e10f21",
  secondary_color: "#d4af37",
  active_round: null,
  info_text: null,
  info_image_url: null,
  info_email: null,
  theme: "classic",
};

export default function AdminShell({
  initialTournaments,
  initialId,
  initialError,
  children,
}: {
  initialTournaments: Settings[];
  initialId: string | null;
  initialError: string | null;
  children: React.ReactNode;
}) {
  return (
    <AdminTournamentProvider
      initialTournaments={initialTournaments}
      initialId={initialId}
      initialError={initialError}
    >
      <Shell>{children}</Shell>
    </AdminTournamentProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { tournaments, current, loadError, select } = useAdminTournament();
  const [creating, setCreating] = useState(false);

  if (pathname === "/admin/login") return <div className="mx-auto w-full max-w-sm">{children}</div>;

  return (
    <div className="mx-auto w-full max-w-md pb-10 lg:max-w-5xl xl:max-w-6xl">
      <header className="border-b border-line px-5 py-4 lg:px-8">
        <p className="text-[11px] uppercase tracking-widest text-gold">Pannello di controllo</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-bold">{current?.tournament_title ?? "Admin"}</h1>
            {current?.tournament_subtitle && (
              <p className="truncate text-sm text-muted">{current.tournament_subtitle}</p>
            )}
            {current && <p className="mt-0.5 text-[11px] text-muted">/{current.slug}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tournaments.length > 1 && (
              <select
                aria-label="Torneo da gestire"
                value={current?.id ?? ""}
                onChange={(e) => select(e.target.value)}
                className="max-w-[14rem] rounded-xl border border-line bg-surface px-3 py-2 text-xs"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tournament_title}
                    {t.tournament_subtitle ? ` — ${t.tournament_subtitle}` : ""}
                  </option>
                ))}
              </select>
            )}
            {current && (
              <Link
                href={`/${current.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-gold hover:text-white"
              >
                <ExternalLink size={13} /> Vedi sito
              </Link>
            )}
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Plus size={13} /> Nuovo torneo
            </button>
          </div>
        </div>
      </header>

      <nav className="scrollbar-none flex gap-2 overflow-x-auto border-b border-line px-5 py-3 lg:px-8">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary hover:text-white"
          >
            <Icon size={13} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-5 py-5 lg:px-8">
        {loadError && (
          <AdminError
            message={`Impossibile leggere i tornei: ${loadError}. Se il database non è aggiornato, esegui il blocco di migrazione "MULTI-TOURNAMENT" in fondo a supabase/schema.sql.`}
          />
        )}
        {children}
      </div>

      {creating && <NewTournamentDialog onClose={() => setCreating(false)} />}
    </div>
  );
}

function NewTournamentDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const supabase = createClient();
  const { tournaments, current, reload } = useAdminTournament();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = title.trim() ? tournamentSlug(title, subtitle) : "";

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Inserisci il titolo del torneo.");
      return;
    }
    if (isReservedSlug(slug)) {
      setError(`L'indirizzo "/${slug}" è riservato: cambia titolo o sottotitolo.`);
      return;
    }
    if (tournaments.some((t) => t.slug === slug)) {
      setError(`Esiste già un torneo con l'indirizzo "/${slug}": cambia titolo o sottotitolo.`);
      return;
    }

    setSaving(true);
    // "Based on this one": the new tournament starts from the current
    // tournament's look & settings (colours, theme, logo, images, info
    // page) but with its own title/subtitle and NO teams, players, venues,
    // matches or news.
    const base = current
      ? (({ id, slug: _slug, created_at, tournament_title, tournament_subtitle, ...rest }) => rest)(current)
      : BLANK_TOURNAMENT;
    const { data, error: insertError } = await supabase
      .from("settings")
      .insert({ ...base, tournament_title: title.trim(), tournament_subtitle: subtitle.trim() || null, slug })
      .select()
      .single();
    setSaving(false);

    if (insertError || !data) {
      const duplicate = insertError?.code === "23505";
      setError(
        duplicate
          ? `Esiste già un torneo con l'indirizzo "/${slug}".`
          : `Creazione non riuscita: ${insertError?.message ?? "errore sconosciuto"}`
      );
      return;
    }

    await reload((data as Settings).id);
    onClose();
    router.push("/admin");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" role="dialog" aria-modal="true">
      <form
        onSubmit={handleCreate}
        className="w-full max-w-md space-y-3 rounded-2xl border border-line bg-surface p-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Nuovo torneo</h2>
          <button type="button" onClick={onClose} aria-label="Chiudi" className="text-muted">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-muted">
          {current
            ? `Il nuovo torneo parte dall'aspetto di "${current.tournament_title}" (colori, tema, logo, pagina info) ma senza squadre, giocatori, piscine, partite e news.`
            : "Crea il primo torneo."}
        </p>

        <AdminError message={error} />

        <div>
          <label className="mb-1 block text-xs text-muted">Titolo torneo</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Serie A2"
            autoFocus
            className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Sottotitolo</label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Girone 1 — Stagione 2026/27"
            className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2.5 text-sm"
          />
        </div>

        <p className="rounded-xl bg-surface-raised px-3 py-2 text-xs text-muted">
          Indirizzo del torneo: <span className="font-medium text-white">/{slug || "…"}</span>
          <br />
          Si forma da titolo + sottotitolo ed è unico per ogni torneo.
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-xl border border-line px-4 py-2 text-sm text-muted">
            Annulla
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Creazione..." : "Crea torneo"}
          </button>
        </div>
      </form>
    </div>
  );
}
