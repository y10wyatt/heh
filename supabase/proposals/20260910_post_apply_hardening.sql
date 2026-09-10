-- Applied after secure_household_onboarding with owner approval.
-- Covers one advisor finding and legacy public function privileges.

begin;

create index if not exists household_actions_actor_idx
  on public.household_actions(actor_id);

revoke all on function public.rls_auto_enable() from public, anon, authenticated;
revoke all on function public.is_competition_member(uuid) from public, anon;
grant execute on function public.is_competition_member(uuid) to authenticated;

commit;
