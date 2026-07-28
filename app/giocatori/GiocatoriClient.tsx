"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import type { Player, Team } from "@/lib/supabase/types";

type PlayerWithTeam = Player & { team?: Team };

export default function GiocatoriClient({ players }: { players: PlayerWithTeam[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return players;
    const s = search.toLowerCase();
    return players.filter(
      (p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(s) ||
        p.team?.name.toLowerCase().includes(s)
    );
  }, [players, search]);

  // Ordered by team name (alphabetical), then by cap number within each
  // team — a single flat list, not split into separate team sections.
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const teamCompare = (a.team?.name ?? "").localeCompare(b.team?.name ?? "");
      if (teamCompare !== 0) return teamCompare;
      return a.cap_number - b.cap_number;
    });
  }, [filtered]);

  return (
    <div>
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
        <Search size={16} className="text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca giocatore o squadra..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      {sorted.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Nessun giocatore trovato.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
          {sorted.map((p) => (
            <Link
              key={p.id}
              href={`/giocatore/${p.id}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 transition active:scale-[0.99]"
            >
              {p.photo_url ? (
                <Image
                  src={p.photo_url}
                  alt={`${p.first_name} ${p.last_name}`}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-raised font-display text-xs text-muted">
                  {p.cap_number}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.first_name} {p.last_name}</p>
                <p className="truncate text-[11px] text-muted">N. {p.cap_number}</p>
                <p className="truncate text-[11px] text-muted">{p.team?.name ?? "Senza squadra"}</p>
              </div>
              <span className="shrink-0 font-display font-bold text-gold">{p.goals_count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
