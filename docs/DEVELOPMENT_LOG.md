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
