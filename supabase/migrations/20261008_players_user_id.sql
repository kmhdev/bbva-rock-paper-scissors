-- Links online scores to the Google user (Supabase Auth).
-- Run after the initial schema.sql on existing projects.
-- Dashboard: Authentication > Providers > Google enabled, with the
-- web origin in Site URL / Redirect URLs so signInWithOAuth returns
-- to the app. Reads stay public; writes keep the existing policies.

alter table if exists players
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists players_user_id_idx on players(user_id);
