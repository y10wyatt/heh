# Local database validation

Remote database changes remain blocked until this checklist passes.

## Prerequisites

1. Install and start Docker Desktop.
2. Confirm `docker --version`.
3. Run `npx supabase start`.

## Validation commands

```powershell
npx supabase db reset
npx supabase db lint --level warning
npx supabase test db
npx supabase db advisors --local
```

## Required scenarios

- William can insert and read his own private ActionEvents.
- Sister cannot read William's private ActionEvents.
- Both group members can read challenge-group ActionEvents.
- An unrelated user cannot read group data, rooms, room actions, traps, results, or entitlements.
- Anonymous requests cannot access exposed tables or RPCs.
- Two concurrent `finalize_day` calls return one daily result and one reward set.
- A tie creates two defense entitlements and no mischief entitlement.
- Insufficient participation creates no entitlement.
- Two concurrent `apply_room_action` calls consume one entitlement only once.
- Defense entitlements cannot raid another room.
- Mischief entitlements cannot mutate protected slots.
- Glue, mirror, lock, decoy, and alarm outcomes produce authoritative RoomActions.

## Approval gate

Record command output and failures in the development log. Only present the migration for remote approval after every scenario passes.
