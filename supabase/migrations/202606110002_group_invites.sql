create table if not exists public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  code text not null unique,
  created_by uuid not null references public.profiles(id) on delete cascade,
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create index if not exists group_invites_group_id_idx on public.group_invites(group_id);
create index if not exists group_invites_code_idx on public.group_invites(code);

alter table public.group_invites enable row level security;

create policy "group_invites_select_members_or_valid_code"
on public.group_invites for select
to authenticated
using (
  public.is_group_member(group_id)
  or (used_at is null and expires_at > now())
);

create policy "group_invites_insert_group_members"
on public.group_invites for insert
to authenticated
with check (created_by = auth.uid() and public.is_group_member(group_id));

create policy "group_invites_update_valid_invite"
on public.group_invites for update
to authenticated
using (
  used_at is null
  and expires_at > now()
)
with check (
  used_by = auth.uid()
  and used_at is not null
);
