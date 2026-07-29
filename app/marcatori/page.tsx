import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { getTopScorers, getSettings } from "@/lib/queries";
import Hero from "@/components/Hero";
import ShareButton from "@/components/ShareButton";
import type { Player } from "@/lib/supabase/types";

// Standard "1224" competition ranking: players tied on goals share the same
// rank, and the next distinct tally skips ahead accordingly.
function withRanks(scorers: Player[]) {
  let rank = 0;
  let previousGoals: number | null = null;
  return scorers.map((p, i) => {
    if (p.goals_count !== previousGoals) rank = i + 1;
    previousGoals = p.goals_count;
    return { player: p, rank };
  });
}

export default async function MarcatoriPage() {
  const [allScorers, settings] = await Promise.all([getTopScorers(15), getSettings()]);
  const scorers = allScorers.filter((p) => p.goals_count > 0);
  const ranked = withRanks(scorers);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero />
      <div className="px-5 py-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Marcatori</h1>
          <ShareButton title="Marcatori" path="/marcatori" />
        </div>

        {settings?.marcatori_bg_url && (
          <div className="relative mb-5 h-40 w-full overflow-hidden rounded-2xl border border-line lg:h-56">
            <Image src={settings.marcatori_bg_url} alt="Marcatori" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-gold">
              <Trophy size={16} />
              <span className="font-display text-sm font-semibold uppercase tracking-widest">Classifica marcatori</span>
            </div>
          </div>
        )}

        {scorers.length === 0 ? (
          <p className="text-sm text-muted">Nessun gol registrato ancora.</p>
        ) : (
          <ol className="space-y-2">
            {ranked.map(({ player: p, rank }) => (
              <li key={p.id}>
                <Link
                  href={`/giocatore/${p.id}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 transition active:scale-[0.99]"
                >
                  <span className="w-5 shrink-0 text-center text-xs text-muted">{rank}</span>
                  {p.photo_url ? (
                    <Image
                      src={p.photo_url}
                      alt={`${p.first_name} ${p.last_name}`}
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-raised font-display text-xs text-muted">
                      {p.first_name[0]}{p.last_name[0]}
                    </div>
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {p.first_name} {p.last_name}
                  </span>
                  <span className="shrink-0 font-display text-lg font-bold text-gold">{p.goals_count}</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
