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
  date_time: string | null;
  status: MatchStatus;
  home_score: number;
  away_score: number;
  round_type: RoundType;
  giornata: number;
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

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
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

// NOTE ON TYPE SAFETY: the Supabase clients in lib/supabase/client.ts and
// lib/supabase/server.ts are intentionally left untyped (no Database
// generic). A hand-written Database type that doesn't match
// @supabase/supabase-js's exact expected shape can make its insert()/
// update() argument types silently collapse to `never`, which fails
// `next build`. Once the Supabase project is linked, generate real types
// with the Supabase CLI and wire them in for full type safety:
//
//   npx supabase gen types typescript --project-id <id> --schema public > lib/supabase/database.types.ts
//
// then in client.ts / server.ts:
//   import type { Database } from "./database.types";
//   createBrowserClient<Database>(...) / createServerClient<Database>(...)
