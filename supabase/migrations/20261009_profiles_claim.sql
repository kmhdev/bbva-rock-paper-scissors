-- Identidad online reclamada (portada de espanografia).
-- Cada usuario de Google elige un nombre público una sola vez (public.profiles,
-- inmutable). Las marcas se envían con public.submit_player_score(), que resuelve
-- el nombre visible en el servidor desde auth.uid() para que ningún cliente pueda
-- suplantar a otro jugador. Ejecutar tras schema.sql / 20261008_players_user_id.sql.

create table if not exists public.profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  username text not null,
  username_normalized text generated always as (lower(username)) stored,
  created_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 2 and 20),
  constraint profiles_username_trimmed check (username = btrim(username)),
  constraint profiles_username_normalized_unique unique (username_normalized)
);

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

-- Se cierra la vía antigua de escritura abierta: online solo se escribe por el
-- RPC de arriba. Las lecturas públicas no se tocan para que el ranking siga funcionando.
revoke all on players from anon, authenticated;
grant select on players to anon, authenticated;

drop policy if exists "players public insert" on players;
drop policy if exists "players public update" on players;
