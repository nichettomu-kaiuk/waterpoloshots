"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import type { Match, RoundType } from "@/lib/supabase/types";
import MatchCard from "@/components/MatchCard";

const filters = [
  { value: "", label: "Tutti" },
  { value: "andata", label: "Andata" },
  { value: "ritorno", label: "Ritorno" },
];

export default function CalendarClient({
  matches,
  girone,
  q,
}: {
  matches: Match[];
  girone: string;
  q: string;
}) {
  const [activeGirone, setActiveGirone] = useState(girone);
  const [search, setSearch] = useState(q);

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      const matchesGirone = !activeGirone || m.round_type === activeGirone;
      const matchesSearch =
        !search ||
        m.home_team?.name.toLowerCase().includes(search.toLowerCase()) ||
        m.away_team?.name.toLowerCase().includes(search.toLowerCase());
      return matchesGirone && matchesSearch;
    });
  }, [matches, activeGirone, search]);

  // Girone di Andata first, then Girone di Ritorno; within each, grouped by
  // giornata number ascending — mirrors how the admin manages the calendar.
  const grouped = useMemo(() => {
    const girons: RoundType[] = ["andata", "ritorno"];
    return girons
      .map((round) => {
        const roundMatches = filtered.filter((m) => m.round_type === round);
        const giornateMap = new Map<number, Match[]>();
        for (const m of roundMatches) {
          const list = giornateMap.get(m.giornata) ?? [];
          list.push(m);
          giornateMap.set(m.giornata, list);
        }
        const giornate = Array.from(giornateMap.entries()).sort((a, b) => a[0] - b[0]);
        return { round, giornate };
      })
      .filter((g) => g.giornate.length > 0);
  }, [filtered]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
        <Search size={16} className="text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca squadra..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      <div className="mb-5 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveGirone(f.value)}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-xs font-medium transition",
              activeGirone === f.value
                ? "border-primary bg-primary/15 text-primary"
                : "border-line text-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Nessun match trovato.</p>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ round, giornate }) => (
            <div key={round}>
              <h2 className="mb-3 font-display text-base font-bold uppercase tracking-wide text-gold">
                Girone di {round === "andata" ? "Andata" : "Ritorno"}
              </h2>
              <div className="space-y-6">
                {giornate.map(([giornataNum, giornataMatches]) => (
                  <div key={giornataNum}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                      Giornata {giornataNum}
                    </p>
                    <div className="space-y-3">
                      {giornataMatches.map((m) => (
                        <MatchCard key={m.id} match={m} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
