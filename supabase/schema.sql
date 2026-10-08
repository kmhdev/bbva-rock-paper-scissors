-- Esquema Supabase para el bonus del ranking online.
-- Las marcas locales en AsyncStorage siguen siendo la fuente de verdad offline.
--
-- Identidad online (portada de espanografia): cada usuario de Google reclama un
-- único nombre público una sola vez (public.profiles, inmutable). Las marcas se
-- envían con public.submit_player_score(), que resuelve el nombre visible en el
-- servidor desde auth.uid() para que ningún cliente pueda suplantar a otro
-- jugador. Sin login se sigue jugando offline sin límites.

create table if not exists players (
  username text primary key,
  display_name text not null,
  best_score integer not null default 0,
  user_id uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists players_user_id_idx on players(user_id);

-- Nombre reclamado por usuario de Google. Inmutable: sin políticas de update/delete.
create table if not exists public.profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  username text not null,
  username_normalized text generated always as (lower(username)) stored,
  created_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 2 and 20),
  constraint profiles_username_trimmed check (username = btrim(username)),
  constraint profiles_username_normalized_unique unique (username_normalized)
);

alter table players enable row level security;
alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select, insert on public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Las lecturas siguen públicas; las escrituras solo van por submit_player_score().
revoke all on players from anon, authenticated;
grant select on players to anon, authenticated;

drop policy if exists "players public read" on players;
create policy "players public read"
  on players for select
  using (true);

drop policy if exists "players public insert" on players;
drop policy if exists "players public update" on players;

create or replace function public.submit_player_score(p_score integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_username text;
  v_existing_user uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_score is null then
    raise exception 'Invalid score payload';
  end if;

  select username
    into v_username
    from public.profiles
    where user_id = v_user_id;

  if v_username is null then
    raise exception 'Username required';
  end if;

  -- Una fila antigua creada antes de los perfiles puede usar ya este
  -- nombre: quien lo reclama hereda las filas anónimas, pero nunca las de
  -- otro usuario autenticado.
  select user_id
    into v_existing_user
    from public.players
    where username = lower(v_username);

  if v_existing_user is not null and v_existing_user <> v_user_id then
    raise exception 'Username taken';
  end if;

  insert into public.players (username, display_name, best_score, user_id)
  values (lower(v_username), v_username, p_score, v_user_id)
  on conflict (username) do update set
    display_name = excluded.display_name,
    best_score = greatest(public.players.best_score, excluded.best_score),
    user_id = excluded.user_id,
    updated_at = now();
end;
$$;

revoke all on function public.submit_player_score(integer) from public;
grant execute on function public.submit_player_score(integer) to authenticated;
