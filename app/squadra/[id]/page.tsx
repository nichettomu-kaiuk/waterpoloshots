import Image from "next/image";
import Link from "next/link";
import { getTeamWithRoster } from "@/lib/queries";

export default async function SquadraPage({ params }: { params: { id: string } }) {
  const { team, players } = await getTeamWithRoster(params.id);

  if (!team) {
    return (
      <main className="mx-auto w-full max-w-md px-5 py-10 text-center text-sm text-muted">Squadra non trovata.</main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-5 py-6">
      <div className="mb-6 flex items-center gap-4">
        {team.logo_url ? (
          <Image
            src={team.logo_url}
            alt={team.name}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full border border-line object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surface-raised font-display text-xl text-muted">
            {team.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <h1 className="font-display text-2xl font-bold">{team.name}</h1>
      </div>

      <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted">
        Rosa
      </h2>
      <div className="space-y-2">
        {players.map((p) => (
          <Link
            key={p.id}
            href={`/giocatore/${p.id}`}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5"
          >
            {p.photo_url ? (
              <Image
                src={p.photo_url}
                alt={`${p.first_name} ${p.last_name}`}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-raised font-display text-xs text-muted">
                {p.cap_number}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{p.first_name} {p.last_name}</p>
              <p className="text-[11px] text-muted">N. {p.cap_number} {p.position ? `· ${p.position}` : ""}</p>
            </div>
            <span className="font-display font-bold text-gold">{p.goals_count}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
