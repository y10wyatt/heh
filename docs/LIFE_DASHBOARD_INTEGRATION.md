# Life Dashboard integration

Life Dashboard reads `action_events` as normalized, append-only evidence through its own adapter. It should not import Sibling Showdown UI, scoring services, or room models.

## Mapping

| ActionEvent | Life Dashboard target |
|---|---|
| `id` | idempotency/source key |
| `userId`, `occurredAt`, `title`, `category` | `ActionLog` fields |
| challenge event types | optional `JournalEntry` summary |
| scored result | derive an `XPTransaction` using Life Dashboard-owned rules |

Do not copy XP or weekly totals from events. The receiving adapter decides which Life Dashboard records to create and stores the source event ID to prevent duplicates.

`RoomAction` is deliberately not an `ActionEvent`. The Challenge Feed uses a `FeedItem` read model to display both streams while their contracts remain separate.

Every event carries `sourceApp` and `schemaVersion`. Add a new schema version for breaking contract changes and keep version-aware mapping. A future shared package is appropriate only after both apps have a stable contract; until then, duplicate the small versioned type and validate at each adapter boundary.
