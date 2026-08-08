import Image from "next/image";
import Link from "next/link";
import { getPlayer, getSettings } from "@/lib/queries";
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

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero />
      <div className="px-5 py-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-line bg-ink">
          {/* Top bar: team logo (white box) + team name + season */}
          <div className="flex items-stretch">
            <div className="flex w-20 shrink-0 items-center justify-center bg-white p-2 sm:w-24">
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

          {/* Body: large team-logo watermark + player photo, info panel */}
          <div className="flex flex-col lg:flex-row">
            <div className="relative flex min-h-[280px] flex-1 items-end justify-center overflow-hidden bg-ink lg:min-h-[380px]">
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
                  priority
                />
              ) : (
                <div className="relative z-10 mb-8 flex h-36 w-36 items-center justify-center rounded-full border-2 border-gold bg-surface-raised font-display text-4xl text-gold">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center gap-4 border-t border-line bg-ink px-6 py-6 lg:w-72 lg:shrink-0 lg:border-l lg:border-t-0">
              <div className="border-b border-line pb-3">
                <p className="text-xs uppercase tracking-widest text-muted">Numero</p>
                <p className="font-display text-4xl font-bold text-gold">{player.cap_number}</p>
              </div>
              <div>
                <p className="font-display text-xl font-semibold">{player.first_name}</p>
                <p className="font-display text-2xl font-bold uppercase">{player.last_name}</p>
                <p className="mt-1 text-xs text-muted">{player.goals_count} gol segnati</p>
              </div>
            </div>
          </div>
        </div>

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
