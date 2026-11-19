import Image from "next/image";
import Link from "next/link";
import { getTeamWithRoster } from "@/lib/queries";
import Hero from "@/components/Hero";
import ShareButton from "@/components/ShareButton";

export default async function SquadraPage({ params }: { params: { id: string } }) {
  const { team, players: roster } = await getTeamWithRoster(params.id);
  const players = [...roster].sort((a, b) => a.cap_number - b.cap_number);

  if (!team) {
    return (
      <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
        <Hero />
        <div className="px-5 py-10 text-center text-sm text-muted lg:px-8">Squadra non trovata.</div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero />
      <div className="px-5 py-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {team.logo_url ? (
              <span className="cap-badge relative inline-block h-16 w-16 shrink-0">
                <Image
                  src={team.logo_url}
                  alt={team.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full border border-line object-cover"
                />
              </span>
            ) : (
              <span className="cap-badge relative inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-line bg-surface-raised font-display text-xl text-muted">
                {team.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div>
              <h1 className="font-display text-2xl font-bold">{team.name}</h1>
              {team.coach_name && (
                <p className="mt-0.5 text-sm text-muted">Allenatore: {team.coach_name}</p>
              )}
            </div>
          </div>
          <ShareButton title={team.name} path={`/squadra/${team.id}`} iconOnly />
        </div>

        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted">
          Rosa
        </h2>
        <div className="mb-1 grid grid-cols-[2rem_2.75rem_1fr_2rem] gap-3 px-3 text-[10px] uppercase tracking-widest text-muted">
          <span className="text-center">N.</span>
          <span />
          <span />
          <span className="text-right">Reti</span>
        </div>
        <div className="space-y-2">
          {players.map((p) => (
            <Link
              key={p.id}
              href={`/giocatore/${p.id}`}
              className="site-card grid grid-cols-[2rem_2.75rem_1fr_2rem] items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5"
            >
              <span className="w-8 text-center font-display text-xl font-bold text-gold">
                {p.cap_number}
              </span>
              {p.photo_url ? (
                <span className="cap-badge relative inline-block h-11 w-11 shrink-0">
                  <Image
                    src={p.photo_url}
                    alt={`${p.first_name} ${p.last_name}`}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                </span>
              ) : (
                <span className="cap-badge relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-raised font-display text-xs text-muted">
                  {p.first_name[0]}{p.last_name[0]}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.first_name} {p.last_name}</p>
                {p.position && <p className="text-[11px] capitalize text-muted">{p.position}</p>}
              </div>
              {p.goals_count > 0 && (
                <span className="text-right font-display font-bold text-gold">{p.goals_count}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
