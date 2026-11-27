import Link from "next/link";
import type { Player } from "@/lib/supabase/types";

// Scorers ranking WITHOUT a podium. Players with the same number of goals
// share the same position, and the next distinct tally takes the next
// position ("dense" ranking: five players tied for 2nd are all 2nd, and the
// following group is 3rd). `scorers` must already be sorted by goals desc.
function withPositions(players: Player[]): { position: number; player: Player }[] {
  const rows: { position: number; player: Player }[] = [];
  let position = 0;
  let lastGoals: number | null = null;
  for (const player of players) {
    if (player.goals_count !== lastGoals) {
      position += 1;
      lastGoals = player.goals_count;
    }
    rows.push({ position, player });
  }
  return rows;
}

export default function ScorersList({ scorers, slug }: { scorers: Player[]; slug: string }) {
  const rows = withPositions(scorers);

  return (
    <ol className="space-y-2">
      {rows.map(({ position, player }) => (
        <li
          key={player.id}
          className="site-card flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2.5"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 text-center font-display text-sm font-semibold text-muted">{position}</span>
            <Link href={`/${slug}/giocatore/${player.id}`} className="text-sm">
              {player.first_name} {player.last_name}
            </Link>
          </div>
          <span className="font-display tabular font-semibold text-gold">{player.goals_count}</span>
        </li>
      ))}
    </ol>
  );
}
