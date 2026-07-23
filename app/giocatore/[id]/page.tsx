import Image from "next/image";
import Link from "next/link";
import { getPlayer } from "@/lib/queries";

export default async function GiocatorePage({ params }: { params: { id: string } }) {
  const { player, team } = await getPlayer(params.id);

  if (!player) {
    return <main className="px-5 py-10 text-center text-sm text-muted">Giocatore non trovato.</main>;
  }

  return (
    <main className="px-5 py-8 text-center">
      {player.photo_url ? (
        <Image
          src={player.photo_url}
          alt={`${player.first_name} ${player.last_name}`}
          width={96}
          height={96}
          className="mx-auto mb-4 h-24 w-24 rounded-full border-2 border-gold object-cover"
        />
      ) : (
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold bg-surface-raised font-display text-2xl text-gold">
          {player.first_name[0]}{player.last_name[0]}
        </div>
      )}
      <h1 className="font-display text-2xl font-bold">{player.first_name} {player.last_name}</h1>
      {team && (
        <Link href={`/squadra/${team.id}`} className="mt-1 inline-block text-sm text-primary">
          {team.name}
        </Link>
      )}

      <div className="mx-auto mt-6 grid max-w-xs grid-cols-3 gap-3">
        <div className="rounded-xl border border-line bg-surface py-3">
          <p className="font-display text-xl font-bold text-gold">{player.goals_count}</p>
          <p className="text-[11px] text-muted">Gol</p>
        </div>
        <div className="rounded-xl border border-line bg-surface py-3">
          <p className="font-display text-xl font-bold">{player.cap_number}</p>
          <p className="text-[11px] text-muted">Calottina</p>
        </div>
        <div className="rounded-xl border border-line bg-surface py-3">
          <p className="font-display text-sm font-bold capitalize">{player.position ?? "—"}</p>
          <p className="text-[11px] text-muted">Ruolo</p>
        </div>
      </div>
    </main>
  );
}
