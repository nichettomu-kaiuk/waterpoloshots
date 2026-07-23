"use client";

import { X, MapPin, Clock } from "lucide-react";
import type { Match } from "@/lib/supabase/types";
import LiveBadge from "./LiveBadge";

export default function MatchDetailModal({ match, onClose }: { match: Match; onClose: () => void }) {
  const date = new Date(match.date_time);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={onClose}>
      <div
        className="w-full max-w-md animate-rise rounded-t-3xl border-t border-line bg-surface p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          {match.status === "live" ? (
            <LiveBadge />
          ) : (
            <span className="text-xs uppercase tracking-widest text-muted">
              {match.status === "completed" ? "Terminata" : "Programmata"}
            </span>
          )}
          <button onClick={onClose} className="text-muted hover:text-white" aria-label="Chiudi">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="mx-auto mb-2 h-14 w-14 rounded-full border border-line bg-surface-raised" />
            <p className="text-sm font-medium">{match.home_team?.name ?? "TBD"}</p>
          </div>
          <div className="px-4 text-center">
            <p className="font-display tabular text-3xl font-bold">
              {match.status === "scheduled" ? "—" : `${match.home_score} : ${match.away_score}`}
            </p>
          </div>
          <div className="flex-1 text-center">
            <div className="mx-auto mb-2 h-14 w-14 rounded-full border border-line bg-surface-raised" />
            <p className="text-sm font-medium">{match.away_team?.name ?? "TBD"}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-line bg-surface-raised p-4 text-sm">
          <div className="flex items-center gap-2 text-muted">
            <Clock size={15} />
            {date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })} ·{" "}
            {date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
          </div>
          {match.venue && (
            <div className="flex items-center gap-2 text-muted">
              <MapPin size={15} />
              {match.venue.name}
              {match.venue.location_tag ? ` · ${match.venue.location_tag}` : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
