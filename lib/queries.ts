import { createClient } from "@/lib/supabase/server";
import type { Match, NewsPost, Player, Settings, StandingRow, Team, Venue } from "@/lib/supabase/types";

// Every function degrades gracefully to `null`/`[]` if Supabase env vars are
// missing, so the UI can be previewed before the project is connected.

export async function getSettings(): Promise<Settings | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

const MATCH_SELECT = `
  id, home_team_id, away_team_id, venue_id, date_time, status, home_score, away_score, round_type,
  home_team:teams!matches_home_team_id_fkey ( id, name, logo_url, created_at ),
  away_team:teams!matches_away_team_id_fkey ( id, name, logo_url, created_at ),
  venue:venues ( id, name, location_tag, address )
`;

export async function getLiveMatches(): Promise<Match[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("matches")
      .select(MATCH_SELECT)
      .eq("status", "live")
      .order("date_time", { ascending: true });
    return (data as unknown as Match[]) ?? [];
  } catch {
    return [];
  }
}

export async function getUpcomingMatches(limit = 5): Promise<Match[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("matches")
      .select(MATCH_SELECT)
      .eq("status", "scheduled")
      .order("date_time", { ascending: true })
      .limit(limit);
    return (data as unknown as Match[]) ?? [];
  } catch {
    return [];
  }
}

export async function getRecentResults(limit = 5): Promise<Match[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("matches")
      .select(MATCH_SELECT)
      .eq("status", "completed")
      .order("date_time", { ascending: false })
      .limit(limit);
    return (data as unknown as Match[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAllMatches(roundType?: string, search?: string): Promise<Match[]> {
  try {
    const supabase = createClient();
    let query = supabase.from("matches").select(MATCH_SELECT).order("date_time", { ascending: true });
    if (roundType) query = query.eq("round_type", roundType);
    const { data } = await query;
    let matches = (data as unknown as Match[]) ?? [];
    if (search) {
      const s = search.toLowerCase();
      matches = matches.filter(
        (m) =>
          m.home_team?.name.toLowerCase().includes(s) ||
          m.away_team?.name.toLowerCase().includes(s)
      );
    }
    return matches;
  } catch {
    return [];
  }
}

export async function getNewsPosts(limit = 6): Promise<NewsPost[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("news_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getNewsPost(id: string): Promise<NewsPost | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("news_posts").select("*").eq("id", id).maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function getTeams(): Promise<Team[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("teams").select("*").order("name");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getTeamWithRoster(teamId: string): Promise<{ team: Team | null; players: Player[] }> {
  try {
    const supabase = createClient();
    const [{ data: team }, { data: players }] = await Promise.all([
      supabase.from("teams").select("*").eq("id", teamId).maybeSingle(),
      supabase.from("players").select("*").eq("team_id", teamId).order("cap_number"),
    ]);
    return { team: team ?? null, players: players ?? [] };
  } catch {
    return { team: null, players: [] };
  }
}

export async function getPlayer(playerId: string): Promise<{ player: Player | null; team: Team | null }> {
  try {
    const supabase = createClient();
    const { data: player } = await supabase.from("players").select("*").eq("id", playerId).maybeSingle();
    if (!player) return { player: null, team: null };
    const { data: team } = await supabase.from("teams").select("*").eq("id", player.team_id).maybeSingle();
    return { player, team: team ?? null };
  } catch {
    return { player: null, team: null };
  }
}

export async function getVenues(): Promise<Venue[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("venues").select("*").order("name");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getTopScorers(limit = 10): Promise<Player[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("players")
      .select("*, team:teams(*)")
      .order("goals_count", { ascending: false })
      .limit(limit);
    return (data as unknown as Player[]) ?? [];
  } catch {
    return [];
  }
}

// Computes the team standings from completed matches. Kept in the app layer
// (rather than a DB view) so it stays easy to read and adjust point rules.
export async function getStandings(roundType?: string): Promise<StandingRow[]> {
  try {
    const supabase = createClient();
    const teamsRes = await supabase.from("teams").select("*");
    let matchQuery = supabase.from("matches").select("*").eq("status", "completed");
    if (roundType) matchQuery = matchQuery.eq("round_type", roundType);
    const matchesRes = await matchQuery;

    const teams = teamsRes.data ?? [];
    const matches = matchesRes.data ?? [];

    const table = new Map<string, StandingRow>();
    for (const team of teams) {
      table.set(team.id, {
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_diff: 0,
        points: 0,
      });
    }

    for (const m of matches) {
      const home = table.get(m.home_team_id);
      const away = table.get(m.away_team_id);
      if (!home || !away) continue;

      home.played++;
      away.played++;
      home.goals_for += m.home_score;
      home.goals_against += m.away_score;
      away.goals_for += m.away_score;
      away.goals_against += m.home_score;

      if (m.home_score > m.away_score) {
        home.won++;
        away.lost++;
        home.points += 3;
      } else if (m.home_score < m.away_score) {
        away.won++;
        home.lost++;
        away.points += 3;
      } else {
        home.drawn++;
        away.drawn++;
        home.points += 1;
        away.points += 1;
      }
    }

    const rows = Array.from(table.values()).map((r) => ({
      ...r,
      goal_diff: r.goals_for - r.goals_against,
    }));

    rows.sort((a, b) => b.points - a.points || b.goal_diff - a.goal_diff || b.goals_for - a.goals_for);
    return rows;
  } catch {
    return [];
  }
}
