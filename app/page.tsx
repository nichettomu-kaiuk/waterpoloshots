import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { getTournaments } from "@/lib/queries";

// The site's first page: every campionato created from Admin → Campionati
// is listed here, and picking one enters it at /<slug>/... (home,
// calendario, classifiche, ...). Deliberately theme-agnostic — it isn't
// "inside" any tournament yet, so it only relies on the default brand
// tokens in globals.css (:root), not a tournament's own theme/colors.
export default async function CampionatiPage() {
  const tournaments = await getTournaments();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16 lg:max-w-2xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 bg-gold/10 text-gold">
          <Trophy size={26} />
        </div>
        <h1 className="font-display text-2xl font-bold">Campionati</h1>
        <p className="mt-2 text-sm text-muted">Scegli il campionato da consultare.</p>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-center text-sm text-muted">
          Nessun campionato disponibile ancora. Crea il primo da Admin → Campionati.
        </p>
      ) : (
        <div className="space-y-3">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/${t.slug}`}
              className="site-card flex animate-rise items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4 transition active:scale-[0.99]"
            >
              <span className="min-w-0">
                <span className="block truncate font-display text-lg font-bold">{t.name}</span>
                <span className="text-xs text-muted">{t.slug}</span>
              </span>
              <ArrowRight size={18} className="shrink-0 text-primary" />
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/admin"
        className="mt-10 block text-center text-xs text-muted transition hover:text-gold"
      >
        Pannello Admin
      </Link>
    </main>
  );
}
