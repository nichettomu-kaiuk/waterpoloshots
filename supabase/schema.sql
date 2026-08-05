-- Water Polo Tournament — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ── Tables ────────────────────────────────────────────────────────────────

create table venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_tag text,
  address text
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  venue_id uuid references venues(id) on delete set null,
  created_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  cap_number int not null,
  photo_url text,
  position text check (position in ('portiere','difensore','centroboa','attaccante')),
  goals_count int not null default 0
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  home_team_id uuid not null references teams(id) on delete cascade,
  away_team_id uuid not null references teams(id) on delete cascade,
  venue_id uuid references venues(id) on delete set null,
  date_time timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled','live','completed')),
  home_score int not null default 0,
  away_score int not null default 0,
  round_type text not null default 'andata' check (round_type in ('andata','ritorno')),
  giornata int not null default 1,
  stream_url text,
  check (home_team_id <> away_team_id)
);

create table match_goals (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  quarter int,
  goal_time text
);

create table settings (
  id uuid primary key default gen_random_uuid(),
  tournament_title text not null default 'Serie B - Girone 3',
  tournament_subtitle text,
  logo_url text,
  home_bg_url text,
  header_bg_url text,
  primary_color text default '#e10f21',
  secondary_color text default '#d4af37',
  active_round text,
  info_text text,
  info_image_url text,
  info_email text,
  theme text not null default 'classic' check (theme in ('classic','lane'))
);

create table news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);

-- Convenience indexes for the queries used by the app
create index matches_status_idx on matches(status);
create index matches_date_time_idx on matches(date_time);
create index matches_round_giornata_idx on matches(round_type, giornata);
create index players_team_id_idx on players(team_id);
create index match_goals_match_id_idx on match_goals(match_id);
create index news_posts_created_at_idx on news_posts(created_at desc);
create index teams_venue_id_idx on teams(venue_id);

-- ── Row Level Security ───────────────────────────────────────────────────
-- Public (anon) role: read-only access to everything.
-- Authenticated role (the tournament Admin): full read/write access.

alter table teams enable row level security;
alter table venues enable row level security;
alter table players enable row level security;
alter table matches enable row level security;
alter table match_goals enable row level security;
alter table settings enable row level security;
alter table news_posts enable row level security;

create policy "public read teams" on teams for select using (true);
create policy "public read venues" on venues for select using (true);
create policy "public read players" on players for select using (true);
create policy "public read matches" on matches for select using (true);
create policy "public read match_goals" on match_goals for select using (true);
create policy "public read settings" on settings for select using (true);
create policy "public read news_posts" on news_posts for select using (true);

create policy "admin write teams" on teams for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write venues" on venues for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write players" on players for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write matches" on matches for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write match_goals" on match_goals for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write settings" on settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write news_posts" on news_posts for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ── Storage ──────────────────────────────────────────────────────────────
-- Public bucket for team logos, player photos, and branding images.

insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

create policy "public read branding files" on storage.objects
  for select using (bucket_id = 'branding');

create policy "admin upload branding files" on storage.objects
  for insert to authenticated with check (bucket_id = 'branding');

create policy "admin update branding files" on storage.objects
  for update to authenticated using (bucket_id = 'branding');

create policy "admin delete branding files" on storage.objects
  for delete to authenticated using (bucket_id = 'branding');

-- ── Seed row for settings (branding needs exactly one row) ─────────────────
insert into settings (tournament_title, tournament_subtitle, active_round, info_text)
values ('Serie B - Girone 3', 'Stagione 2026', 'Girone di andata', '(c) 2026 Nicola De Santis - Waterpolo Shots. Tutti i diritti sono riservati.');

-- ── Realtime (optional but recommended for live scores) ────────────────────
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table match_goals;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table news_posts;

-- ── Migration for projects that already ran an earlier version of this
-- schema (safe to re-run — every statement is guarded) ─────────────────────
-- Adds: matches.giornata (matchday number), makes matches.date_time
-- nullable (auto-generated Ritorno fixtures start without a date), and
-- makes matches.round_type required with an 'andata' default.

alter table matches add column if not exists giornata int not null default 1;
alter table matches alter column date_time drop not null;
alter table matches alter column round_type set default 'andata';
update matches set round_type = 'andata' where round_type is null;
alter table matches alter column round_type set not null;

create index if not exists matches_round_giornata_idx on matches(round_type, giornata);

-- Adds: teams.venue_id (the team's home pool, editable in Admin → Squadre).
alter table teams add column if not exists venue_id uuid references venues(id) on delete set null;
create index if not exists teams_venue_id_idx on teams(venue_id);

-- Adds: matches.stream_url (optional live-stream link, editable in Admin → Partite).
alter table matches add column if not exists stream_url text;

-- Adds: settings.info_text / info_image_url / info_email (the "i" info
-- popup, editable in Admin → Impostazioni).
alter table settings add column if not exists info_text text;
alter table settings add column if not exists info_image_url text;
alter table settings add column if not exists info_email text;
update settings set info_text = '(c) 2026 Nicola De Santis - Waterpolo Shots. Tutti i diritti sono riservati.'
  where info_text is null;

-- Adds: settings.theme ('classic' or 'lane') — lets the admin switch the
-- whole site's visual style at any time from Admin → Impostazioni.
alter table settings add column if not exists theme text not null default 'classic';
alter table settings drop constraint if exists settings_theme_check;
alter table settings add constraint settings_theme_check check (theme in ('classic','lane'));
