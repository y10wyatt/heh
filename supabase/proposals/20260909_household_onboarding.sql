-- REVIEW PROPOSAL ONLY. Do not run remotely until owner approval.
-- Target: existing "Weight Loss Competition" project (raidfgiukctxxmahnuzs).
-- Reuses public.profiles, public.groups, public.group_members, and public.group_invites.

begin;

-- Preserve the legacy function signature while making its lookup explicit and safe.
create or replace function public.is_group_member(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.group_members member
    where member.group_id = target_group_id
      and member.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_group_member(uuid) from public, anon;
grant execute on function public.is_group_member(uuid) to authenticated;

-- Cover legacy foreign keys used by the onboarding RPCs.
create index if not exists groups_created_by_idx
  on public.groups(created_by);
create index if not exists group_invites_created_by_idx
  on public.group_invites(created_by);
create index if not exists group_invites_used_by_idx
  on public.group_invites(used_by);

create table if not exists public.household_member_settings (
  group_id uuid not null,
  user_id uuid not null,
  annoyance_level text not null default 'playful'
    check (annoyance_level in ('gentle', 'playful', 'chaos')),
  sound_enabled boolean not null default true,
  quiet_hours_start time,
  quiet_hours_end time,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (group_id, user_id),
  foreign key (group_id, user_id)
    references public.group_members(group_id, user_id) on delete cascade
);

create index if not exists household_member_settings_user_idx
  on public.household_member_settings(user_id);

create table if not exists public.household_rooms (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  door_color text not null default 'honey',
  door_sign text,
  room_style text not null default 'cozy',
  decor jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, owner_id),
  check (length(name) between 1 and 60),
  check (door_sign is null or length(door_sign) <= 30),
  check (jsonb_typeof(decor) = 'object')
);

create index if not exists household_rooms_owner_idx
  on public.household_rooms(owner_id);

create table if not exists public.household_actions (
  id uuid primary key,
  group_id uuid not null references public.groups(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null
    check (action_type in ('poke', 'note', 'pillow', 'gift', 'silly_object')),
  message text,
  payload jsonb not null default '{}'::jsonb,
  state text not null default 'placed'
    check (state in ('placed', 'discovered', 'reacted', 'tidied', 'kept')),
  created_at timestamptz not null default now(),
  discovered_at timestamptz,
  resolved_at timestamptz,
  check (actor_id <> target_user_id),
  check (message is null or length(message) <= 500),
  check (jsonb_typeof(payload) = 'object')
);

create index if not exists household_actions_group_created_idx
  on public.household_actions(group_id, created_at desc);
create index if not exists household_actions_target_open_idx
  on public.household_actions(target_user_id, state, created_at desc)
  where state in ('placed', 'discovered');

alter table public.household_member_settings enable row level security;
alter table public.household_rooms enable row level security;
alter table public.household_actions enable row level security;

revoke all on public.household_member_settings from anon, authenticated;
revoke all on public.household_rooms from anon, authenticated;
revoke all on public.household_actions from anon, authenticated;
grant select on public.household_member_settings to authenticated;
grant select on public.household_rooms to authenticated;
grant select on public.household_actions to authenticated;

drop policy if exists household_member_settings_group_read
  on public.household_member_settings;
create policy household_member_settings_group_read
  on public.household_member_settings for select to authenticated
  using ((select public.is_group_member(group_id)));

drop policy if exists household_rooms_group_read on public.household_rooms;
create policy household_rooms_group_read
  on public.household_rooms for select to authenticated
  using ((select public.is_group_member(group_id)));

drop policy if exists household_actions_group_read on public.household_actions;
create policy household_actions_group_read
  on public.household_actions for select to authenticated
  using ((select public.is_group_member(group_id)));

-- The legacy membership INSERT policy lets any account join a known group,
-- and its UPDATE policy lets members change their own role. Both operations
-- now go through the authenticated RPCs below.
drop policy if exists group_members_insert_self_or_creator
  on public.group_members;
drop policy if exists group_members_update_self
  on public.group_members;
drop policy if exists group_members_select_members
  on public.group_members;
revoke insert, update, delete on public.group_members from authenticated;

-- Household creation also goes through an idempotent RPC. Owners retain the
-- existing UPDATE policy so renaming a household can be added independently.
drop policy if exists groups_insert_creator on public.groups;
revoke insert, delete on public.groups from authenticated;

-- Existing policy exposes every unused invite code to every authenticated user.
-- Joining and invite mutations move behind atomic RPCs below.
drop policy if exists group_invites_select_members_or_valid_code
  on public.group_invites;
drop policy if exists group_invites_insert_group_members
  on public.group_invites;
drop policy if exists group_invites_update_valid_invite
  on public.group_invites;

drop policy if exists group_invites_select_members on public.group_invites;

create policy group_invites_select_members
  on public.group_invites for select to authenticated
  using ((select public.is_group_member(group_id)));

revoke insert, update, delete on public.group_invites from authenticated;
grant select on public.group_invites to authenticated;

create or replace function public.our_place_account_state()
returns table (
  group_id uuid,
  group_name text,
  member_role text,
  member_count bigint,
  onboarding_completed boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    gm.group_id,
    g.name,
    gm.role,
    (select count(*) from public.group_members sibling where sibling.group_id = gm.group_id),
    (settings.onboarding_completed_at is not null)
  from public.group_members gm
  join public.groups g on g.id = gm.group_id
  left join public.household_member_settings settings
    on settings.group_id = gm.group_id and settings.user_id = gm.user_id
  where gm.user_id = (select auth.uid())
  order by gm.joined_at
  limit 1;
$$;

create or replace function public.our_place_complete_onboarding(
  p_group_id uuid,
  p_display_name text,
  p_avatar_id text default 'hamster-orange',
  p_annoyance_level text default 'playful',
  p_door_color text default 'honey',
  p_door_sign text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
begin
  if caller_id is null or not public.is_group_member(p_group_id) then
    raise exception 'not authorized';
  end if;
  if length(trim(p_display_name)) not between 1 and 40 then
    raise exception 'display name must be between 1 and 40 characters';
  end if;
  if p_annoyance_level not in ('gentle', 'playful', 'chaos') then
    raise exception 'invalid annoyance level';
  end if;

  insert into public.profiles(id, display_name, avatar_id, weight_unit)
  values (caller_id, trim(p_display_name), p_avatar_id, 'lb')
  on conflict (id) do update
    set display_name = excluded.display_name,
        avatar_id = excluded.avatar_id,
        updated_at = now();

  insert into public.household_member_settings(
    group_id, user_id, annoyance_level, onboarding_completed_at
  ) values (p_group_id, caller_id, p_annoyance_level, now())
  on conflict (group_id, user_id) do update
    set annoyance_level = excluded.annoyance_level,
        onboarding_completed_at = coalesce(
          public.household_member_settings.onboarding_completed_at,
          excluded.onboarding_completed_at
        ),
        updated_at = now();

  insert into public.household_rooms(
    group_id, owner_id, name, door_color, door_sign
  ) values (
    p_group_id, caller_id, trim(p_display_name) || '''s room',
    p_door_color, nullif(trim(p_door_sign), '')
  )
  on conflict (group_id, owner_id) do update
    set door_color = excluded.door_color,
        door_sign = excluded.door_sign,
        updated_at = now();
end;
$$;

create or replace function public.our_place_create_household(
  p_name text,
  p_display_name text,
  p_avatar_id text default 'hamster-orange',
  p_annoyance_level text default 'playful'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  new_group_id uuid := gen_random_uuid();
  existing_group_id uuid;
begin
  if caller_id is null then raise exception 'not authenticated'; end if;
  if length(trim(p_name)) not between 1 and 60 then
    raise exception 'household name must be between 1 and 60 characters';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(caller_id::text, 0));
  select gm.group_id into existing_group_id
  from public.group_members gm where gm.user_id = caller_id
  order by gm.joined_at limit 1;
  if existing_group_id is not null then return existing_group_id; end if;

  insert into public.profiles(id, display_name, avatar_id, weight_unit)
  values (caller_id, trim(p_display_name), p_avatar_id, 'lb')
  on conflict (id) do update
    set display_name = excluded.display_name,
        avatar_id = excluded.avatar_id,
        updated_at = now();

  insert into public.groups(id, name, created_by, created_at)
  values (new_group_id, trim(p_name), caller_id, now());
  insert into public.group_members(group_id, user_id, role, joined_at)
  values (new_group_id, caller_id, 'owner', now());
  perform public.our_place_complete_onboarding(
    new_group_id, p_display_name, p_avatar_id, p_annoyance_level, 'honey', null
  );
  return new_group_id;
end;
$$;

create or replace function public.our_place_create_invite(p_group_id uuid)
returns table (code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  invite_code text;
begin
  if caller_id is null or not public.is_group_member(p_group_id) then
    raise exception 'not authorized';
  end if;
  loop
    invite_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (
      select 1 from public.group_invites existing where existing.code = invite_code
    );
  end loop;
  return query
    insert into public.group_invites(
      id, group_id, code, created_by, expires_at, created_at
    ) values (
      gen_random_uuid(), p_group_id, invite_code, caller_id,
      now() + interval '7 days', now()
    ) returning public.group_invites.code, public.group_invites.expires_at;
end;
$$;

create or replace function public.our_place_join_household(
  p_code text,
  p_display_name text,
  p_avatar_id text default 'hamster-orange',
  p_annoyance_level text default 'playful'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  selected_invite public.group_invites%rowtype;
  existing_group_id uuid;
  code_group_id uuid;
begin
  if caller_id is null then raise exception 'not authenticated'; end if;

  perform pg_advisory_xact_lock(hashtextextended(caller_id::text, 0));
  select gm.group_id into existing_group_id
  from public.group_members gm where gm.user_id = caller_id
  order by gm.joined_at limit 1;

  if existing_group_id is not null then
    select invite.group_id into code_group_id
    from public.group_invites invite
    where invite.code = upper(trim(p_code));
    if code_group_id = existing_group_id then return existing_group_id; end if;
    raise exception 'account already belongs to a household';
  end if;

  select invite.* into selected_invite
  from public.group_invites invite
  where invite.code = upper(trim(p_code))
    and invite.used_at is null
    and invite.expires_at > now()
  for update;
  if not found then raise exception 'invite is invalid or expired'; end if;
  insert into public.profiles(id, display_name, avatar_id, weight_unit)
  values (caller_id, trim(p_display_name), p_avatar_id, 'lb')
  on conflict (id) do update
    set display_name = excluded.display_name,
        avatar_id = excluded.avatar_id,
        updated_at = now();
  insert into public.group_members(group_id, user_id, role, joined_at)
  values (selected_invite.group_id, caller_id, 'member', now())
  on conflict (group_id, user_id) do nothing;
  update public.group_invites
    set used_by = caller_id, used_at = now()
    where id = selected_invite.id and used_at is null;
  if not found then raise exception 'invite was already used'; end if;
  perform public.our_place_complete_onboarding(
    selected_invite.group_id, p_display_name, p_avatar_id,
    p_annoyance_level, 'honey', null
  );
  return selected_invite.group_id;
end;
$$;

create or replace function public.our_place_leave_action(
  p_id uuid,
  p_group_id uuid,
  p_target_user_id uuid,
  p_action_type text,
  p_message text default null,
  p_payload jsonb default '{}'::jsonb
)
returns public.household_actions
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  target_level text;
  result public.household_actions;
begin
  if caller_id is null or not public.is_group_member(p_group_id) then
    raise exception 'not authorized';
  end if;
  if caller_id = p_target_user_id or not exists (
    select 1 from public.group_members member
    where member.group_id = p_group_id and member.user_id = p_target_user_id
  ) then raise exception 'invalid target'; end if;
  if p_action_type not in ('poke', 'note', 'pillow', 'gift', 'silly_object') then
    raise exception 'invalid action type';
  end if;
  select annoyance_level into target_level
  from public.household_member_settings
  where group_id = p_group_id and user_id = p_target_user_id;
  if coalesce(target_level, 'playful') = 'gentle'
     and p_action_type not in ('poke', 'note', 'gift') then
    raise exception 'recipient preferences do not allow this action';
  end if;
  if p_action_type in ('pillow', 'silly_object') and (
    select count(*) from public.household_actions open_action
    where open_action.group_id = p_group_id
      and open_action.target_user_id = p_target_user_id
      and open_action.action_type in ('pillow', 'silly_object')
      and open_action.state in ('placed', 'discovered')
  ) >= 3 then raise exception 'recipient already has three active pranks'; end if;

  insert into public.household_actions(
    id, group_id, actor_id, target_user_id, action_type, message, payload
  ) values (
    p_id, p_group_id, caller_id, p_target_user_id, p_action_type,
    nullif(trim(p_message), ''), coalesce(p_payload, '{}'::jsonb)
  ) returning * into result;
  return result;
end;
$$;

revoke all on function public.our_place_account_state() from public, anon;
revoke all on function public.our_place_complete_onboarding(uuid,text,text,text,text,text) from public, anon;
revoke all on function public.our_place_create_household(text,text,text,text) from public, anon;
revoke all on function public.our_place_create_invite(uuid) from public, anon;
revoke all on function public.our_place_join_household(text,text,text,text) from public, anon;
revoke all on function public.our_place_leave_action(uuid,uuid,uuid,text,text,jsonb) from public, anon;
grant execute on function public.our_place_account_state() to authenticated;
grant execute on function public.our_place_complete_onboarding(uuid,text,text,text,text,text) to authenticated;
grant execute on function public.our_place_create_household(text,text,text,text) to authenticated;
grant execute on function public.our_place_create_invite(uuid) to authenticated;
grant execute on function public.our_place_join_household(text,text,text,text) to authenticated;
grant execute on function public.our_place_leave_action(uuid,uuid,uuid,text,text,jsonb) to authenticated;

commit;
