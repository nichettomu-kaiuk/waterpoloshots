import type { SupabaseClient } from "@supabase/supabase-js";

// Season goal totals are DERIVED from the match_goals ledger (one row per
// goal), the same way match scores are. players.goals_count is no longer
// the source of truth: it used to drift whenever a match, matchday, team or
// player was deleted (the cascade removed the goals but not the counter).
//
// Supabase returns at most 1000 rows per request and a season easily has
// more goals than that, so the ledger is read in pages.
const PAGE_SIZE = 1000;

// Fast path: the view player_goal_totals (see the PERFORMANCE block at the
// bottom of supabase/schema.sql) already holds one row per scorer, so this is
// a few hundred rows instead of every goal ever scored. If the view doesn't
// exist yet (migration not run) we fall back to counting the ledger and
// remember that, so we don't retry a failing request on every page view.
let totalsViewMissing = false;

async function countsFromView(supabase: SupabaseClient<any, any, any>): Promise<Record<string, number> | null> {
  const counts: Record<string, number> = {};
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("player_goal_totals")
      .select("player_id, goals")
      .order("player_id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) return null;
    for (const row of data ?? []) {
      const r = row as { player_id: string; goals: number };
      counts[r.player_id] = r.goals;
    }
    if (!data || data.length < PAGE_SIZE) break;
  }
  return counts;
}

async function countsFromLedger(supabase: SupabaseClient<any, any, any>): Promise<Record<string, number> | null> {
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

export async function fetchGoalCounts(
  supabase: SupabaseClient<any, any, any>
): Promise<Record<string, number> | null> {
  if (!totalsViewMissing) {
    const fromView = await countsFromView(supabase);
    if (fromView) return fromView;
    totalsViewMissing = true;
  }
  return countsFromLedger(supabase);
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
