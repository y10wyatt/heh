# Development log

## 2026-06-30 — MVP foundation baseline

- React/Vite mobile-first application scaffolded.
- Domain, repository, scoring, room, feed, and Supabase adapter boundaries added.
- UI copy and visual assets centralized for replacement.
- Proposed normalized schema, RLS, `finalize_day`, and `apply_room_action` added.
- TypeScript unit tests and production build pass.
- Local Supabase configuration initialized with CLI 2.109.0.
- Docker Desktop installed; the migration applies successfully on local PostgreSQL 17.
- Initial pgTAP schema contract: 8/8 passing.
- Supabase security/performance advisors: no issues.
- Database lint identified one explicit `text` to `jsonb` initialization warning; corrected in the migration.
- Corrected migration resets cleanly with no lint or advisor findings.
- pgTAP suite expanded to 27 passing tests across schema contracts, RLS privacy, ownership enforcement, idempotent finalization, reward creation, entitlement replay rejection, protected slots, room mutation, and tie rewards.
- Application suite remains 15/15 passing and the production build succeeds.
- No remote database changes have been applied.

Next gate: add a true simultaneous-call concurrency harness, then connect Supabase Auth and application use cases.

## 2026-07-01 — authenticated capture slice

- Added Supabase Auth session handling and a dedicated sign-in screen.
- Added authenticated challenge-group discovery plus Supabase-backed event and active-rule loading.
- Moved Quick Log creation into a pure `LogAction` use case with injected repository, clock, and UUID generator.
- Removed development UUID dependencies from scoreboard, feed, and rules screens.
- Added loading and error states for authenticated data.
- Added database coverage for glue, mirror, alarm, decoy, and lock trap outcomes.
- Local migration reset, database lint, browser Quick Log check, 16 application tests, 42 database tests, and production build pass.
- No remote database changes have been applied.

Next gate: build simultaneous-client concurrency tests, then connect `finalize_day` and `apply_room_action` to their screens.

## 2026-07-01 — atomic game loop

- Added a reusable simultaneous-client database harness for both privileged operations.
- Proved concurrent `finalize_day` calls create one daily result and one reward set.
- Proved concurrent `apply_room_action` calls create one RoomAction and consume one entitlement once.
- Added typed daily-result, room-item, entitlement, and room-action repository boundaries.
- Added pure `FinalizeDay` and `ApplyRoomAction` use cases with unit tests.
- Added a separate `GameDataProvider` composition boundary for game state.
- Connected Results to atomic day finalization and Raid Mode to atomic room interaction.
- Unified ActionEvents and RoomActions through `FeedItem`; domain contracts remain separate.
- Browser-verified finalize → raid → result → feed with no console errors.
- Application tests: 19 passing. Database tests: 42 passing. Production build: passing.
- No remote database changes have been applied.

Next gate: present the reviewed schema/RLS plan for explicit approval before any remote Supabase change.

## 2026-09-03 — reliable Today capture

- Removed embedded sample tasks from Today; task drafts and stars persist per browser/account/group.
- Extracted Today composition into `HomePage.tsx` and task behavior into a repository-backed service.
- Persisted completion UUID/payload before sending; retries and rapid clicks retain one evidence event.
- Kept completion append-only; removed uncheck/re-complete scoring loop.
- Quick Log now retains one retry draft and requires an explicit new capture after success.
- Today task points come from active rules; score scope is labeled as all loaded logs.
- Corrected sibling activity selection and filtered Today token counts for ownership, group, expiry and use.
- Added 9 regression tests and a runnable Playwright mobile capture check, including a simulated lost response.
- Device-local tasks are not cross-device task sync. Room interactions, weekly results, and cosmetic placeholders need their next implementation passes.
- No remote database changes applied.

## 2026-09-05 — Our Place prototype and Today upgrade

- Built a separate interactive prototype under `artifacts/our-place-prototype`: hallway/door visit cues, rooms, duck pranks, notes, reactions, shared corkboard, and project-note expansion.
- User approved Home's direction. Recorded future simple line art, door customization, and decoratable rooms, with Today for personal goals and Me for optional private metrics.
- Upgraded Today with categorized daily goals, filters, add/edit, once/daily recurrence, postpone, skip, undo, and adjustable weekly category targets.
- Added dated goal outcomes, one-time migration of existing local tasks, local calendar boundaries, and reward/progress safeguards.
- Production build, 28 protected runtime hashes, and all 16 prototype tests pass. Browser checks include persistence and touch scrolling.
- Updated prototype README, design decisions, and `docs/OUR_PLACE_ROADMAP.md` with completed work, limits, and next steps.
- Main application feature code and remote database were not changed by this prototype slice. Existing root application work remains separate.

Next: review Today, then build Me's optional metrics. Shared-app integration follows the sibling-flow pass and must reconcile prototype undo with the main app's append-only scoring model.

## 2026-09-05 — planning, shared beta, widgets, and household growth

Documentation-only update; no application behavior, remote database, or deployment changed.

- Confirmed Me as the thinking/planning/customization hub. Today and Home prioritize action. Recorded long-term goals split into milestones and linked Today actions.
- Recorded selectable quests and evolving earned items: boxing 20 times unlocks gloves. Further thresholds, decoration currencies, and paid-shop details remain proposals.
- Audited `C:/Users/William/Desktop/LIFE DASHBOARD` read-only: existing Vercel link, Supabase auth, private per-user snapshot persistence, and documented staging separation. Recorded reuse boundaries; no credentials copied and no remote state verified.
- Prioritized an Our Place staging web beta with shared accounts, per-record data, live updates, reconnect refresh, and duplicate-safe reward operations. Shared production accounts remain an option after compatibility review.
- Elevated widgets to a core sibling-presence surface. First candidate is a room widget revealing a persisted visit/note and opening its room. Native refresh and direct interactions require real-device validation; widgets are not implemented.
- Recorded horizontally pageable hallways for additional family members while keeping the board household-wide. Initial testing range is 2–6 members, not a permanent product cap.
- Recorded a future neighbourhood of separate close circles. Multiple households, primary household defaults, guest access, room ownership across houses, and zoom-out navigation remain open decisions.
- Updated roadmap order, prototype README, and durable AGENTS.md design decisions so widgets are tested before a large shop and planned features are not confused with completed work.

Next milestone: finish Today review, then prepare the real-phone staging beta with two-account sync. Expand household support and test the first room widget once shared state is reliable. Me goals/quests, customization, shop, and neighbourhood exploration follow the roadmap gates.

Validation: reviewed documentation for consistent feature status and sequencing. No code tests rerun for this documentation-only change; the previous prototype build and 16-test result remain historical evidence.

## 2026-09-05 — session handoff

- Added `docs/OUR_PLACE_HANDOFF.md` as the restart entry point, linked from both READMEs.
- Recorded the three project locations, completed prototype behavior, planned features, historical verification, run/check commands, current staging milestone, and Supabase/Vercel audit limits.
- Documented dirty-worktree preservation, protected preview runtime, local-versus-authoritative reward differences, and browser QA artifacts.
- Documentation only. No deployment, database operation, or code/test execution performed for this handoff update.

## 2026-09-05 — accepted world-system review and pet monetization

- Recorded the persistent shared-home north star and reference mix as original art/system direction, not a direct copy of any reference app.
- Added prank lifecycle (placed, discovered, reacted, tidied/kept), reversible avatar/furniture overlays, sound/quiet preferences, and a small active-prank limit. Next interaction slice emphasizes note, pillow, and gift.
- Added canonical-avatar rules, historical memory appearance exceptions, fixed-slot modular rooms, and a reduced art MVP. Avatar body type remains undecided; Me retains planning and the hallway remains the landing screen.
- Separated memories, displayable keepsakes, and placements; storing a keepsake preserves its history and private content is not automatically shared.
- Clarified one base reward per activity, explicit milestone bonuses, earned achievement tiers, and optional cosmetic monetization. Example coin amounts remain unbalanced proposals.
- Added one shared pet per household as a later resident/courier and explicit monetization opportunity through optional cosmetics, outfits, habitats, toys, and animations. Basic pet play remains available without payment or neglect penalties. Prices, pet type, purchase ownership, and member-departure behavior remain open.
- Updated roadmap, handoff, prototype README, and durable design instructions. All new systems are marked planned, not implemented.

Documentation-only change. Preview, application code, remote data, and deployments unchanged. No tests rerun; prior implementation validation remains historical evidence.
