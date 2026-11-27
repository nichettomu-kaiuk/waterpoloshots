import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Trophy, Lock } from "lucide-react";
import { getTournaments } from "@/lib/queries";

// "/" no longer belongs to a single tournament. With one tournament it goes
// straight there (same experience as before); with several it lets the
// visitor pick one.
export default async function TournamentChooserPage() {
  const { tournaments, error } = await getTournaments();

  if (tournaments.length === 1) redirect(`/${tournaments[0].slug}`);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-5 py-10 lg:max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={22} className="text-gold" />
          <h1 className="font-display text-2xl font-bold">Campionati</h1>
        </div>
        <Link
          href="/admin"
          aria-label="Pannello Admin"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition hover:border-gold hover:text-gold"
        >
          <Lock size={15} />
        </Link>
      </div>

      {error ? (
        <p className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm text-primary">
          Database da aggiornare: esegui l&apos;ultimo blocco di migrazione (&quot;MULTI-TOURNAMENT&quot;) in
          supabase/schema.sql. Dettaglio: {error}
        </p>
      ) : tournaments.length === 0 ? (
        <p className="text-sm text-muted">Nessun campionato configurato ancora.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tournaments.map((t) => (
            <li key={t.id}>
              <Link
                href={`/${t.slug}`}
                className="site-card flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition active:scale-[0.99]"
              >
                {t.logo_url ? (
                  <Image
                    src={t.logo_url}
                    alt={t.tournament_title}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full border border-gold/50 object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface-raised text-gold">
                    <Trophy size={20} />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate font-display text-lg font-bold">{t.tournament_title}</span>
                  {t.tournament_subtitle && (
                    <span className="block truncate text-sm text-muted">{t.tournament_subtitle}</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
