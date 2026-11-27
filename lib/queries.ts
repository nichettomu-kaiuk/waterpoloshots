import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { fetchGoalCounts, withGoalCounts } from "@/lib/goals";
import type { Match, NewsPost, Player, Settings, StandingRow, Team, Venue } from "@/lib/supabase/types";

// Every function degrades gracefully to `null`/`[]` if Supabase env vars are
// missing, so the UI can be previewed before the project is connected.
//
// MULTI-TOURNAMENT: every row of `settings` is a tournament and each query
// below is scoped to one tournament id (teams, venues, matches and news carry
// tournament_id; players and goals follow through their team / match).

// All tournaments, oldest first (the first one is the default tournament).
// `error` is set when the query itself fails — typically because the
// multi-tournament migration at the bottom of supabase/schema.sql has not
// been run yet.
export async function getTournaments(): Promise<{ tournaments: Settings[]; error: string | null }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });
    if (error) return { tournaments: [], error: error.message };
    return { tournaments: (data as Settings[]) ?? [], error: null };
  } catch (e) {
    return { tournaments: [], error: e instanceof Error ? e.message : "errore sconosciuto" };
  }
}

export async function getDefaultTournament(): Promise<Settings | null> {
  const { tournaments } = await getTournaments();
  return tournaments[0] ?? null;
}

// Cached per request: the layout and the page both need it.
export const getTournamentBySlug = cache(async (slug: string): Promise<Settings | null> => {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("settings").select("*").eq("slug", slug).maybeSingle();
    return (data as Settings) ?? null;
  } catch {
    return null;
  }
});

const MATCH_SELECT = `
  id, home_team_id, away_team_id, venue_id, date_time, status, home_score, away_score, round_type, giornata, stream_url,
  home_team:teams!matches_home_team_id_fkey ( id, name, logo_url, created_at ),
  away_team:teams!matches_away_team_id_fkey ( id, name, logo_url, created_at ),
  venue:venues ( id, name, location_tag, address )
`;

export async function getLiveMatches(tournamentId: string): Promise<Match[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("matches")
      .select(MATCH_SELECT)
      .eq("tournament_id", tournamentId)
      .eq("status", "live")
      .order("date_time", { ascending: true });
    return (data as unknown as Match[]) ?? [];
  } catch {
    return [];
  }
}

export async function getUpcomingMatches(tournamentId: string, limit = 5): Promise<Match[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("matches")
      .select(MATCH_SELECT)
      .eq("tournament_id", tournamentId)
      .eq("status", "scheduled")
      .order("date_time", { ascending: true })
      .limit(limit);
    return (data as unknown as Match[]) ?? [];
  } catch {
    return [];
  }
}

export async function getRecentResults(tournamentId: string, limit = 5): Promise<Match[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("matches")
      .select(MATCH_SELECT)
      .eq("tournament_id", tournamentId)
      .eq("status", "completed")
      // Newest first; a completed match with no date goes last instead of
      // first (Postgres puts NULLs first in descending order).
      .order("date_time", { ascending: false, nullsFirst: false })
      .limit(limit);
    return (data as unknown as Match[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAllMatches(tournamentId: string, roundType?: string, search?: string): Promise<Match[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from("matches")
      .select(MATCH_SELECT)
      .eq("tournament_id", tournamentId)
      .order("giornata", { ascending: true })
      .order("date_time", { ascending: true });
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

export async function getNewsPosts(tournamentId: string, limit = 6): Promise<NewsPost[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("news_posts")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getNewsPost(tournamentId: string, id: string): Promise<NewsPost | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("news_posts")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("id", id)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function getTeams(tournamentId: string): Promise<Team[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("teams").select("*").eq("tournament_id", tournamentId).order("name");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getTeamWithRoster(
  tournamentId: string,
  teamId: string
): Promise<{ team: Team | null; players: Player[] }> {
  try {
    const supabase = createClient();
    const { data: team } = await supabase
      .from("teams")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("id", teamId)
      .maybeSingle();
    // A team from another tournament is simply "not found" here.
    if (!team) return { team: null, players: [] };
    const { data: players } = await supabase.from("players").select("*").eq("team_id", teamId).order("cap_number");
    const counts = await fetchGoalCounts(supabase);
    return { team: team ?? null, players: withGoalCounts(players ?? [], counts) };
  } catch {
    return { team: null, players: [] };
  }
}

export async function getPlayer(
  tournamentId: string,
  playerId: string
): Promise<{ player: Player | null; team: Team | null }> {
  try {
    const supabase = createClient();
    const { data: player } = await supabase.from("players").select("*").eq("id", playerId).maybeSingle();
    if (!player) return { player: null, team: null };
    const { data: team } = await supabase
      .from("teams")
      .select("*")
      .eq("id", player.team_id)
      .eq("tournament_id", tournamentId)
      .maybeSingle();
    if (!team) return { player: null, team: null };
    const counts = await fetchGoalCounts(supabase);
    return { player: withGoalCounts([player], counts)[0], team: team ?? null };
  } catch {
    return { player: null, team: null };
  }
}

export async function getVenues(tournamentId: string): Promise<Venue[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("venues").select("*").eq("tournament_id", tournamentId).order("name");
    return data ?? [];
  } catch {
    return [];
  }
}

// Players of a tournament = players of its teams (resolved in two steps
// instead of an embedded-filter join, which has proven fragile on some
// Supabase projects).
async function playersOfTournament(
  supabase: ReturnType<typeof createClient>,
  tournamentId: string
): Promise<(Player & { team?: Team })[]> {
  const { data: teams } = await supabase.from("teams").select("*").eq("tournament_id", tournamentId);
  const teamList = (teams as Team[]) ?? [];
  if (teamList.length === 0) return [];
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .in("team_id", teamList.map((t) => t.id));
  const byId = new Map(teamList.map((t) => [t.id, t]));
  return ((players as Player[]) ?? []).map((p) => ({ ...p, team: byId.get(p.team_id) }));
}

export async function getAllPlayers(tournamentId: string): Promise<(Player & { team?: Team })[]> {
  try {
    const supabase = createClient();
    const data = (await playersOfTournament(supabase, tournamentId)).sort((a, b) =>
      a.last_name.localeCompare(b.last_name, "it")
    );
    const counts = await fetchGoalCounts(supabase);
    return withGoalCounts(data, counts);
  } catch {
    return [];
  }
}

// No limit by default: the scorers ranking must list every player with goals.
export async function getTopScorers(tournamentId: string, limit?: number): Promise<Player[]> {
  try {
    const supabase = createClient();
    const data = await playersOfTournament(supabase, tournamentId);
    const counts = await fetchGoalCounts(supabase);
    const players = withGoalCounts(data, counts);
    // Goals desc, then surname/first name so ties always come out in the
    // same order.
    players.sort(
      (a, b) =>
        b.goals_count - a.goals_count ||
        a.last_name.localeCompare(b.last_name, "it") ||
        a.first_name.localeCompare(b.first_name, "it")
    );
    return limit === undefined ? players : players.slice(0, limit);
  } catch {
    return [];
  }
}

// Computes the team standings from completed matches. Kept in the app layer
// (rather than a DB view) so it stays easy to read and adjust point rules.
export async function getStandings(tournamentId: string, roundType?: string): Promise<StandingRow[]> {
  try {
    const supabase = createClient();
    const teamsRes = await supabase.from("teams").select("*").eq("tournament_id", tournamentId);
    let matchQuery = supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("status", "completed");
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
