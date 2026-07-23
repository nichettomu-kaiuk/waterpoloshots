export type MatchStatus = "scheduled" | "live" | "completed";
export type RoundType = "andata" | "ritorno";
export type PlayerRole = "portiere" | "difensore" | "centroboa" | "attaccante";

export interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  first_name: string;
  last_name: string;
  cap_number: number;
  photo_url: string | null;
  position: PlayerRole | null;
  goals_count: number;
}

export interface Venue {
  id: string;
  name: string;
  location_tag: string | null;
  address: string | null;
}

export interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  venue_id: string | null;
  date_time: string;
  status: MatchStatus;
  home_score: number;
  away_score: number;
  round_type: RoundType | null;
  home_team?: Team;
  away_team?: Team;
  venue?: Venue;
}

export interface MatchGoal {
  id: string;
  match_id: string;
  player_id: string;
  team_id: string;
  quarter: number | null;
  goal_time: string | null;
}

export interface Settings {
  id: string;
  tournament_title: string;
  tournament_subtitle: string | null;
  logo_url: string | null;
  home_bg_url: string | null;
  header_bg_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  active_round: string | null;
}

export interface StandingRow {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
}

// Minimal typed schema for the Supabase client generic. Regenerate with
// `supabase gen types typescript` once the project is linked for full safety.
export interface Database {
  public: {
    Tables: {
      teams: { Row: Team; Insert: Partial<Team>; Update: Partial<Team> };
      players: { Row: Player; Insert: Partial<Player>; Update: Partial<Player> };
      venues: { Row: Venue; Insert: Partial<Venue>; Update: Partial<Venue> };
      matches: { Row: Match; Insert: Partial<Match>; Update: Partial<Match> };
      match_goals: { Row: MatchGoal; Insert: Partial<MatchGoal>; Update: Partial<MatchGoal> };
      settings: { Row: Settings; Insert: Partial<Settings>; Update: Partial<Settings> };
    };
  };
}
