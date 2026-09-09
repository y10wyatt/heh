-- Local-only representation of the selected project's existing household tables.
-- Run after the repository's normal local migration reset.

alter table public.profiles add column if not exists avatar_id text not null default 'hamster-orange';
alter table public.profiles add column if not exists weight_unit text not null default 'lb';

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

create table if not exists public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  code text not null unique,
  created_by uuid not null references public.profiles(id) on delete cascade,
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invites enable row level security;

grant select, insert, update on public.groups to authenticated;
grant select, insert, update on public.group_members to authenticated;
grant select, insert, update on public.group_invites to authenticated;

create or replace function public.is_group_member(p_group_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.group_members member
    where member.group_id = p_group_id and member.user_id = (select auth.uid())
  );
$$;

drop policy if exists groups_select_members on public.groups;
create policy groups_select_members on public.groups for select to authenticated
  using (public.is_group_member(id));
drop policy if exists groups_insert_creator on public.groups;
create policy groups_insert_creator on public.groups for insert to authenticated
  with check (created_by = (select auth.uid()));

drop policy if exists group_members_select_self_or_members on public.group_members;
create policy group_members_select_self_or_members
  on public.group_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_group_member(group_id));
drop policy if exists group_members_select_members on public.group_members;
create policy group_members_select_members
  on public.group_members for select to authenticated
  using (public.is_group_member(group_id));
drop policy if exists group_members_insert_self_or_creator on public.group_members;
create policy group_members_insert_self_or_creator
  on public.group_members for insert to authenticated
  with check (
    user_id = (select auth.uid()) or exists (
      select 1 from public.groups target
      where target.id = group_id and target.created_by = (select auth.uid())
    )
  );
drop policy if exists group_members_update_self on public.group_members;
create policy group_members_update_self
  on public.group_members for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists group_invites_select_members_or_valid_code on public.group_invites;
create policy group_invites_select_members_or_valid_code
  on public.group_invites for select to authenticated
  using (public.is_group_member(group_id) or used_at is null);
drop policy if exists group_invites_insert_group_members on public.group_invites;
create policy group_invites_insert_group_members
  on public.group_invites for insert to authenticated
  with check (created_by = (select auth.uid()) and public.is_group_member(group_id));
drop policy if exists group_invites_update_valid_invite on public.group_invites;
create policy group_invites_update_valid_invite
  on public.group_invites for update to authenticated
  using (used_at is null and expires_at > now())
  with check (used_by = (select auth.uid()) and used_at is not null);
