import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";
import { getTeams } from "@/lib/queries";

export default async function SquadrePage() {
  const teams = await getTeams();

  return (
    <main className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
      <div className="mb-5 flex items-center gap-2">
        <Users size={20} className="text-primary" />
        <h1 className="font-display text-2xl font-bold">Squadre</h1>
      </div>

      {teams.length === 0 ? (
        <p className="text-sm text-muted">Nessuna squadra registrata ancora.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {teams.map((t) => (
            <Link
              key={t.id}
              href={`/squadra/${t.id}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-center transition active:scale-95"
            >
              {t.logo_url ? (
                <Image
                  src={t.logo_url}
                  alt={t.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full border border-line object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface-raised font-display text-lg text-muted">
                  {t.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium">{t.name}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
