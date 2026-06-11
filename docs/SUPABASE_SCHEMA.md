# Supabase Schema

This schema is designed for a private two-person MVP, while allowing future groups.

The canonical migration lives at:

`supabase/migrations/202606100001_initial_competition_schema.sql`

## Tables

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_id text not null default 'mint-blob',
  weight_unit text not null default 'lb',
  starting_weight numeric,
  current_weight numeric,
  goal_weight numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.competitions (
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

create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  water_cups int not null default 0,
  water_goal int not null default 8,
  workout_completed boolean not null default false,
  workout_goal_minutes int not null default 30,
  workout_muscle_groups text[] not null default '{}',
  custom_workout_muscle_groups text[] not null default '{}',
  meal_photo_count int not null default 0,
  meal_photo_bonus_earned boolean not null default false,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, user_id, log_date)
);

create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  weight numeric not null,
  is_weekly_weigh_in boolean not null default false,
  created_at timestamptz not null default now(),
  unique (competition_id, user_id, entry_date)
);

create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed boolean not null default false,
  duration_minutes int,
  muscle_groups text[] not null default '{}',
  custom_muscle_groups text[] not null default '{}',
  import_source text not null default 'manual',
  external_id text,
  raw_import jsonb,
  created_at timestamptz not null default now(),
  unique (import_source, external_id)
);

create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_url text,
  bonus_earned boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.rival_actions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null,
  reason text not null,
  cosmetic_only boolean not null default true,
  created_at timestamptz not null default now()
);
```

## Storage

Meal photos use a private Supabase Storage bucket:

- Bucket: `meal-photos`
- Object path shape: `{userId}/{date}/{photoId}.{extension}`
- Policies allow signed-in users to select, insert, update, and delete only files under their own user-id folder.
- `meal_logs.photo_url` stores the storage object path, not a permanent public URL. The app creates short-lived signed URLs when it needs to display the image.

## RLS Direction

Enable row-level security on every table. Users should only read and write rows connected to groups where they are a `group_members` row.

The first migration includes MVP row-level security policies:

- Profiles are visible to the current user and members of shared groups.
- Groups, members, competitions, logs, workouts, meals, and rival actions are limited to group/competition members.
- Daily logs and weight entries can only be inserted/updated for the current user on the current date.
- Rival actions are cosmetic only.
- User profiles store a preferred weight unit (`lb` or `kg`). Calculations use the number exactly as entered, so both players in a competition should choose the same unit for a fair comparison.

## Apply Order

1. Create or choose the Supabase project.
2. Apply `supabase/migrations/202606100001_initial_competition_schema.sql`.
3. Copy project URL and anon key into `.env.local`.
4. Configure Supabase Auth email settings.
5. Run the app and visit `/auth/sign-in`.

## Applied Project

The initial migration has been applied to:

- Project name: `Weight Loss Competition`
- Project id: `raidfgiukctxxmahnuzs`
- Migration name in Supabase: `initial_competition_schema`
