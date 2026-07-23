"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import type { Match } from "@/lib/supabase/types";
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

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Nessun match trovato.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
