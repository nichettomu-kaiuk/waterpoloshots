"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import type { Match, RoundType } from "@/lib/supabase/types";
import MatchCard from "@/components/MatchCard";
import LaneRope from "@/components/LaneRope";

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
    const searchLower = search.toLowerCase().trim();
    const searchDigits = searchLower.replace(/[^0-9]/g, "");
    return matches.filter((m) => {
      const matchesGirone = !activeGirone || m.round_type === activeGirone;
      const matchesTeam =
        m.home_team?.name.toLowerCase().includes(searchLower) ||
        m.away_team?.name.toLowerCase().includes(searchLower);
      const matchesGiornata = searchDigits !== "" && String(m.giornata) === searchDigits;
      const matchesSearch = !searchLower || matchesTeam || matchesGiornata;
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

  const both = grouped.length === 2;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
        <Search size={16} className="text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca squadra o giornata..."
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
        <div
          className={clsx(
            "space-y-8",
            // Desktop with both gironi: two columns, Andata | Ritorno.
            both && "lg:grid lg:grid-cols-2 lg:items-start lg:space-y-0"
          )}
        >
          {grouped.map(({ round, giornate }, idx) => {
            // Desktop placement when both gironi are shown: the i-th giornata
            // of Andata sits right next to the i-th giornata of Ritorno (paired
            // by position, so it works whatever the giornata numbering), and a
            // vertical rule keeps the two gironi visibly separate.
            const colHeader = !both
              ? ""
              : round === "andata"
                ? "lg:[grid-column:1] lg:[grid-row:1] lg:mb-0 lg:pb-3 lg:pr-5"
                : "lg:[grid-column:2] lg:[grid-row:1] lg:mb-0 lg:pb-3 lg:pl-5 lg:border-l lg:border-line";
            const colCell = !both
              ? ""
              : round === "andata"
                ? "lg:[grid-column:1] lg:[grid-row:var(--r)] lg:min-w-0 lg:pr-5 lg:pb-6"
                : "lg:[grid-column:2] lg:[grid-row:var(--r)] lg:min-w-0 lg:pl-5 lg:pb-6 lg:border-l lg:border-line";
            return (
              <div key={round} className={clsx(both && "lg:contents")}>
                {idx > 0 && (
                  <div className="lg:hidden">
                    <LaneRope />
                  </div>
                )}
                <h2
                  className={clsx(
                    "mb-3 font-display text-base font-bold uppercase tracking-wide text-gold",
                    colHeader
                  )}
                >
                  Girone di {round === "andata" ? "Andata" : "Ritorno"}
                </h2>
                <div
                  className={clsx(
                    "space-y-6",
                    both && "lg:contents lg:space-y-0",
                    // Only one girone on screen: use the width by placing
                    // its giornate two at a time.
                    !both && "lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8 lg:gap-y-6 lg:space-y-0"
                  )}
                >
                  {giornate.map(([giornataNum, giornataMatches], gi) => (
                    <div
                      key={giornataNum}
                      className={colCell}
                      style={both ? ({ "--r": gi + 2 } as React.CSSProperties) : undefined}
                    >
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                        Giornata {giornataNum}
                      </p>
                      <div className="grouped-card animate-rise divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                        {giornataMatches.map((m) => (
                          <MatchCard key={m.id} match={m} bare stacked />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
