# Proposed schema and RLS plan — approval required

No remote database changes have been made.

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

Review blocker: explicit owner approval is required before this proposal is applied to the shared remote Supabase project.
