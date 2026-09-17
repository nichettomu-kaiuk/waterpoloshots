-- Water Polo Tournament — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ── Tables ────────────────────────────────────────────────────────────────

-- A championship ("campionato") is one full instance of the tournament
-- template: its own teams, calendar, standings, news and branding. The
-- public site's first page lists every row here so a visitor can pick one;
-- the Admin panel can create and delete rows here to spin up or retire a
-- whole championship without touching code.
create table championships (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text,
  created_at timestamptz not null default now()
);

create table venues (
  id uuid primary key default gen_random_uuid(),
  championship_id uuid not null references championships(id) on delete cascade,
  name text not null,
  location_tag text,
  address text
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  championship_id uuid not null references championships(id) on delete cascade,
  name text not null,
  logo_url text,
  venue_id uuid references venues(id) on delete set null,
  coach_name text,
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
  championship_id uuid not null references championships(id) on delete cascade,
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
  player_id uuid references players(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  quarter int,
  goal_time text,
  created_at timestamptz not null default now()
);

create table settings (
  id uuid primary key default gen_random_uuid(),
  championship_id uuid not null unique references championships(id) on delete cascade,
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
  theme text not null default 'classic' check (theme in ('classic','lane','regulation','impact','broadcast','poster','magazine','tabellone','classic-light','lane-light','regulation-light','impact-light','broadcast-light','poster-light','magazine-light','tabellone-light'))
);

create table news_posts (
  id uuid primary key default gen_random_uuid(),
  championship_id uuid not null references championships(id) on delete cascade,
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
create index teams_championship_id_idx on teams(championship_id);
create index venues_championship_id_idx on venues(championship_id);
create index matches_championship_id_idx on matches(championship_id);
create index news_posts_championship_id_idx on news_posts(championship_id);

-- ── Row Level Security ───────────────────────────────────────────────────
-- Public (anon) role: read-only access to everything.
-- Authenticated role (the tournament Admin): full read/write access,
-- including creating and deleting whole championships from the Admin panel.

alter table championships enable row level security;
alter table teams enable row level security;
alter table venues enable row level security;
alter table players enable row level security;
alter table matches enable row level security;
alter table match_goals enable row level security;
alter table settings enable row level security;
alter table news_posts enable row level security;

create policy "public read championships" on championships for select using (true);
create policy "public read teams" on teams for select using (true);
create policy "public read venues" on venues for select using (true);
create policy "public read players" on players for select using (true);
create policy "public read matches" on matches for select using (true);
create policy "public read match_goals" on match_goals for select using (true);
create policy "public read settings" on settings for select using (true);
create policy "public read news_posts" on news_posts for select using (true);

create policy "admin write championships" on championships for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
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

-- ── Seed row: one championship + its settings (a fresh install starts with
-- a single championship so the template isn't empty; use Admin → Elenco
-- campionati to add more) ───────────────────────────────────────────────
insert into championships (slug, name, subtitle)
values ('serie-b-girone-3', 'Serie B - Girone 3', 'Stagione 2026');

insert into settings (championship_id, tournament_title, tournament_subtitle, active_round, info_text)
select id, 'Serie B - Girone 3', 'Stagione 2026', 'Girone di andata', '(c) 2026 Nicola De Santis - Waterpolo Shots. Tutti i diritti sono riservati.'
from championships where slug = 'serie-b-girone-3';

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

-- Removed: teams.logo_large_scale/x/y — used to resize/reposition the large
-- background team logo on the player card page; that watermark and its
-- admin controls were removed on explicit request, so the columns are
-- dropped too (was: alter table teams add column ... logo_large_scale/x/y).
alter table teams drop column if exists logo_large_scale;
alter table teams drop column if exists logo_large_x;
alter table teams drop column if exists logo_large_y;

-- Adds: teams.coach_name (allenatore), editable in Admin → Squadre.
alter table teams add column if not exists coach_name text;

-- Adds: matches.stream_url (optional live-stream link, editable in Admin → Partite).
alter table matches add column if not exists stream_url text;

-- Allows: match_goals.player_id to be null — a goal can be logged for a team
-- without a known/registered scorer, editable in Admin → Partite.
alter table match_goals alter column player_id drop not null;

-- Adds: settings.info_text / info_image_url / info_email (the "i" info
-- popup, editable in Admin → Impostazioni).
alter table settings add column if not exists info_text text;
alter table settings add column if not exists info_image_url text;
alter table settings add column if not exists info_email text;
update settings set info_text = '(c) 2026 Nicola De Santis - Waterpolo Shots. Tutti i diritti sono riservati.'
  where info_text is null;

-- Adds: settings.theme — now 16 options: the original 6 structural themes
-- ('classic', 'lane', 'regulation', 'impact', 'broadcast', 'poster') plus
-- 'tabellone' and 'magazine', and all of their '-light' counterparts. See
-- PROJECT_STATUS.md, "Sistema temi", for how Tabellone and Magazine were
-- each integrated (both came from design material the user provided).
alter table settings add column if not exists theme text not null default 'classic';
alter table settings drop constraint if exists settings_theme_check;
alter table settings add constraint settings_theme_check
  check (theme in ('classic','lane','regulation','impact','broadcast','poster','magazine','tabellone','classic-light','lane-light','regulation-light','impact-light','broadcast-light','poster-light','magazine-light','tabellone-light'));

-- Adds: match_goals.created_at, so the per-match goal log (Admin → Partite →
-- modifica partita) can be listed in the order goals were actually added.
alter table match_goals add column if not exists created_at timestamptz not null default now();

-- ── Migrazione multi-campionato ─────────────────────────────────────────
-- Turns the site into a reusable template: every team/match/venue/news/
-- settings row now belongs to a `championships` row, so the Admin panel can
-- create or delete whole championships and the public site opens on a
-- selector page. Safe to re-run. On a project that already had data, this
-- creates ONE championship from the existing `settings` row (so nothing is
-- lost) and attaches every existing row to it.

create table if not exists championships (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text,
  created_at timestamptz not null default now()
);

alter table championships enable row level security;
drop policy if exists "public read championships" on championships;
create policy "public read championships" on championships for select using (true);
drop policy if exists "admin write championships" on championships;
create policy "admin write championships" on championships for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seed one championship from the pre-existing settings row, if there is one
-- and no championship exists yet (an already-migrated or brand-new project
-- skips this).
insert into championships (slug, name, subtitle)
select 'serie-b-girone-3', coalesce(nullif(trim(s.tournament_title), ''), 'Serie B - Girone 3'), s.tournament_subtitle
from settings s
where not exists (select 1 from championships)
limit 1;

-- Fallback for a brand-new database that has neither a championship nor a
-- settings row yet.
insert into championships (slug, name, subtitle)
select 'serie-b-girone-3', 'Serie B - Girone 3', 'Stagione 2026'
where not exists (select 1 from championships);

alter table venues add column if not exists championship_id uuid references championships(id) on delete cascade;
alter table teams add column if not exists championship_id uuid references championships(id) on delete cascade;
alter table matches add column if not exists championship_id uuid references championships(id) on delete cascade;
alter table news_posts add column if not exists championship_id uuid references championships(id) on delete cascade;
alter table settings add column if not exists championship_id uuid references championships(id) on delete cascade;

-- Backfill: every pre-existing row goes to the first (oldest) championship —
-- on a freshly-migrated project that's the one just seeded above.
update venues set championship_id = (select id from championships order by created_at asc limit 1) where championship_id is null;
update teams set championship_id = (select id from championships order by created_at asc limit 1) where championship_id is null;
update matches set championship_id = (select id from championships order by created_at asc limit 1) where championship_id is null;
update news_posts set championship_id = (select id from championships order by created_at asc limit 1) where championship_id is null;
update settings set championship_id = (select id from championships order by created_at asc limit 1) where championship_id is null;

alter table venues alter column championship_id set not null;
alter table teams alter column championship_id set not null;
alter table matches alter column championship_id set not null;
alter table news_posts alter column championship_id set not null;
alter table settings alter column championship_id set not null;

alter table settings drop constraint if exists settings_championship_id_key;
alter table settings add constraint settings_championship_id_key unique (championship_id);

create index if not exists teams_championship_id_idx on teams(championship_id);
create index if not exists venues_championship_id_idx on venues(championship_id);
create index if not exists matches_championship_id_idx on matches(championship_id);
create index if not exists news_posts_championship_id_idx on news_posts(championship_id);
