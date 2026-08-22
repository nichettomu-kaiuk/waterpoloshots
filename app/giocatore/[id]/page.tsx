import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPlayer, getSettings, getTeamWithRoster } from "@/lib/queries";
import Hero from "@/components/Hero";
import ShareButton from "@/components/ShareButton";

export default async function GiocatorePage({ params }: { params: { id: string } }) {
  const [{ player, team }, settings] = await Promise.all([
    getPlayer(params.id),
    getSettings(),
  ]);

  if (!player) {
    return (
      <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
        <Hero />
        <div className="px-5 py-10 text-center text-sm text-muted lg:px-8">Giocatore non trovato.</div>
      </main>
    );
  }

  const initials = `${player.first_name[0]}${player.last_name[0]}`;

  // Prev/next within the same team's roster (ordered by cap number), so the
  // arrows let you flip through all teammates. Wraps around at the ends.
  const roster = team ? (await getTeamWithRoster(team.id)).players : [];
  const rosterIndex = roster.findIndex((p) => p.id === player.id);
  const hasSiblings = roster.length > 1 && rosterIndex !== -1;
  const prevPlayer = hasSiblings ? roster[(rosterIndex - 1 + roster.length) % roster.length] : null;
  const nextPlayer = hasSiblings ? roster[(rosterIndex + 1) % roster.length] : null;

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero />
      <div className="px-5 py-6 lg:px-8">
        <div className="player-card overflow-hidden rounded-2xl border border-line bg-ink">
          {/* Top bar: team logo (white box) + team name + season */}
          <div className="flex items-stretch">
            <div className="player-badge-box flex w-20 shrink-0 items-center justify-center bg-white p-2 sm:w-24">
              {team?.logo_url ? (
                <Image
                  src={team.logo_url}
                  alt={team.name}
                  width={64}
                  height={64}
                  className="h-full max-h-16 w-full object-contain"
                />
              ) : (
                <span className="text-center text-[9px] font-display uppercase leading-tight text-ink/40">
                  Logo
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col justify-center bg-surface-raised px-4 py-2">
              <p className="truncate font-display text-lg font-bold uppercase tracking-tight sm:text-2xl">
                {team?.name ?? "Squadra"}
              </p>
              <p className="truncate text-xs uppercase tracking-widest text-muted sm:text-sm">
                {settings?.tournament_subtitle ?? "Stagione"}
              </p>
            </div>
          </div>

          {/* Body: large team-logo watermark + player photo, info panel —
              always side-by-side, even on mobile. */}
          <div className="flex flex-row">
            <div className="relative flex min-h-[280px] flex-1 items-end justify-center overflow-hidden bg-ink sm:min-h-[380px] lg:min-h-[460px]">
              {team?.logo_url && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${team.logo_url})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${team.logo_large_scale ?? 100}%`,
                    backgroundPosition: `${team.logo_large_x ?? 50}% ${team.logo_large_y ?? 50}%`,
                    opacity: 0.15,
                  }}
                />
              )}
              {player.photo_url ? (
                <Image
                  src={player.photo_url}
                  alt={`${player.first_name} ${player.last_name}`}
                  fill
                  className="relative object-contain object-bottom"
                  style={{
                    WebkitMaskImage:
                      "radial-gradient(ellipse 85% 85% at 50% 50%, black 60%, transparent 100%)",
                    maskImage:
                      "radial-gradient(ellipse 85% 85% at 50% 50%, black 60%, transparent 100%)",
                  }}
                  priority
                />
              ) : (
                <div className="relative z-10 mb-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-surface-raised font-display text-2xl text-gold sm:h-28 sm:w-28 sm:text-3xl lg:mb-8 lg:h-36 lg:w-36 lg:text-4xl">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex w-28 shrink-0 flex-col justify-start gap-2 border-l border-line bg-ink px-3 py-4 sm:w-40 sm:gap-3 sm:px-4 sm:py-5 lg:w-72 lg:gap-4 lg:px-6 lg:py-6">
              <div className="border-b border-line pb-2 sm:pb-3">
                <p className="text-[10px] uppercase tracking-widest text-muted sm:text-xs">Numero</p>
                <p className="player-cap-number font-display text-3xl font-bold text-gold sm:text-5xl lg:text-6xl">
                  {player.cap_number}
                </p>
                {player.position && (
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-muted sm:text-xs">
                    {player.position}
                  </p>
                )}
              </div>
              <div>
                <p className="font-display text-sm font-semibold sm:text-lg lg:text-xl">{player.first_name}</p>
                <p className="font-display text-lg font-bold uppercase sm:text-xl lg:text-2xl">{player.last_name}</p>
                <p className="mt-1 text-[10px] text-muted sm:text-xs">{player.goals_count} gol segnati</p>
              </div>
            </div>
          </div>
        </div>

        {(prevPlayer || nextPlayer) && (
          <div className="mt-4 flex items-center justify-center gap-4">
            {prevPlayer ? (
              <Link
                href={`/giocatore/${prevPlayer.id}`}
                aria-label="Giocatore precedente"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition hover:border-gold hover:text-gold"
              >
                <ChevronLeft size={18} />
              </Link>
            ) : (
              <span className="h-9 w-9" />
            )}
            {nextPlayer ? (
              <Link
                href={`/giocatore/${nextPlayer.id}`}
                aria-label="Giocatore successivo"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition hover:border-gold hover:text-gold"
              >
                <ChevronRight size={18} />
              </Link>
            ) : (
              <span className="h-9 w-9" />
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          {team ? (
            <Link href={`/squadra/${team.id}`} className="text-sm text-primary">
              Vai alla scheda squadra
            </Link>
          ) : (
            <span />
          )}
          <ShareButton title={`${player.first_name} ${player.last_name}`} path={`/giocatore/${player.id}`} />
        </div>
      </div>
    </main>
  );
}
