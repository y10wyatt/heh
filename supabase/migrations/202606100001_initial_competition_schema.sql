create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_id text not null default 'mint-blob',
  starting_weight numeric,
  current_weight numeric,
  goal_weight numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  weekly_weigh_in_day int not null check (weekly_weigh_in_day between 0 and 6),
  water_goal int not null default 8,
  progress_type text not null default 'consistency-and-percent',
  created_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  water_cups int not null default 0 check (water_cups >= 0),
  water_goal int not null default 8 check (water_goal > 0),
  workout_completed boolean not null default false,
  workout_goal_minutes int not null default 30 check (workout_goal_minutes >= 0),
  workout_muscle_groups text[] not null default '{}',
  custom_workout_muscle_groups text[] not null default '{}',
  meal_photo_count int not null default 0 check (meal_photo_count >= 0),
  meal_photo_bonus_earned boolean not null default false,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, user_id, log_date)
);

create table if not exists public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  weight numeric not null check (weight > 0),
  is_weekly_weigh_in boolean not null default false,
  created_at timestamptz not null default now(),
  unique (competition_id, user_id, entry_date)
);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed boolean not null default false,
  duration_minutes int check (duration_minutes is null or duration_minutes >= 0),
  muscle_groups text[] not null default '{}',
  custom_muscle_groups text[] not null default '{}',
  import_source text not null default 'manual',
  external_id text,
  raw_import jsonb,
  created_at timestamptz not null default now(),
  unique (import_source, external_id)
);

create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_url text,
  bonus_earned boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.rival_actions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null,
  reason text not null,
  cosmetic_only boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists group_members_user_id_idx on public.group_members(user_id);
create index if not exists competitions_group_id_idx on public.competitions(group_id);
create index if not exists daily_logs_user_date_idx on public.daily_logs(user_id, log_date);
create index if not exists weight_entries_user_date_idx on public.weight_entries(user_id, entry_date);
create index if not exists workout_logs_user_id_idx on public.workout_logs(user_id);
create index if not exists meal_logs_user_id_idx on public.meal_logs(user_id);
create index if not exists rival_actions_to_user_id_idx on public.rival_actions(to_user_id);

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.competitions enable row level security;
alter table public.daily_logs enable row level security;
alter table public.weight_entries enable row level security;
alter table public.workout_logs enable row level security;
alter table public.meal_logs enable row level security;
alter table public.rival_actions enable row level security;

create or replace function public.is_group_member(target_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = target_group_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_competition_member(target_competition_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.competitions c
    join public.group_members gm on gm.group_id = c.group_id
    where c.id = target_competition_id
      and gm.user_id = auth.uid()
  );
$$;

create policy "profiles_select_group_members"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.group_members mine
    join public.group_members theirs on theirs.group_id = mine.group_id
    where mine.user_id = auth.uid()
      and theirs.user_id = profiles.id
  )
);

create policy "profiles_insert_self"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "groups_select_members"
on public.groups for select
to authenticated
using (public.is_group_member(id));

create policy "groups_insert_creator"
on public.groups for insert
to authenticated
with check (created_by = auth.uid());

create policy "groups_update_creator"
on public.groups for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "group_members_select_members"
on public.group_members for select
to authenticated
using (public.is_group_member(group_id));

create policy "group_members_insert_self_or_creator"
on public.group_members for insert
to authenticated
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.groups
    where groups.id = group_members.group_id
      and groups.created_by = auth.uid()
  )
);

create policy "competitions_select_members"
on public.competitions for select
to authenticated
using (public.is_group_member(group_id));

create policy "competitions_insert_members"
on public.competitions for insert
to authenticated
with check (public.is_group_member(group_id));

create policy "competitions_update_members"
on public.competitions for update
to authenticated
using (public.is_group_member(group_id))
with check (public.is_group_member(group_id));

create policy "daily_logs_select_competition_members"
on public.daily_logs for select
to authenticated
using (public.is_competition_member(competition_id));

create policy "daily_logs_insert_self_current_day"
on public.daily_logs for insert
to authenticated
with check (user_id = auth.uid() and log_date = current_date and public.is_competition_member(competition_id));

create policy "daily_logs_update_self_current_day"
on public.daily_logs for update
to authenticated
using (user_id = auth.uid() and log_date = current_date and public.is_competition_member(competition_id))
with check (user_id = auth.uid() and log_date = current_date and public.is_competition_member(competition_id));

create policy "weight_entries_select_competition_members"
on public.weight_entries for select
to authenticated
using (public.is_competition_member(competition_id));

create policy "weight_entries_insert_self_current_day"
on public.weight_entries for insert
to authenticated
with check (user_id = auth.uid() and entry_date = current_date and public.is_competition_member(competition_id));

create policy "weight_entries_update_self_current_day"
on public.weight_entries for update
to authenticated
using (user_id = auth.uid() and entry_date = current_date and public.is_competition_member(competition_id))
with check (user_id = auth.uid() and entry_date = current_date and public.is_competition_member(competition_id));

create policy "workout_logs_select_competition_members"
on public.workout_logs for select
to authenticated
using (
  exists (
    select 1
    from public.daily_logs
    where daily_logs.id = workout_logs.daily_log_id
      and public.is_competition_member(daily_logs.competition_id)
  )
);

create policy "workout_logs_insert_self_current_day"
on public.workout_logs for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.daily_logs
    where daily_logs.id = workout_logs.daily_log_id
      and daily_logs.user_id = auth.uid()
      and daily_logs.log_date = current_date
      and public.is_competition_member(daily_logs.competition_id)
  )
);

create policy "meal_logs_select_competition_members"
on public.meal_logs for select
to authenticated
using (
  exists (
    select 1
    from public.daily_logs
    where daily_logs.id = meal_logs.daily_log_id
      and public.is_competition_member(daily_logs.competition_id)
  )
);

create policy "meal_logs_insert_self_current_day"
on public.meal_logs for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.daily_logs
    where daily_logs.id = meal_logs.daily_log_id
      and daily_logs.user_id = auth.uid()
      and daily_logs.log_date = current_date
      and public.is_competition_member(daily_logs.competition_id)
  )
);

create policy "rival_actions_select_competition_members"
on public.rival_actions for select
to authenticated
using (public.is_competition_member(competition_id));

create policy "rival_actions_insert_competition_members"
on public.rival_actions for insert
to authenticated
with check (
  from_user_id = auth.uid()
  and cosmetic_only = true
  and public.is_competition_member(competition_id)
);
