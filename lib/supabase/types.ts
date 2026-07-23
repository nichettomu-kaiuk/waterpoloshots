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
//
// IMPORTANT: this must match the exact shape @supabase/supabase-js expects
// (Row/Insert/Update/Relationships per table, plus Views/Functions/Enums/
// CompositeTypes on the schema) — otherwise its generic helper types quietly
// resolve to `never` for insert()/update() calls, which fails `next build`
// under strict TypeScript even though `npm run dev` may not surface it.

// Row types without the DB-generated/joined fields, used for Insert/Update
type TeamRow = Omit<Team, "id" | "created_at">;
type PlayerRow = Omit<Player, "id">;
type VenueRow = Omit<Venue, "id">;
type MatchRow = Omit<Match, "id" | "home_team" | "away_team" | "venue">;
type MatchGoalRow = Omit<MatchGoal, "id">;
type SettingsRow = Omit<Settings, "id">;

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: Team;
        Insert: Partial<TeamRow> & Pick<TeamRow, "name">;
        Update: Partial<TeamRow>;
        Relationships: [];
      };
      players: {
        Row: Player;
        Insert: Partial<PlayerRow> & Pick<PlayerRow, "team_id" | "first_name" | "last_name" | "cap_number">;
        Update: Partial<PlayerRow>;
        Relationships: [];
      };
      venues: {
        Row: Venue;
        Insert: Partial<VenueRow> & Pick<VenueRow, "name">;
        Update: Partial<VenueRow>;
        Relationships: [];
      };
      matches: {
        Row: Match;
        Insert: Partial<MatchRow> & Pick<MatchRow, "home_team_id" | "away_team_id" | "date_time">;
        Update: Partial<MatchRow>;
        Relationships: [];
      };
      match_goals: {
        Row: MatchGoal;
        Insert: Partial<MatchGoalRow> & Pick<MatchGoalRow, "match_id" | "player_id" | "team_id">;
        Update: Partial<MatchGoalRow>;
        Relationships: [];
      };
      settings: {
        Row: Settings;
        Insert: Partial<SettingsRow>;
        Update: Partial<SettingsRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
