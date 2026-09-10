# Supabase staging audit

Audited September 9, 2026. Target project: `raidfgiukctxxmahnuzs`, currently named **Weight Loss Competition**.

## Verified remotely

- The project restored successfully and reports Healthy on Nano compute.
- It is separate from the Supabase project configured in the Life Dashboard checkout.
- The Auth Site URL is `https://sibling-showdown.vercel.app`.
- Redirects now include the production origin, the legacy `/auth/callback`, local port 5173 for both `localhost` and `127.0.0.1`, and the Vercel preview pattern.
- Auth already contains 10 accounts.
- Public tables are `competitions`, `daily_logs`, `group_invites`, `group_members`, `groups`, `meal_logs`, `profiles`, `rival_actions`, `weight_entries`, and `workout_logs`.
- Current household records: one group, two memberships, five invites, and three profiles.
- RLS is enabled on `profiles`, `groups`, `group_members`, `group_invites`, and `rival_actions`.
- Existing household columns are usable: groups have an owner; memberships have roles; invites have a unique code, expiry, creator, and consumption fields.

## Compatibility finding

The deployed React app's newer local proposal expects `challenge_groups`, `challenge_group_members`, `action_events`, `point_rules`, and room tables. Those tables are not part of this older backend. The remote project should be extended around its existing `groups`, `group_members`, `group_invites`, and `profiles` records so current accounts and the two-person group are preserved.

The existing `group_invites_select_members_or_valid_code` RLS policy permits any authenticated user to select every unused invite. Filtering by a code in the client does not make that safe because RLS grants row visibility before considering the client's intended UX. The legacy membership policies also let a signed-in user add themselves to a known group and change their own role. The current direct membership and invite-claim paths should not be used for the new onboarding.

## Prepared change

`supabase/proposals/20260909_household_onboarding.sql` is a review-only additive proposal. It:

- preserves the current profiles, group, memberships, and invites;
- restricts invite reads to household members;
- removes direct group creation, membership insertion, and member-role updates from browser clients;
- moves create/join behind short, atomic, authenticated RPC transactions;
- locks invite consumption so two clients cannot claim one code;
- makes account creation idempotent per user;
- adds per-household annoyance preferences and quiet-hour fields;
- adds one customizable room record per member;
- adds the first persistent actions: poke, note, pillow, gift, and silly object;
- limits open visual pranks and respects the recipient's annoyance level;
- uses RLS, minimal grants, indexed foreign keys, fixed function search paths, and client-supplied action IDs.

## Local verification completed

- Recreated the relevant legacy tables, grants, and policies in local Supabase.
- Applied the proposal repeatedly to prove it is rerun-safe.
- Passed 20 pgTAP assertions covering signed-out denial, direct-membership denial, role-promotion denial, household creation/retry, invite privacy, join/retry, room creation, persistent actions, duplicate IDs, and annoyance preferences.
- Passed a two-client race: simultaneous claims of one invite produced exactly one membership and one consumed invite.
- Supabase local database lint reported no schema errors.
- The existing React suite still passes 31 tests and the production build succeeds.

## Remote advisor baseline

The advisor scan was read-only and ran before this proposal was applied. It reports legacy warnings, including public execution of security-definer helpers, unindexed foreign keys, repeated `auth.uid()` calls in old RLS policies, duplicate membership SELECT policies, and disabled leaked-password protection. The proposal removes anonymous access from `is_group_member`, consolidates the membership read policy, and adds the missing household foreign-key indexes. Authenticated access to `is_group_member` remains intentional because it returns only whether the caller belongs to a supplied group and supports RLS. Other fitness-schema warnings remain separate cleanup work. See Supabase's [security-definer advisory](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [foreign-key index advisory](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys), and [RLS performance guidance](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select).

Compatibility risk: the proposal deliberately disables the legacy browser's direct group creation, self-join, role update, and invite mutation paths. Any still-used Weight Loss Competition client that relies on those writes would need to move to the new RPCs. Confirm that the retired client does not need continued write compatibility before applying the migration.

## Remote application completed

- Owner approval received September 10, 2026.
- Applied as migration `secure_household_onboarding` to project `raidfgiukctxxmahnuzs`.
- Applied follow-up `post_apply_legacy_hardening` with the actor index and legacy helper privilege cleanup.
- Verified new tables/functions exist, existing counts remain one group/two memberships/five invites/three profiles, and anonymous access to legacy helper functions is disabled.
- Remote advisors now show no new onboarding foreign-key warning. Remaining warnings are intentional authenticated security-definer RPC access, disabled leaked-password protection, and pre-existing fitness-schema RLS/index tuning.

## Next application work

1. Sign in with both existing accounts at `https://sibling-showdown.vercel.app` and complete onboarding to create settings/rooms.
2. Replace browser-local board/room action writes with the persistent household action repository and add Realtime/reconnect refresh.
3. Add app-owned shared plans and the mobile agenda, then evaluate per-user Google Calendar OAuth.

## Disk IO warning review — September 10, 2026

- Supabase sent a Disk IO Budget warning for this project. A live dashboard check shortly afterward showed the primary `t4g.nano` instance at **1% Disk IO**, **26% CPU**, and **89% memory**; storage was **0.27 GB of 2 GB**.
- The database report showed a **99.27% cache hit rate**, **7.46% CPU**, and **0.03 GB** database size. Disk IOPS/throughput charts were temporarily unavailable in the dashboard.
- Query Performance showed two slow queries, both Supabase metadata introspection (`pg_timezone_names` and `pg_available_extensions`), not application queries. `pg_stat_statements` was dominated by dashboard introspection and migration/advisor work; no high-volume application writer was visible.
- Conclusion: treat the email as a burst/throttling warning. Do not upgrade compute yet. Avoid repeated advisor/schema scans on the nano instance, watch Disk IO and memory over the next day, and revisit sizing only if the warning repeats during normal app traffic.
- If the warning repeats, capture the hourly report first, then optimize the specific query or move to a larger compute add-on. Compute changes are paid plan decisions and were not made here.

No additional remote tables, policies, functions, or rows were changed during this documentation pass.
