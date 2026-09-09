# Sibling Showdown

For the current Our Place integration and restart instructions, read [Our Place handoff](docs/OUR_PLACE_HANDOFF.md). Product direction is tracked in the [roadmap](docs/OUR_PLACE_ROADMAP.md); implementation history is in the [development log](docs/DEVELOPMENT_LOG.md).

Mobile-first React/Vite MVP for two-person accountability and playful room interactions. It shares a Supabase project with Life Dashboard while keeping its own tables and business logic.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Add the shared project URL and **publishable** key. Never place a `service_role` key in a Vite variable.
3. Run `npm install`, `npm run dev`, `npm test`, and `npm run build`.

Without environment variables, the app runs with isolated data from `src/dev/seed.ts`.

The current primary routes are Home (`/`), Today (`/today`), Me (`/me`), and personal rooms (`/house/rooms/:roomId`). Shared Calendar is planned as a Home subpage after account/household sync; Google Calendar is not connected yet.

When Supabase variables are present, the app requires a personal Supabase Auth account. People can create an email/password account, sign in, or request a magic link. It discovers the signed-in user's challenge group, loads events and active rules through RLS-protected repositories, and records Quick Log actions as that authenticated user.

For local development, the client accepts the current `VITE_SUPABASE_PUBLISHABLE_KEY` and the Life Dashboard's legacy `VITE_SUPABASE_ANON_KEY` name. The deployed Vite build also accepts the existing Vercel project's `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` names. These are browser-safe client keys; a secret or `service_role` key must never be used here.

Using the same Supabase project gives Life Dashboard and Our Place the same account identity and session provider. Their application data stays in separate tables and repository boundaries. A newly confirmed account still needs household membership before it can load shared activity; self-service household creation and invitations are the next account milestone.

## Architecture

- `src/domain`: framework-free contracts, repository ports, scoring and room rules.
- `src/infrastructure`: replaceable in-memory and Supabase adapters.
- `src/features`: feature-owned application UI and screen composition.
- `src/config/ui-content.ts`: editable labels, descriptions, options, and navigation.
- `src/config/visual-assets.ts`: legacy screen artwork mapping. The new Our Place artwork mapping is kept with its feature in `src/features/our-place/OurPlaceComponents.tsx`.
- `src/dev`: development-only data; production components contain no embedded mock records.
- `supabase/migrations`: a local schema/RLS proposal. It has **not** been applied remotely.

Important beginner concept: dependencies point inward. React and Supabase know about domain contracts, but the scoring and room rules know nothing about React or Supabase. That makes the important rules fast to test and safe to reuse.

To change copy, edit `src/config/ui-content.ts`. To replace artwork, add the file under `public/assets` and update only its `src` in `src/config/visual-assets.ts`.

## Today and Quick Log

Today starts with an empty task list. Add a task, optionally star it, then complete it once. Task drafts and stars survive navigation and reload on the same browser; they are scoped to the account, group, and demo/connected mode. Drafts do **not** sync across devices yet, and clearing browser storage removes them. Completion evidence remains authoritative in `action_events` when connected.

`src/features/capture/task-service.ts` owns the completion flow: save the event payload locally, append through the existing repository, then mark the task complete. The task UUID is also its completion UUID, so retrying a failed or uncertain response cannot create a second event. Completed tasks cannot be unchecked; corrections need a separate evidence strategy. Task badges use active PointRules rather than a hardcoded reward. The Today scoreboard is explicitly labeled “Logged points” (all loaded events), not a daily or weekly result.

`src/features/capture/pending-log.ts` retains one Quick Log retry payload, including its original timestamp and UUID. Saving locks the form; after success, “Log another action” explicitly starts a new capture. This is a manual retry draft, not background offline sync. Demo event writes persist locally through the isolated `src/dev/persistent-events.ts` adapter.

Run `npm test` for retry, persistence, scoring, and domain checks. With a **demo-mode** dev server at port 5174 and the existing global Playwright installation, run `node scripts/test-capture-ui.mjs` to verify the mobile capture flow in an isolated browser context. Screenshots go to `artifacts/ui-task-reliability`. `CAPTURE_TEST_URL` and `PLAYWRIGHT_MODULE` can override the URL and Playwright module location.

Historical score previews use current active rules. A finalized day stores the exact rule IDs and versions used, so later rule edits do not rewrite history.

## MVP transaction boundary

Clients append idempotent `ActionEvent` evidence using a client-generated UUID. They must call `finalize_day` for daily results/rewards and `apply_room_action` for a raid. They must never split either operation into several client writes.

After starting local Supabase, run `npx supabase test db` and `npm run test:db:concurrency`. The concurrency harness uses temporary local fixtures and cleans them up.

The Results screen calls `finalize_day` once through `DailyResultRepository`. Raid Mode calls `apply_room_action` once through `RoomActionRepository`. React never coordinates the individual writes inside either transaction.

The migration is intentionally a review proposal. Before remote application, test both transactional functions in a local Supabase instance—including concurrent calls and RLS denial cases—and run database/security advisors.
