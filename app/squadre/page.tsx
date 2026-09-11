import Link from "next/link";
import Image from "next/image";
import { getStandings, getTeams } from "@/lib/queries";
import Hero from "@/components/Hero";

export default async function SquadrePage() {
  const [teams, standings] = await Promise.all([getTeams(), getStandings()]);

  // Posizione e punti presi dalla classifica quando esiste; in pre-stagione
  // (nessuna partita conclusa) la riga mostra solo il nome della squadra.
  const rank = new Map(standings.map((row, i) => [row.team.id, { pos: i + 1, points: row.points, played: row.played }]));
  const seasonStarted = standings.some((r) => r.played > 0);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero />
      <div className="px-5 py-6 lg:px-8">
        <div className="mb-5 flex items-baseline justify-between">
          <h1 className="font-display text-2xl font-bold">Squadre</h1>
          <span className="text-xs uppercase tracking-widest text-muted">{teams.length} iscritte</span>
        </div>

        {teams.length === 0 ? (
          <p className="text-sm text-muted">Nessuna squadra registrata ancora.</p>
        ) : (
          <div className="grid gap-x-8 sm:grid-cols-2">
            {teams.map((t) => {
              const info = rank.get(t.id);
              return (
                <Link
                  key={t.id}
                  href={`/squadra/${t.id}`}
                  className="site-card flex items-center gap-4 border-b border-line py-4 transition active:scale-[0.99]"
                >
                  {t.logo_url ? (
                    <span className="cap-badge relative inline-block h-14 w-14 shrink-0">
                      <Image
                        src={t.logo_url}
                        alt={t.name}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-full border border-line object-cover"
                      />
                    </span>
                  ) : (
                    <span className="cap-badge relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line bg-surface-raised font-display text-lg text-muted">
                      {t.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-display text-lg font-bold leading-tight">{t.name}</span>
                    {seasonStarted && info && (
                      <span className="mt-0.5 block text-xs text-muted">
                        {info.pos}ª in classifica · {info.points} {info.points === 1 ? "punto" : "punti"}
                      </span>
                    )}
                    <span className="mt-1 block text-xs text-primary">Rosa e calendario →</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
