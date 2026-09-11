export type MatchStatus = "scheduled" | "live" | "completed";
export type RoundType = "andata" | "ritorno";
export type PlayerRole = "portiere" | "difensore" | "centroboa" | "attaccante";

export interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  venue_id: string | null;
  coach_name: string | null;
  created_at: string;
  venue?: Venue;
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
  stream_url: string | null;
  home_team?: Team;
  away_team?: Team;
  venue?: Venue;
}

export interface MatchGoal {
  id: string;
  match_id: string;
  player_id: string | null;
  team_id: string;
  quarter: number | null;
  goal_time: string | null;
  created_at: string;
}

export type AppTheme =
  | "classic"
  | "lane"
  | "regulation"
  | "impact"
  | "broadcast"
  | "poster"
  | "magazine"
  | "classic-light"
  | "lane-light"
  | "regulation-light"
  | "impact-light"
  | "broadcast-light"
  | "poster-light"
  | "magazine-light";

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
  info_text: string | null;
  info_image_url: string | null;
  info_email: string | null;
  theme: AppTheme;
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
