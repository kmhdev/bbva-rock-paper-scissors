-- Supabase schema for the bonus online ranking.
-- Local AsyncStorage scores remain the source of truth offline;
-- this table only mirrors each player's best score when online.

create table if not exists players (
  username text primary key,
  display_name text not null,
  best_score integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table players enable row level security;

drop policy if exists "players public read" on players;
create policy "players public read"
  on players for select
  using (true);

drop policy if exists "players public insert" on players;
create policy "players public insert"
  on players for insert
  with check (true);

drop policy if exists "players public update" on players;
create policy "players public update"
  on players for update
  using (true);
