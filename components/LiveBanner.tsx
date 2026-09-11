import Image from "next/image";
import Link from "next/link";
import type { Match } from "@/lib/supabase/types";

// Matchday headline band shown on the home page while a match is live —
// the full-width scoreboard from the UI mockups. Uses the brand tokens, so
// it follows every theme (and the gold accent of the Magazine theme).
export default function LiveBanner({ match }: { match: Match }) {
  const home = match.home_team;
  const away = match.away_team;

  return (
    <section className="live-banner bg-primary px-5 py-5 text-white lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulseDot rounded-full bg-white" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">In diretta</span>
          {match.venue && <span className="text-[11px] opacity-80">{match.venue.name}</span>}
        </div>

        <div className="flex flex-1 items-center justify-between gap-4 lg:justify-center lg:gap-8">
          <div className="flex flex-1 items-center justify-end gap-3 text-right">
            <span className="font-display text-base font-bold leading-tight lg:text-2xl">
              {home?.name ?? "Casa"}
            </span>
            {home?.logo_url && (
              <Image
                src={home.logo_url}
                alt={home.name}
                width={44}
                height={44}
                className="h-9 w-9 shrink-0 rounded-md bg-white object-contain p-0.5 lg:h-11 lg:w-11"
              />
            )}
          </div>

          <span className="tabular font-display text-3xl font-bold lg:text-5xl">
            {match.home_score} — {match.away_score}
          </span>

          <div className="flex flex-1 items-center gap-3">
            {away?.logo_url && (
              <Image
                src={away.logo_url}
                alt={away.name}
                width={44}
                height={44}
                className="h-9 w-9 shrink-0 rounded-md bg-white object-contain p-0.5 lg:h-11 lg:w-11"
              />
            )}
            <span className="font-display text-base font-bold leading-tight lg:text-2xl">
              {away?.name ?? "Ospiti"}
            </span>
          </div>
        </div>

        {match.stream_url && (
          <Link
            href={match.stream_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 self-start rounded-md bg-white px-4 py-2 text-sm font-semibold text-ink lg:self-auto"
          >
            Segui la diretta
          </Link>
        )}
      </div>
    </section>
  );
}
