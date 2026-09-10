# Proposed schema and RLS plan — approval required

The original parallel-schema proposal was not applied. The selected legacy-compatible household migration was approved and applied on September 10, 2026; this document now records its review lineage and remaining cleanup work.

Tables are grouped into identity/group (`profiles`, `challenge_groups`, `challenge_group_members`), evidence/challenges (`action_events`, `challenges`, `point_rules`, `comments`), rooms (`rooms`, `room_slots`, `room_items`, `room_actions`, `room_traps`, `room_action_entitlements`), and finalized calculation (`daily_results`).

RLS plan:

- Authenticated users manage their own profile and append their own immutable events.
- Group membership gates shared events, challenges, rules, comments, rooms, room actions, and results.
- There are no direct client insert/update grants for room state, entitlements, room actions, or daily results.
- Only the non-exposed `sibling_private.finalize_day` and `sibling_private.apply_room_action` security-definer functions perform authoritative mutations.
- Both functions use a fixed empty `search_path`, validate `auth.uid()`, lock relevant rows, and are executable only by `authenticated`.
- Unique event IDs, `(group, date)` daily results, and `(group, user, date, entitlement type)` entitlements prevent duplicate records.
- Views, if added, must use `security_invoker = true`.

Local review evidence:

- Clean migration reset and database lint.
- 42 pgTAP schema, RLS, transaction, reward, protected-slot, and trap tests.
- Simultaneous-client proof that `finalize_day` creates one result/reward set.
- Simultaneous-client proof that `apply_room_action` creates one mutation and consumes one entitlement once.
- 19 application tests and a successful production build.

The original proposal remains blocked from remote use. The approved replacement is `supabase/proposals/20260909_household_onboarding.sql`, followed by `supabase/proposals/20260910_post_apply_hardening.sql`.

## September 9 remote compatibility update

The selected project already has a legacy household and fitness schema. Do not apply the original `202606290001_sibling_showdown_proposal.sql` remotely because it would create a parallel group model and conflicts with the existing `profiles` table. See `SUPABASE_STAGING_AUDIT.md` and the additive review artifact at `supabase/proposals/20260909_household_onboarding.sql`.

The additive proposal passed 20 legacy-compatibility pgTAP checks, a simultaneous two-client invite claim, and Supabase local database lint. It closes legacy direct-join, role-promotion, and unused-invite enumeration paths. Owner approval was received and both migrations are now applied. Remaining advisor notices are documented in `SUPABASE_STAGING_AUDIT.md`.
