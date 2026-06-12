drop policy if exists "group_members_select_self_or_members" on public.group_members;
drop policy if exists "group_members_update_self" on public.group_members;

create policy "group_members_select_self_or_members"
on public.group_members for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_group_member(group_id)
);

create policy "group_members_update_self"
on public.group_members for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
