import Link from "next/link";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { getAllPlayers } from "@/lib/queries";

export default async function GiocatoriPage() {
  const players = await getAllPlayers();

  return (
    <main className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
      <div className="mb-5 flex items-center gap-2">
        <UserRound size={20} className="text-primary" />
        <h1 className="font-display text-2xl font-bold">Giocatori</h1>
      </div>

      {players.length === 0 ? (
        <p className="text-sm text-muted">Nessun giocatore registrato ancora.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
          {players.map((p) => (
            <Link
              key={p.id}
              href={`/giocatore/${p.id}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 transition active:scale-[0.99]"
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
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.first_name} {p.last_name}</p>
                <p className="truncate text-[11px] text-muted">
                  {p.team?.name ?? "Senza squadra"} · N. {p.cap_number}
                </p>
              </div>
              <span className="shrink-0 font-display font-bold text-gold">{p.goals_count}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
