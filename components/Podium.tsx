import Image from "next/image";
import Link from "next/link";
import type { Player } from "@/lib/supabase/types";

type ScorerGroup = { goals: number; players: Player[] };

// Groups consecutive players that share the same goal tally, so ties on the
// podium (or anywhere in the ranking) are represented as a single group
// instead of arbitrarily picking one name per position.
function groupByGoals(players: Player[]): ScorerGroup[] {
  const groups: ScorerGroup[] = [];
  for (const p of players) {
    const last = groups[groups.length - 1];
    if (last && last.goals === p.goals_count) {
      last.players.push(p);
    } else {
      groups.push({ goals: p.goals_count, players: [p] });
    }
  }
  return groups;
}

function PlayerAvatar({ player, size }: { player: Player; size: number }) {
  const className = "shrink-0 rounded-full border-2 border-gold object-cover";
  if (player.photo_url) {
    return (
      <Image
        src={player.photo_url}
        alt={`${player.first_name} ${player.last_name}`}
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full border-2 border-gold bg-surface-raised font-display text-xs text-gold`}
    >
      {player.first_name[0]}
      {player.last_name[0]}
    </div>
  );
}

function PodiumColumn({ group, heightClass }: { group: ScorerGroup; heightClass: string }) {
  const tied = group.players.length > 1;
  const avatarSize = tied ? 40 : 56;

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mb-2 flex -space-x-3">
        {group.players.map((p) => (
          <Link key={p.id} href={`/giocatore/${p.id}`}>
            <PlayerAvatar player={p} size={avatarSize} />
          </Link>
        ))}
      </div>

      <div className="space-y-0.5 text-center">
        {group.players.map((p) => (
          <Link
            key={p.id}
            href={`/giocatore/${p.id}`}
            className="block max-w-[110px] truncate text-xs font-medium"
          >
            {p.last_name}
          </Link>
        ))}
      </div>

      <p className="font-display text-lg font-bold text-gold">{group.goals}</p>
      <div className={`mt-2 w-full ${heightClass} rounded-t-lg border border-line bg-gradient-to-t from-gold/25 to-transparent`} />
    </div>
  );
}

export default function Podium({ scorers }: { scorers: Player[] }) {
  const groups = groupByGoals(scorers);
  const podiumGroups = groups.slice(0, 3);
  const restGroups = groups.slice(3);

  // Visual podium order: 2nd place, 1st place (tallest, centre), 3rd place.
  const [gold, silver, bronze] = podiumGroups;
  const orderedColumns: { group: ScorerGroup; heightClass: string }[] = [];
  if (silver) orderedColumns.push({ group: silver, heightClass: "h-20" });
  if (gold) orderedColumns.push({ group: gold, heightClass: "h-28" });
  if (bronze) orderedColumns.push({ group: bronze, heightClass: "h-16" });

  // Rank shown in the list below the podium, accounting for how many
  // players already occupy the ranks above each group (standard "1224"
  // competition ranking: two players tied for 1st pushes the next group to
  // rank 3, not rank 2).
  let rankCursor = podiumGroups.reduce((sum, g) => sum + g.players.length, 0);

  return (
    <div>
      <div className="flex items-end justify-center gap-3 px-2 pt-4">
        {orderedColumns.map(({ group, heightClass }) => (
          <PodiumColumn key={group.goals} group={group} heightClass={heightClass} />
        ))}
      </div>

      {restGroups.length > 0 && (
        <ol className="mt-6 space-y-2">
          {restGroups.map((group) => {
            const rank = rankCursor + 1;
            rankCursor += group.players.length;
            return group.players.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-xs text-muted">{rank}</span>
                  <Link href={`/giocatore/${p.id}`} className="text-sm">
                    {p.first_name} {p.last_name}
                  </Link>
                </div>
                <span className="font-display tabular font-semibold text-gold">{p.goals_count}</span>
              </li>
            ));
          })}
        </ol>
      )}
    </div>
  );
}
