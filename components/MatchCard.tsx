"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import clsx from "clsx";
import type { Match } from "@/lib/supabase/types";
import LiveBadge from "./LiveBadge";
import MatchDetailModal from "./MatchDetailModal";
import ShareButton from "./ShareButton";

function formatTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

function TeamLogo({ url, name }: { url: string | null | undefined; name: string | undefined }) {
  if (url) {
    return (
      <Image
        src={url}
        alt={name ?? "Squadra"}
        width={36}
        height={36}
        className="h-9 w-9 rounded-full border border-line object-cover"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-raised text-xs font-display text-muted">
      {(name ?? "??").slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function MatchCard({ match, bare = false }: { match: Match; bare?: boolean }) {
  const [open, setOpen] = useState(false);

  const statusLabel =
    match.status === "live" ? null : match.status === "completed" ? "Terminata" : "Programmata";

  const home = match.home_team?.name ?? "Casa";
  const away = match.away_team?.name ?? "Ospiti";
  const scoreText =
    match.status === "scheduled"
      ? match.date_time
        ? `${formatDate(match.date_time)} · ${formatTime(match.date_time)}`
        : "Data da definire"
      : `${match.home_score} - ${match.away_score}`;
  const shareText = `🤽 ${home} vs ${away}\n${scoreText}${match.venue ? `\n📍 ${match.venue.name}` : ""}`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={clsx(
          "w-full text-left transition active:scale-[0.99]",
          bare ? "p-4" : "animate-rise rounded-2xl border border-line bg-surface p-4"
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-muted">
            {match.status === "live" ? (
              <LiveBadge />
            ) : (
              <span className="rounded-full border border-line px-2 py-0.5 font-medium">
                {statusLabel}
              </span>
            )}
            <span>
              {match.date_time ? `${formatDate(match.date_time)} · ${formatTime(match.date_time)}` : "Data da definire"}
            </span>
          </div>
          <ShareButton title={`${home} vs ${away}`} text={shareText} path="/calendario" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-2">
            <TeamLogo url={match.home_team?.logo_url} name={match.home_team?.name} />
            <span className="truncate text-sm font-medium">{match.home_team?.name ?? "TBD"}</span>
          </div>

          <div className="px-3 text-center">
            {match.status === "scheduled" ? (
              <span className="font-display text-lg text-muted">vs</span>
            ) : (
              <span
                className={clsx(
                  "font-display tabular text-xl font-bold",
                  match.status === "live" ? "text-primary" : "text-white"
                )}
              >
                {match.home_score} - {match.away_score}
              </span>
            )}
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            <span className="truncate text-right text-sm font-medium">{match.away_team?.name ?? "TBD"}</span>
            <TeamLogo url={match.away_team?.logo_url} name={match.away_team?.name} />
          </div>
        </div>

        {match.venue && (
          <div className="mt-3 flex items-center gap-1 text-[11px] text-muted">
            <MapPin size={12} />
            {match.venue.name}
          </div>
        )}
      </button>

      {open && <MatchDetailModal match={match} onClose={() => setOpen(false)} />}
    </>
  );
}
