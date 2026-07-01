# Sibling Showdown

Mobile-first React/Vite MVP for two-person accountability and playful room interactions. It shares a Supabase project with Life Dashboard while keeping its own tables and business logic.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Add the shared project URL and **publishable** key. Never place a `service_role` key in a Vite variable.
3. Run `npm install`, `npm run dev`, `npm test`, and `npm run build`.

Without environment variables, the app runs with isolated data from `src/dev/seed.ts`.

## Architecture

- `src/domain`: framework-free contracts, repository ports, scoring and room rules.
- `src/infrastructure`: replaceable in-memory and Supabase adapters.
- `src/features`: feature-owned application UI and screen composition.
- `src/config/ui-content.ts`: editable labels, descriptions, options, and navigation.
- `src/config/visual-assets.ts`: the single replacement point for mascots, avatars, room art, and decorative imagery.
- `src/dev`: development-only data; production components contain no embedded mock records.
- `supabase/migrations`: a local schema/RLS proposal. It has **not** been applied remotely.

Important beginner concept: dependencies point inward. React and Supabase know about domain contracts, but the scoring and room rules know nothing about React or Supabase. That makes the important rules fast to test and safe to reuse.

To change copy, edit `src/config/ui-content.ts`. To replace artwork, add the file under `public/assets` and update only its `src` in `src/config/visual-assets.ts`.

Historical score previews use current active rules. A finalized day stores the exact rule IDs and versions used, so later rule edits do not rewrite history.

## MVP transaction boundary

Clients append idempotent `ActionEvent` evidence using a client-generated UUID. They must call `finalize_day` for daily results/rewards and `apply_room_action` for a raid. They must never split either operation into several client writes.

The migration is intentionally a review proposal. Before remote application, test both transactional functions in a local Supabase instance—including concurrent calls and RLS denial cases—and run database/security advisors.
