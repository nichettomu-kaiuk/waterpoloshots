import type { SupabaseClient } from "@supabase/supabase-js";

// Season goal totals are DERIVED from the match_goals ledger (one row per
// goal), the same way match scores are. players.goals_count is no longer
// the source of truth: it used to drift whenever a match, matchday, team or
// player was deleted (the cascade removed the goals but not the counter).
//
// Supabase returns at most 1000 rows per request and a season easily has
// more goals than that, so the ledger is read in pages.
const PAGE_SIZE = 1000;

export async function fetchGoalCounts(
  supabase: SupabaseClient<any, any, any>
): Promise<Record<string, number> | null> {
  const counts: Record<string, number> = {};
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("match_goals")
      .select("player_id")
      .not("player_id", "is", null)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) return null;
    for (const row of data ?? []) {
      const id = (row as { player_id: string }).player_id;
      counts[id] = (counts[id] ?? 0) + 1;
    }
    if (!data || data.length < PAGE_SIZE) break;
  }
  return counts;
}

// Overrides goals_count on each player with the derived total. If the ledger
// couldn't be read (counts === null) the stored value is left untouched.
export function withGoalCounts<T extends { id: string; goals_count: number }>(
  players: T[],
  counts: Record<string, number> | null
): T[] {
  if (!counts) return players;
  return players.map((p) => ({ ...p, goals_count: counts[p.id] ?? 0 }));
}
