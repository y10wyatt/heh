alter table public.group_invites
alter column expires_at set default 'infinity'::timestamptz;

update public.group_invites
set expires_at = 'infinity'::timestamptz,
    used_at = null,
    used_by = null;

drop policy if exists "group_invites_select_members_or_valid_code" on public.group_invites;

create policy "group_invites_select_members_or_valid_code"
on public.group_invites for select
to authenticated
using (
  public.is_group_member(group_id)
  or used_at is null
);
