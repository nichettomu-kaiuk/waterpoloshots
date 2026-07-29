import Image from "next/image";
import Link from "next/link";
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

// Approximate overlay spots for a typical 3-step podium graphic (gold
// centred and tallest, silver left, bronze right, shot straight-on). If the
// admin's image has a different layout these will need nudging — ask and
// we can expose the offsets as editable fields instead of hardcoding them.
const PODIUM_SPOTS = [
  { rank: 1, left: "50%", top: "24%", size: 64 },
  { rank: 2, left: "21%", top: "40%", size: 52 },
  { rank: 3, left: "79%", top: "46%", size: 52 },
] as const;

function PodiumAvatar({ player, size }: { player: Player; size: number }) {
  if (player.photo_url) {
    return (
      <Image
        src={player.photo_url}
        alt={`${player.first_name} ${player.last_name}`}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="rounded-full border-2 border-gold object-cover shadow-lg"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full border-2 border-gold bg-ink/80 font-display text-sm text-gold shadow-lg"
    >
      {player.first_name[0]}{player.last_name[0]}
    </div>
  );
}

export default async function MarcatoriPage() {
  const [allScorers, settings] = await Promise.all([getTopScorers(15), getSettings()]);
  const scorers = allScorers.filter((p) => p.goals_count > 0);
  const ranked = withRanks(scorers);
  const hasPodiumImage = Boolean(settings?.marcatori_bg_url);
  const rest = hasPodiumImage ? ranked.filter((r) => r.rank > 3) : ranked;

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero />
      <div className="px-5 py-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Marcatori</h1>
          <ShareButton title="Marcatori" path="/marcatori" />
        </div>

        {hasPodiumImage && (
          <div className="relative mb-6 w-full overflow-hidden rounded-2xl border border-line">
            <Image
              src={settings!.marcatori_bg_url!}
              alt="Podio marcatori"
              width={900}
              height={900}
              className="h-auto w-full object-contain"
              priority
            />
            {PODIUM_SPOTS.map(({ rank, left, top, size }) => {
              const entry = ranked.find((r) => r.rank === rank);
              if (!entry) return null;
              const { player } = entry;
              return (
                <Link
                  key={rank}
                  href={`/giocatore/${player.id}`}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                  style={{ left, top }}
                >
                  <PodiumAvatar player={player} size={size} />
                  <span className="max-w-[90px] truncate text-center text-xs font-semibold text-white drop-shadow">
                    {player.last_name}
                  </span>
                  <span className="font-display text-sm font-bold text-gold drop-shadow">
                    {player.goals_count}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {scorers.length === 0 ? (
          <p className="text-sm text-muted">Nessun gol registrato ancora.</p>
        ) : rest.length === 0 && hasPodiumImage ? null : (
          <ol className="space-y-2">
            {rest.map(({ player: p, rank }) => (
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
