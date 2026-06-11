# Architecture Notes

## Current MVP

The app is a Next.js App Router project with local mock data plus browser `localStorage` persistence for today's daily log. Supabase and authentication are the next planned architecture step. Apple Health and AI meal analysis are intentionally deferred.

## File Map

- `src/app`: route entry points and global styles.
- `src/components`: reusable UI building blocks.
- `src/features`: screen-level composition for home, progress, log, and profile.
- `src/lib/types.ts`: shared TypeScript data model.
- `src/lib/data`: app-facing data provider contract and current mock provider.
- `src/lib/mock-data.ts`: temporary local data for two users.
- `src/lib/supabase`: Supabase client helpers and database type draft.
- `src/lib/supabase/actions`: server actions that write to Supabase.
- `src/lib/time.ts`: home screen cutoff logic.
- `src/lib/use-daily-log.ts`: client-side daily log persistence using `localStorage`.
- `public/assets`: replaceable future images and mascot assets.
- `docs/PRODUCT_DECISIONS.md`: product rules and privacy decisions.
- `docs/ROADMAP.md`: phased implementation plan.

## Design Approach

Components are small and focused. A screen imports components and passes data into them; components avoid knowing where data came from. This keeps the app easier to change when mock data is replaced with Supabase.

Beginner tip: think of `types.ts` as the app's vocabulary. When you understand the types, the components become much easier to read.

## Temporary Persistence

`useDailyLog()` seeds from mock data, then saves changes to `localStorage` with a key based on `userId` and `date`.

`usePersistentDailyLog()` is the newer bridge hook. It uses Supabase for signed-in users who have completed onboarding, and falls back to `localStorage` when the user is signed out or setup is incomplete.

## Data Provider Boundary

Screens should import `appData` from `src/lib/data/app-data.ts`, not `mock-data.ts` directly. This keeps mock data, local storage, and future Supabase code behind one boundary.

Beginner tip: this is the "middleman" pattern. The UI asks the middleman for data, and later we can change where the middleman gets that data.

## Auth And Onboarding

`/auth/sign-in` supports magic-link and password sign-in. Successful auth points users to `/onboarding`, where the app creates:

- profile
- group
- group membership
- first competition

The main app still reads mock/local data until the Supabase data provider replaces `mockDataProvider`.

## Daily Log Sync

The Log screen now writes to Supabase for signed-in/onboarded users:

- `daily_logs` stores water, workout completion, muscle groups, meal-photo bonus, and completion state.
- `weight_entries` stores today's optional weight.
- current-day cleanup policies allow users to reset today's log.

Home, Progress, and Profile still use the mock provider until the full Supabase provider is implemented.

Update: Home, Log, Progress, and Profile now use the Supabase read model for signed-in/onboarded users. The mock provider remains as a development fallback module but is no longer used by the main routes.

## Invite Flow

`/invite` lets an onboarded user create a one-use invite code. `/join?code=...` lets the second player join the same group after sign-in. The `group_invites` table tracks invite code usage.

## Time-Based Home

`src/app/page.tsx` calls `isEveningReviewTime()` from `src/lib/time.ts`.

To change the evening cutoff, edit `EVENING_CUTOFF_HOUR` in `src/lib/time.ts`.
