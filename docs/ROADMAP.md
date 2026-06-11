# Roadmap

## Phase 1: Current Local MVP

Status: in progress.

- Next.js app shell
- Mobile-first visual direction
- Morning and evening home views
- Log, progress, and profile routes
- Mock data
- Local daily-log persistence with `localStorage`

## Phase 2: Supabase Data Foundation

Goal: replace device-only storage with synced app data.

- Add Supabase client setup.
- Add environment variable docs.
- Create database schema for:
  - profiles
  - groups
  - group_members
  - competitions
  - daily_logs
  - weight_entries
  - workouts
  - workout_muscle_groups
  - meal_logs
  - rival_actions
- Keep the app usable with mock/local data when Supabase env vars are missing. Status: done.
- Migrate current daily log shape toward the database shape. Status: started for Log screen.
- Store competition weekly weigh-in weekday based on the selected start day.

## Phase 3: Auth And Privacy

Goal: make it private and ready for real use.

- Add Supabase Auth. Status: started.
- Support email magic link and email/password sign-in. Status: started.
- Create a profile after first sign-in. Status: started through `/onboarding`.
- Let users edit display name after profile creation.
- Restrict data by user and group.
- Show sibling summary stats only.
- Add row-level security policies.

## Phase 3.5: Supabase Screen Wiring

Goal: replace mock screen data with real signed-in data.

- Log screen Supabase sync. Status: done for daily log fields.
- Home screen Supabase read model. Status: done.
- Progress screen Supabase read model. Status: done for basic weight trend/summary.
- Profile screen Supabase read model. Status: done.
- Keep local fallback for development and unauthenticated preview.

## Phase 3.6: Invite Flow

Goal: let the second player join the same group.

- Create one-use group invite code. Status: done.
- Join group by invite code. Status: done.
- Redirect invite users through sign-in and back to join page. Status: done.
- Next: improve invite management and show existing members.

## Phase 4: Competition Logic

Goal: make the game rules real.

- Calculate consistency score. Status: started.
- Calculate percentage of starting weight lost. Status: done.
- Track daily, weekly, and total winners. Status: started.
- Add bonus credit for meal-photo logging. Status: done.
- Add weekly weigh-in requirement based on the competition start weekday.
- Enforce current-day editing and restrict older logs.
- Add workout muscle group dropdown with custom entry support.

## Phase 4.5: Workout Import Research

Goal: decide whether Hevy can be integrated cleanly.

- Verify whether Hevy supports direct API access, export files, webhooks, or share links.
- Choose import method:
  - Direct API if available and allowed.
  - CSV/export import if API is not available.
  - Manual workout entry if neither option is reliable.
- Map imported workout data to the app muscle-group model.

## Phase 5: Mascot And Rival Systems

Goal: make the rivalry visible and fun.

- Add mascot selection.
- Add normal, incomplete, and completed mascot states. Status: started.
- Show rival actions in the Today hero area. Status: started.
- Add cosmetic action feed.
- Add later visual effects like paint or tomatoes after mascot art direction is final.

## Phase 6: Privacy And Hardening

Goal: make the app safe enough for real use.

- Main routes require sign-in/onboarding. Status: done.
- RLS policies are applied. Status: done for MVP.
- Profile editing. Status: started.
- Invite flow. Status: done for one-use codes.
- Remaining: test with two real accounts and refine error states.

## Phase 7: Vercel Deployment

Goal: deploy the private MVP.

- Add Vercel environment variables.
- Deploy preview. Status: blocked until Vercel project is linked or git integration is configured.
- Test on both phones.
- Promote to production after auth, Supabase, and privacy rules are verified.

## Phase 8: Polish

Goal: make it delightful enough to keep using.

- Doodle Jump inspired Today hero. Status: started.
- Placeholder mascot/platform visuals. Status: started.
- Remaining: visual QA on phone, asset pass, and small animations.
