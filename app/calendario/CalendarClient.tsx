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

const statusFilters = [
  { value: "", label: "Tutte" },
  { value: "scheduled", label: "Da giocare" },
  { value: "completed", label: "Giocate" },
];

function giornataState(matches: Match[]) {
  if (matches.some((m) => m.status === "live")) return { label: "In corso", live: true };
  if (matches.every((m) => m.status === "completed")) return { label: "Conclusa", live: false };
  return { label: "Da giocare", live: false };
}

function giornataDates(matches: Match[]) {
  const dates = matches
    .map((m) => m.date_time)
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d).getTime())
    .sort((a, b) => a - b);
  if (dates.length === 0) return null;
  const fmt = (t: number) =>
    new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  const first = fmt(dates[0]);
  const last = fmt(dates[dates.length - 1]);
  return first === last ? first : `${first} — ${last}`;
}

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
  const [activeStatus, setActiveStatus] = useState("");
  const [search, setSearch] = useState(q);

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    const searchDigits = searchLower.replace(/[^0-9]/g, "");
    return matches.filter((m) => {
      const matchesGirone = !activeGirone || m.round_type === activeGirone;
      const matchesStatus =
        !activeStatus ||
        (activeStatus === "scheduled" ? m.status !== "completed" : m.status === "completed");
      const matchesTeam =
        m.home_team?.name.toLowerCase().includes(searchLower) ||
        m.away_team?.name.toLowerCase().includes(searchLower);
      const matchesGiornata = searchDigits !== "" && String(m.giornata) === searchDigits;
      const matchesSearch = !searchLower || matchesTeam || matchesGiornata;
      return matchesGirone && matchesStatus && matchesSearch;
    });
  }, [matches, activeGirone, activeStatus, search]);

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
          placeholder="Cerca squadra o giornata..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
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
        <span className="mx-1 w-px bg-line" />
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveStatus(f.value)}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-xs font-medium transition",
              activeStatus === f.value
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
          {grouped.map(({ round, giornate }, idx) => (
            <div key={round}>
              {idx > 0 && <LaneRope />}
              <h2 className="mb-3 font-display text-base font-bold uppercase tracking-wide text-gold">
                Girone di {round === "andata" ? "Andata" : "Ritorno"}
              </h2>
              <div className="space-y-6">
                {giornate.map(([giornataNum, giornataMatches]) => {
                  const state = giornataState(giornataMatches);
                  const dates = giornataDates(giornataMatches);
                  return (
                    <div key={giornataNum}>
                      {/* Fascia giornata: stato e date, come nei mockup. */}
                      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span
                          className={clsx(
                            "rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest",
                            state.live
                              ? "bg-gold text-[#2a2004]"
                              : "bg-primary text-white"
                          )}
                        >
                          Giornata {giornataNum}
                          {state.live ? " · in corso" : ""}
                        </span>
                        {!state.live && (
                          <span className="text-[11px] uppercase tracking-widest text-muted">
                            {state.label}
                          </span>
                        )}
                        {dates && <span className="text-[11px] text-muted">{dates}</span>}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {giornataMatches.map((m) => (
                          <MatchCard key={m.id} match={m} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
