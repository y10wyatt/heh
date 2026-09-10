# Development log

## 2026-09-10 — Shared sync, Today persistence, mobile web shell

- Added `20260910_sync_and_mobile.sql`: durable `personal_action_events`, guarded RPCs for logging completions and marking surprises discovered, and Realtime publication for household actions, rooms, and personal events.
- Connected board notes and household action reads/writes to Supabase. Open devices refresh when household actions or Today events change.
- Added an installable PWA shell with manifest, icon, service worker, viewport, and iOS metadata. Native widgets remain a later phase.
- Validation: `npm run test` (31 passed), `npm run build` passed, and remote checks confirmed the table, RPCs, and Realtime publication entries.

Next: sync task drafts/starring, add the internal shared calendar and Google OAuth, and replace the legacy raid route with the household action picker.

## 2026-09-10 — Task drafts and household action picker

- Added a household action picker to sibling room visits: poke, note, pillow, gift, and silly object. Actions use the existing guarded `our_place_leave_action` RPC.
- Added Supabase task draft adapter and `personal_tasks` migration. The app merges remote drafts into the local task service and writes add/star/complete changes back through `our_place_save_task`.
- Code and tests are ready. Applying the task migration is pending because the Supabase management connection began timing out repeatedly after the Disk IO warning; retry before exercising task sync in production.

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

## 2026-09-08 — main-app Our Place integration and calendar direction

- Integrated the approved hallway-first Home, shared board, personal rooms, Today categories/weekly progress, and Me planning/customization surface into the main React application.
- Preserved the existing service and repository boundaries. Task completion still writes append-only action evidence and uses active scoring rules.
- Fixed the application provider so a prepared task completion keeps its stable task ID. Added safe recovery for legacy browser evidence whose external task reference matches, preventing a second point award.
- Added scoped Our Place styling, reusable view components, locally bundled fonts/icons, and generated visual assets. The main routes are now `/`, `/today`, `/me`, and `/house/rooms/:roomId`. Resized the art for its mobile display bounds, reducing the asset set from about 18.5 MB to 10.9 MB while retaining 2× phone sharpness where it matters.
- Browser-verified room discovery/tidy, board-note creation, Today goal creation/completion with weekly and point updates, and Me navigation. Board notes, door seen-state, tidy display state, and task drafts remain browser-local.
- Chose Calendar as a Home subpage rather than a fourth primary tab. Planned an app-owned household agenda, private-by-default personal overlays, and per-user Google Calendar OAuth with selected-calendar read/export before broader two-way sync.
- Updated the roadmap and handoff with status, calendar privacy/model guidance, and the next staging sequence.

Verification: 8 test files and 29 tests passed; the production TypeScript/Vite build passed. Browser behavior checks covered room discovery/tidy, board-note creation, Today goal creation/completion, point and weekly updates, and Me navigation. Home and room also passed 426×932 source/implementation visual comparison; see `design-qa.md`.

No Google authorization or remote database change was performed in this slice.

## 2026-09-08 — GitHub and Vercel production release

- Pushed the integrated Our Place application to GitHub `main` in commit `fc51891`.
- Vercel's first clean build exposed missing ignored files from the locally vendored Radix icon package. Added its runtime and TypeScript declarations in commit `a3261c9`; the same production build then completed successfully.
- Vercel marked `a3261c9` Ready in Production and assigned the existing `sibling-showdown.vercel.app` domain.
- Browser-verified the production alias opens the new Our Place hallway, board, Home/Today/Me navigation, and contains no console errors on initial load.

No remote database migration or Google Calendar authorization was performed. Shared-board notes, door seen-state, tidy display state, and task drafts remain browser-local.

## 2026-09-08 — personal account entry

- Reused the Life Dashboard Supabase Auth pattern for personal email/password accounts, existing-account sign-in, and magic-link sign-in.
- Added a dedicated Our Place account screen with confirmation feedback, eight-character signup validation, persistent Supabase sessions, and local-scope sign-out.
- Kept account identity shared at the Supabase Auth layer while preserving separate application tables and repository boundaries.
- Added compatibility for current publishable keys, the Life Dashboard's legacy browser-key variable name, and the existing Vercel project's `NEXT_PUBLIC_` variable names.
- Copied the Life Dashboard's browser-safe Supabase configuration into the ignored local environment file for local testing. No credential was committed or printed.
- Added focused validation coverage. Nine test files with 31 tests pass, the production build passes, and the account-mode browser check reports no console errors.
- Pushed commit `05b9cb6` to GitHub `main`; Vercel deployed it successfully and assigned the production alias. Browser verification confirmed that production reads the existing Supabase variables and shows both account modes without console errors.

No remote database migration was applied. Supabase redirect allow-list verification requires an owner dashboard session. Newly created accounts still require household membership; self-service household creation/invitations and shared-data sync are the next slice.

## 2026-09-09 — selected Supabase project and onboarding audit

- Selected and restored project `raidfgiukctxxmahnuzs` (Weight Loss Competition). Confirmed it is separate from Life Dashboard and already contains 10 Auth users, one group, two memberships, five invites, and three profiles.
- Configured the Auth Site URL/redirect allow-list for the production app, local port 5173, and Vercel previews.
- Pointed the ignored local environment at the selected project and added explicit browser-safe `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` configuration to Vercel for Production, Preview, and Development. Existing deployments have not been redeployed against the new variables yet.
- Audited the legacy household schema and RLS read-only. Found that the unused-invite SELECT policy exposes every unused code to authenticated users.
- Added `docs/SUPABASE_STAGING_AUDIT.md` and a review-only additive onboarding proposal that preserves current accounts/groups, hardens invitations, adds atomic create/join operations, preferences, member rooms, and five persistent action types.

No remote database table, policy, function, or row was changed. Next: reproduce the legacy schema locally, add RLS/concurrency tests, and obtain the approval required by `SCHEMA_RLS_PLAN.md` before applying the proposal.

## 2026-09-09 — household proposal verification

- Recreated the audited legacy household tables, grants, and policies in local Supabase and made the additive proposal safe to rerun.
- Found and closed two additional legacy bypasses in the proposal: direct self-joining of a known group and self-promotion through membership updates. Household create/join now uses only the authenticated RPC path.
- Added coverage for signed-out access, group/membership mutation denial, owner creation and retry, private invite visibility, sibling join and retry, room creation, persistent notes, duplicate action IDs, annoyance preferences, and member counts.
- Added a real two-client race test. Simultaneous claims of one invite create exactly one sibling membership and consume the invite once.
- Ran the remote Supabase security/performance advisors read-only and recorded their pre-migration baseline in `SUPABASE_STAGING_AUDIT.md`.

Validation: all 20 pgTAP assertions passed, the simultaneous invite race passed, Supabase local database lint found no schema errors, all 31 application tests passed, and the production build succeeded.

No remote database table, policy, function, or row changed. The proposal is ready for owner review; `SCHEMA_RLS_PLAN.md` still requires explicit approval before remote application.

## 2026-09-10 — approved household migration and onboarding integration

- Received owner approval and applied `secure_household_onboarding` to Supabase project `raidfgiukctxxmahnuzs`.
- Applied `post_apply_legacy_hardening` to add the action actor index and remove anonymous execution from legacy security-definer helpers.
- Verified remote tables/functions and preserved counts: one group, two memberships, five invites, three profiles. Existing members have no settings/rooms yet; onboarding will create those rows.
- Re-ran remote advisors. New onboarding foreign-key warning is gone. Remaining notices are intentional authenticated RPC security-definer access, disabled leaked-password protection, and pre-existing fitness-schema tuning.
- Connected the app to legacy-compatible household state, create/join/complete RPCs, member rooms, and persistent household actions. Added signed-in onboarding UI for household setup, invite joining, name/avatar, annoyance level, and door sign/color.

Validation: 31 application tests and production build pass after integration. Local database suite previously passed 20 pgTAP assertions, simultaneous invite race, and database lint.

Next: deploy this application integration, complete onboarding with the two existing accounts, then replace local board/room state with live persistence and reconnect refresh.

## 2026-09-10 — onboarding build deployed

- Pushed commit `38a3183` to `origin/main` and confirmed the Vercel production deployment is Ready at `https://sibling-showdown.vercel.app`.
- Verified the signed-out production route reaches the Supabase account entry screen. A signed-in onboarding run is still pending because no test credentials were supplied.
- Updated handoff and roadmap checkpoints: next work is onboarding with both existing accounts, then persistent board/room actions and Realtime/reconnect refresh.

Known limitation: connected Today completion still targets the legacy `action_events` path, which is absent from the selected backend. Keep that persistence slice separate from the approved household migration; do not re-enable direct legacy writes.

## 2026-09-09 — temporary email-free auth testing

- Disabled Supabase **Confirm email** for project `raidfgiukctxxmahnuzs` so private beta accounts can be created and used with email + password without waiting for SMTP delivery.
- Verified the setting persisted after dashboard reload. Re-enable it before public launch, or configure a verified SMTP provider first.

## 2026-09-10 — Disk IO warning review

- Reviewed the Supabase Disk IO Budget warning for `raidfgiukctxxmahnuzs`.
- Current dashboard snapshot: Disk IO 1%, CPU 26%, memory 89%, 0.27 GB of 2 GB disk used; database report cache hit 99.27%, CPU 7.46%, database size 0.03 GB.
- Query stats were dominated by Supabase dashboard metadata scans and migration/advisor work, with no high-volume app query visible. No compute upgrade or schema change made.
- Next check: monitor the hourly report during ordinary app use. Optimize a confirmed workload before considering paid compute.
