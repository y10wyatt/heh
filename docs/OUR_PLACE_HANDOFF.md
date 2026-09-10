# Our Place handoff

Updated September 10, 2026.

## Current main-app state

The selected Our Place direction is integrated into the main application and deployed to `https://sibling-showdown.vercel.app`. Integration commit `fc51891` added Home, Today, Me, rooms, and supporting task/domain fixes. Follow-up commit `a3261c9` included the vendored icon runtime and declarations required by Vercel's clean build.

Main routes now are:

- `/` — shared hallway and board
- `/today` — categorized personal actions and weekly progress
- `/me` — planning, tracking, collection, and quest entry points
- `/house/rooms/:roomId` — personal rooms and persistent visit discovery

Household board notes and action records now use Supabase with Realtime refresh. Today completion events are durable in `personal_action_events`; task drafts and starring remain browser-local. A provider bug that discarded prepared task IDs was fixed, with legacy completion recovery that avoids duplicate rewards.

## Calendar decision — September 8

Add `Our calendar` inside Home instead of adding a fourth bottom tab. Home should surface `Next together`; opening it shows a mobile agenda with shared plans first. The detailed week/month planner belongs naturally in the future website/Life Dashboard connection.

Build the internal household event model after shared account sync, then connect Google Calendar per user through OAuth. Personal calendar details remain private by default; siblings receive busy blocks unless the owner explicitly shares details. Begin with calendar-list read access and free/busy overlays. For writing, prefer a dedicated app-created `Our Place` Google calendar before asking for the broader scope needed to edit arbitrary calendars. Delay general two-way editing until recurrence, deletion, conflict, retry, invalid-sync-token recovery, and permission behavior have tests.

No calendar UI, Google OAuth grant, remote schema, or sync job has been implemented yet. The full data/privacy sequence is in `OUR_PLACE_ROADMAP.md`.

## Current state

The approved prototype has been translated into the main application, passed its local code/mobile visual checks, and replaced the old Vercel UI. The next milestone is exercising two-account sync in staging. The old raid route still expects legacy entitlements; the household action picker is next.

## Three separate locations

| Location | Role |
| --- | --- |
| `C:/Users/William/Documents/Life Dashboard - Capture Rivalry` | Existing main application: auth, domain/repository boundaries, atomic scoring and room operations. |
| `C:/Users/William/Documents/Life Dashboard - Capture Rivalry/artifacts/our-place-prototype` | Approved visual/interaction prototype. Independent package, browser-local data, simulated mobile runtime. |
| `C:/Users/William/Desktop/LIFE DASHBOARD` | Existing companion planning app. Inspected read-only; locally linked to Vercel project `lifedashboard`. |

Both existing application repositories contained uncommitted work when inspected. Preserve it. Check current `git status` and scoped diffs before editing; do not attribute every dirty file to this task or reset unrelated changes. The prototype directory was untracked in the parent repository at last inspection; verify it is included when preparing an intentional commit.

## Product decisions to preserve

- Core feeling: living under the same roof again, with affectionate sibling mischief and asynchronous visits.
- Home: hallway first, doors into rooms, shared sticky-note board. Ajar means unseen visit; no hallway sentence announcing the visitor. Keep the approved layout until implementing the planned horizontal expansion.
- Today: actions, quick capture, daily goals, weekly progress.
- Me: thinking/planning, long-term goals and milestones, quest selection, optional private metrics, customization. Do not move primary goal setup into Today.
- Future hallway: horizontally page through additional members' doors; board remains household-wide. Start by testing 2–6 people, without making that a permanent limit.
- Households represent chosen close circles. Neighbourhoods, multiple memberships, primary household, and visitor access remain options to validate. Friendship alone grants no household access.
- Widgets are central: first candidate shows your room's latest surprise/note and opens the room. Design a small authorized summary from persistent events. Widget refresh alone should not acknowledge a visit. Native refresh timing/direct actions are unverified.
- Future art should be simple line art with reusable objects. Owner decorations and temporary visitor effects stay separate.
- Quest example: 20 boxing sessions unlock gloves that evolve with continued boxing. Later thresholds and economy details are proposals. A decoration shop is planned; no purchases/payments exist.
- Latest accepted design review: reversible persistent pranks, one canonical modular avatar, fixed-slot room stages, and memories separated into records/keepsakes/placements. Start with the reduced art catalog in the roadmap; keep the hallway landing and Me's planning role. The avatar body type is still undecided.
- One shared pet per household is a later resident/prank courier and an explicit future monetization surface. Optional pet outfits, appearances, beds, toys, and animations are candidate cosmetics. No neglect penalties or paid prank advantage; pricing, ownership, and departure rules need design. None of this is implemented.

## What works in the prototype

- Two doors with unseen-visit state; enter rooms; leave ducks/notes; react; tidy.
- Shared board notes, checklist steps, and note-to-project planning.
- Today categories and filters: Body, Mind, Joy, Everyday.
- Add/edit goals, once/daily repeat, completion, postpone, skip, undo.
- Weekly action-count targets with dated completion progress and Monday boundaries.
- Local storage and migration from the older undated personal-task list.
- Me contains demo sibling-switch/reset controls only; real planning/metrics are not built.

The model still hardcodes `william` and `sister`. The sibling switch is a simulation, not authentication. Local storage key: `our-place-interactive-preview-v1`. Different origins have separate data.

## Run the integrated main app

Run from the repository root:

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
npm run test
npm run build
```

Preview: `http://127.0.0.1:5173/`.

Last verified September 9: 9 test files and 31 tests passed; the production TypeScript/Vite build passed. Mobile Home and room captures at 426×932 previously passed visual comparison. Evidence is in the root `design-qa.md` and `qa/` directory.

## Resume the reference prototype

Run from the prototype directory with Node 24:

```powershell
npm ci
npm run dev -- --host 127.0.0.1 --port 5180 --strictPort
```

Reference preview: `http://localhost:5180/`. It is retained for historical behavior and design comparison; new runtime work belongs in the main application unless a deliberate prototype experiment is requested.

```powershell
npm run build
node --test tests/*.test.mjs
```

Last verified September 5: build and 28 protected-runtime hashes passed; all 16 prototype tests passed (7 Today, 5 household, 4 static packaging). This is historical evidence, not a fresh run during this handoff update. Main-app/database historical results are separate in the development log.

Browser checks completed: complete/undo points and weekly totals, postpone/undo, filters, add/edit/repeat, weekly target changes, persistence after reload, and touch-style scrolling. Skip and date rollover are covered by logic tests. Native-device, Pixel, and assistive-technology checks remain outstanding.

Evidence: `artifacts/our-place-prototype/design-qa.md` and `qa/today-updated.png`, `qa/today-weekly.png`, `qa/home-comparison.png`, `qa/room-comparison.png`.

## Code map and integration cautions

- `artifacts/our-place-prototype/src/Prototype.tsx`: screen composition and interactions.
- `artifacts/our-place-prototype/src/prototype.css`: app-specific styling.
- `artifacts/our-place-prototype/src/house-model.ts`: pure household, calendar, goal, and reward rules.
- `artifacts/our-place-prototype/src/house-store.tsx`: React context, local loading/migration/saving.
- `artifacts/our-place-prototype/tests/today.test.mjs`: calendar/reward regression coverage.

Read the prototype's full `AGENTS.md` before implementation. Its mobile runtime files are protected; preserve them for design review. Build a deliberate real-phone app entry/layout for deployment rather than casually deleting the preview shell. The future hallway should use the provided Carousel.

Known behavior: completion undo requires an unspent point; old undated completions migrate to the migration date without receiving points again. Weekly targets count actions, not distance/minutes. The main app instead uses append-only evidence and authoritative transactions; integration needs a defined reversal operation, not copying local balance mutations.

Browser QA note: generic automation scrolling moved the outer `.device-screen` and exposed the hidden keyboard asset. Reload plus touch-style drag verified the intended scroll path. A full reload also resolved a provider-context error caused by development hot reload. Do not change protected runtime files to compensate for those automation artifacts.

## Supabase/Vercel findings

- Life Dashboard has Supabase magic-link/password auth and per-user `dashboard_snapshots` JSON storage. Our Place now implements the same three account entry methods while retaining its own repositories and tables. No Realtime subscriptions were found in the inspected Life Dashboard source.
- The account entry screen is live in production. The selected project's production, preview, and local Auth redirects have been verified, and explicit browser-safe Supabase variables are stored for all three Vercel environments. The current production deployment predates that Vercel variable update.
- Its local Vercel project link does not verify deployment health or remote environment values.
- Its `docs/STAGING.md` calls for a separate staging Supabase project and a separate Vercel project or staging-configured preview.
- Recommend a separate Our Place Vercel project and staging database for the beta. Reusing Life Dashboard's production identity/project remains an eventual option after compatibility review.
- Reuse auth patterns, but use separate household/goal/event records for concurrent shared activity. Avoid whole-household snapshot overwrites.
- No secret values were copied or recorded. Do not expose server keys in browser variables.
- On September 9 the selected `raidfgiukctxxmahnuzs` project was restored and audited. It is the older Weight Loss Competition backend, is separate from Life Dashboard, and already contains Auth users plus one two-member group. Production/local/preview Auth redirects are configured. Its legacy group and invite tables should be preserved; see `SUPABASE_STAGING_AUDIT.md`.
- The old unused-invite policy exposed unused codes, and the old membership policies allowed direct join and self-role changes. The migration closed those paths and replaced create/join with atomic RPCs. It passed 20 pgTAP checks, a simultaneous two-client invite race, local database lint, 31 application tests, and the production build.
- Owner approved and applied `secure_household_onboarding` on September 10, followed by `post_apply_legacy_hardening`. Existing records remain intact: one group, two memberships, five invites, three profiles. Existing accounts still need to complete onboarding so settings and rooms are created.
- Applying it intentionally retires the legacy client's direct group/join/role/invite write paths. Old Weight Loss Competition clients need migration to the new RPCs if they are still used.

## Next concrete milestone

The database foundation is applied and the onboarding-connected build is live at `https://sibling-showdown.vercel.app`. Current checkpoint: exercise onboarding with both existing accounts, then persist room actions and verify cross-device discovery.

Temporary testing setting: Supabase **Confirm email** is currently disabled because the project has no custom SMTP provider. Password signup works without email delivery. Re-enable confirmation before public release or after configuring SMTP.

1. Sign in with both existing accounts and complete onboarding; verify one settings row and room per member.
2. Replace browser-local board/room writes with per-record persistence, scoped live updates, and reconnect refresh.
3. Verify two-account phone/desktop delivery, reopened surprise discovery, retry safety, sign-out cleanup, and failed-save recovery.
4. Add app-owned shared plans and the mobile agenda. Then add per-user Google OAuth, selected calendars, busy-detail privacy, and explicit export.

Then: household scaling → first native room widget → Me goals/boxing quest → decoration/collection → earned shop → paid cosmetics and neighbourhood exploration after validation. The full roadmap governs sequencing and open decisions.

## Reading order

1. [Roadmap](OUR_PLACE_ROADMAP.md): current priorities, proposals, and open decisions.
2. [Development log](DEVELOPMENT_LOG.md): historical implementation and planning work.
3. [Prototype guide](../artifacts/our-place-prototype/AGENTS.md): editing/runtime contract and durable user preferences.
4. [Prototype README](../artifacts/our-place-prototype/README.md): implemented behavior and commands.
5. [Schema/RLS proposal](SCHEMA_RLS_PLAN.md): main-app transaction boundaries and remote review status.

User communication preference: concise caveman style, simple beginner-friendly explanations, modular code. Avoid new elaborate artwork, unnecessary questions, or new agent tasks for routine work.
