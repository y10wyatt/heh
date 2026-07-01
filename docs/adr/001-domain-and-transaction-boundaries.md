# ADR-001: Domain and transaction boundaries

## Status

Accepted for the MVP foundation.

## Context

Sibling Showdown shares a Supabase project with Life Dashboard, but the applications must not share UI or business logic. Real-world accountability evidence and game-world room mutations have different consumers and invariants.

## Decision

- `ActionEvent` is append-only evidence for real-world activity and challenges.
- `RoomAction` records game-world room mutations and never becomes an `ActionEvent`.
- `FeedItem` is a read model that can display both streams without merging their contracts.
- Domain services contain pure rules and do not import React or Supabase.
- Repository interfaces isolate persistence adapters.
- `finalize_day` and `apply_room_action` are authoritative PostgreSQL transactions.
- Privileged implementations live in `sibling_private`; public security-invoker functions are narrow Data API gateways.
- Finalized results store applied rule IDs and versions so rule changes do not rewrite history.

## Consequences

- Life Dashboard can consume `ActionEvent` through an adapter without depending on Sibling Showdown.
- Room transactions require database integration tests, not only TypeScript unit tests.
- Some contract duplication remains until both applications prove a stable shared contract.
- UI prototypes may use in-memory repositories, but authenticated production flows must use the same application use cases with Supabase adapters.
