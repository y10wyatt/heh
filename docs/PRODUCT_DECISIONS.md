# Product Decisions

## Competition Rules

- Progress uses both consistency and percentage of starting weight lost.
- Missed goals unlock cosmetic rival actions from the other player.
- Rival actions do not affect real progress, points, weight loss, or rankings.
- Weekends count the same as weekdays.

## Privacy And Access

- The app should require sign-in before real shared data is stored.
- Supported sign-in methods should include both email magic link and email/password.
- Access is private at first for two people.
- The model should allow future groups, not only one fixed pair.
- Profiles use real display names by default, with an option to edit display name later.
- Players see summary stats for each other, not full detailed logs.
- A player can edit the current day if they forgot to log earlier.
- Past-day editing should be restricted after the day ends.

## Daily Logging

- Weight is required weekly and optional daily.
- Weekly weigh-in day is chosen when the competition starts. That same weekday becomes the weekly weigh-in day moving forward.
- Default water goal is 8 cups.
- Workouts track completion plus muscle group.
- Muscle groups should support a default dropdown list and custom entries.
- Hevy workout import is a desired future integration, but direct import/API support must be verified before implementation.
- Meal photo is optional, but gives bonus consistency credit.

## Progress Tracking

- Track from starting weight toward goal weight.
- Show pounds lost during the current week.
- Exact current weight should not be shared broadly.
- Show daily, weekly, and total winners.
- Daily winner uses consistency plus optional meal-photo bonus credit.

## Rival Actions

Initial actions:

- Send nudge
- Tease
- Tiny extra challenge

Later visual actions:

- Throw tomatoes
- Paint mascot or mascot environment

Rival actions should appear directly in the Today page hero/mascot area and in an action feed.

## Mascots

- Each player chooses a mascot.
- Mascots have three states:
  - Normal
  - Incomplete goals
  - Completed goals
- Visual direction should be cute and lean: playful, mascot/game-like, but still clean enough for daily use.

## Deployment Direction

- Add Supabase next.
- Deploy to Vercel after the Supabase-backed MVP path exists.
- Use sign-in rather than only a shared password once real data is stored.
