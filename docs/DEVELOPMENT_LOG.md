# Development Log

## 2026-06-11

- Added `profiles.weight_unit` with allowed values `lb` and `kg`.
- Added onboarding/profile UI controls for weight units and replaced hard-coded `lbs` labels with the active profile unit.
- Fixed onboarding group creation by generating the group id in the server action and inserting without an immediate `.select()`. This avoids the RLS timing issue where a brand-new group is not selectable until its owner membership exists.
- Verified with `npm run build`, `npm run lint`, and a Supabase schema check.
- Added a Home countdown card showing days left until the competition end date.
- Removed the top mascot speech banner from Home in favor of the countdown and existing mascot hero.
- Changed the Home workout card to link to the full Log screen instead of acting as a simple done toggle.
- Changed `DailyLog.completed` into a manual Today Quest toggle.
- Added private Supabase Storage-backed meal photo uploads with signed preview URLs.
- Merged Progress into Profile: progress stats now lead the Profile screen, while profile setup/edit controls live behind a Settings disclosure.
- Removed the separate Progress tab from bottom navigation and redirected `/progress` to `/profile`.

## 2026-06-09

- Created initial Next.js, TypeScript, and Tailwind app structure.
- Added mock data for William and sibling.
- Added MVP data types for users, daily logs, competitions, and rival actions.
- Built reusable UI components:
  - AppShell
  - BottomNav
  - MascotBubble
  - StatCard
  - ProgressRaceCard
  - HydrationTracker
  - MealPhotoCard
  - WorkoutGoalCard
  - DailyRecapCard
  - RivalActionCard
- Added Morning Home and Evening Review Home.
- Added simple Progress, Log, and Profile screens.
- Added `/public/assets` as the future home for replaceable visual assets.
- Added `localStorage` persistence for today's daily log.
- Replaced demo Log screen buttons with real inputs for weight, water, meal photo placeholder, and workout state.
- Connected Morning Home cards to the same persisted daily log.
- Captured product rules, privacy decisions, mascot direction, and deployment roadmap in docs.
- Expanded domain types for groups, editable display names, workout muscle groups, meal-photo bonus, and cosmetic rival actions.
- Added app data provider boundary so screens no longer import mock data directly.
- Added Supabase client helpers, environment template, and schema draft.
- Added Supabase migration with schema, indexes, and MVP row-level security policies.
- Added sign-in page supporting magic link and email/password flows.
- Added `.env.local` for the `Weight Loss Competition` Supabase project.
- Applied `initial_competition_schema` migration to Supabase project `raidfgiukctxxmahnuzs`.
- Added Next proxy session refresh for Supabase auth cookies.
- Added `/onboarding` flow to create the first profile, group, group membership, and competition after sign-in.
- Added `usePersistentDailyLog()` to sync the Log screen with Supabase for signed-in/onboarded users and localStorage otherwise.
- Added muscle-group dropdown and custom workout group entry to the Log screen.
- Applied `allow_current_day_log_cleanup` migration for current-day reset/delete policies.
- Wired Home, Log, Progress, and Profile route data to the Supabase read model.
- Protected main app routes behind sign-in/onboarding.
- Added `group_invites` migration and invite/join pages for sister onboarding.
- Added reusable scoring helpers for percent lost, consistency score, and winner labels.
- Added Supabase-backed rival action creation for nudge, tease, and tiny challenge.
- Added profile edit form for display name, mascot, starting weight, and goal weight.
- Added Doodle Jump inspired Today hero/status card with placeholder mascot platform visuals.
- Confirmed Vercel connector cannot deploy this unlinked workspace directly; deployment requires CLI link or git integration.
- Added sign-out action.
- Added group member display and waiting-for-sister state.
- Added weekly weigh-in messaging on the Log screen.
- Added empty state for Progress when no weekly weigh-ins exist.
- Corrected weekly trend bars to chart pounds lost rather than raw weight.

## Deferred

- Supabase persistence
- Authentication and row-level security
- Apple Health integration
- AI meal analysis
- Complex animations
