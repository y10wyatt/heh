# Our Place: current status and next steps

Updated September 5, 2026. This roadmap covers the sibling-home design prototype in `artifacts/our-place-prototype`, not a claim that its features are deployed in the main app.

## Product direction

The app should feel like living under the same roof again. Affectionate sibling mischief is central; personal progress supplies action points, and shared aspirations give siblings things to look forward to.

North star: **A tiny shared home that quietly continues existing while both siblings live their separate real lives.** Evaluate features by whether they create presence, personal expression, anticipation, persistent playful interaction, or a visible shared memory. Permanent progress is the home and collection, not a competitive point ranking.

- Home: keep the approved hallway and shared sticky-note board. A slightly ajar door signals an unseen visit; no visitor announcement sentence on Home.
- Today: Finch-inspired personal goal flow with an original visual identity. Daily actions and weekly progress belong here.
- Me: the planning and customization hub. Set up long-term goals, milestones, linked to-dos, chosen quests, personal metrics, and appearance here. Today and Home prioritize action. Share selected goals for accountability rather than automatically exposing measurements.
- Future art: simple line art and reusable objects. Door decoration first, fixed room decoration slots next. Keep owner decor separate from temporary visitor effects.
- Widgets are a core relationship surface: make a sibling's visits, surprises, and notes visible outside the app. Prioritize asynchronous presence over goal statistics or an always-online indicator.
- Household growth: extend the hallway horizontally for more family members while retaining the shared board. A future neighbourhood can connect separate close circles; do not merge all friends into one household by default.

## Completed in the local prototype

- Hallway with independent door states and enterable rooms.
- Leave a duck prank or personal note, discover visits, react, and tidy up.
- Local sibling switcher for testing the two sides of a visit.
- Shared board notes, checklists, and promotion into projects with planning notes.
- Browser-local persistence; the prototype remains separate from existing application state.
- Upgraded Today: four goal categories and filters, daily progress, add/edit, once/daily repeat, complete, postpone, skip, and undo.
- Adjustable weekly targets per category, derived from dated check-offs; daily recurrence and Monday week boundaries.
- Existing personal-task migration that preserves room/board state and point balances.
- Build, runtime integrity (28 protected files), and 16 prototype tests pass. Browser interaction and touch-scroll checks completed.

## Next steps, in order

1. **Finish the Today review and prepare a real-phone web beta.** Confirm grouping, weekly action-count targets, and completion/undo. Separate the simulated phone frame/keyboard from the deployed phone experience. Keep Home's approved content hierarchy.
2. **Deliver shared accounts and sync on staging.** Reuse existing authentication, repository, and atomic-action code where appropriate. Add household membership, per-record persistence, scoped live updates, and reconnect refresh. Use an Our Place Vercel project with staging Supabase. Test two-account delivery, duplicate-safe rewards, and private data. Reconcile prototype undo with the main app's append-only scoring through an explicit reversal operation. See the local Life Dashboard audit below.
3. **Validate persistent interaction and expandable households.** Visit → leave something → discover → react → tidy or keep a memory. Start the next interaction slice with a note, pillow prank, and gift; retain the existing duck example. Add quiet preferences, a small active-prank limit, and a memory archive/display distinction. Design membership for multiple people, then extend the hallway with horizontal paging and a household-wide board. Start interaction testing with 2–6 members; this is a test range, not a permanent product limit.
4. **Test the first native widget early.** Once shared state is reliable, build a room widget showing the latest unseen surprise/note and opening the corresponding room. Validate on real devices in a mobile beta before promising direct widget actions or refresh timing. Do this before a large decoration catalog or paid shop.
5. **Build Me planning and one quest.** Long-term goal → milestone → linked Today action; one selectable boxing quest and earned gloves. Add optional private metrics (name, unit/rating, dated entries, history), then expand after review. Move sibling switching/reset into clearly separate demo controls.
6. **Personalize and validate the economy.** One canonical modular avatar, a small wardrobe, door customization, and fixed room decoration slots. Keep ownership, equipped layout, and visitor effects separate. Add a small earned-item shop before considering paid cosmetics. Use the reduced art MVP below.
7. **Expand proven surfaces.** Introduce one shared pet per household after the core loop is useful; trial cosmetic pet monetization later. Expand widgets, notifications, and shared-board links into deeper Life Dashboard projects. Mobile emphasizes capture; website supports detailed planning and notes.
8. **Explore neighbourhoods later.** Prototype visiting another household only after one household feels coherent. Multiple memberships, guest access, friendship, and zoom-out navigation remain design decisions to validate.

## Widgets: presence outside the app

User priority: widgets should help siblings feel close and interact without repeatedly opening the full app. They are part of the core experience, not merely a late statistics dashboard.

- First widget: **Your room**, showing the latest surprise or note a sibling left. Start with tap-to-open discovery; test native capabilities before adding direct reactions.
- Later candidates: **Their door** for visiting/knocking and **Our sticky note** for one shared message or plan. These are candidate designs, not completed features.
- Save visits, notes, and reactions as individual events, with stable IDs and per-recipient seen state. Define which action counts as discovery; merely refreshing a widget should not silently mark a visit seen.
- Provide a small permission-scoped widget summary: room appearance, unseen state, latest eligible note/visit, and destination link. Keep private metrics and unshared goals out of it.
- The widget reads the same authoritative household state as the app. An offline or stale widget must not imply current presence. Refresh timing and interactive controls require platform-specific validation; web Realtime alone is not a widget implementation.
- Support choosing a household/room for a widget. A primary household is a proposed default if multiple memberships are introduced.
- Acceptance: a visit from another account persists, appears after the next supported refresh, opens the correct room, and cannot expose another household's content or duplicate a reward.

## Expandable hallways and future neighbourhoods

Near-term direction:

- Swipe the hallway left/right to reach additional members' doors. Preserve each door's ajar/closed cue and customizable appearance. Make additional doors discoverable with a partial next-door preview and page position indicators.
- Offer accessible previous/next controls alongside swiping. In the existing prototype, use the provided `Carousel` when implementing the horizontal collection; preserve vertical page scrolling.
- Keep the viewer's door readily reachable; viewer-first order is the initial proposal, with stable ordering thereafter.
- Keep the shared board below the hallway and scoped to the household, independent of the currently visible doors.
- Give households and memberships separate stable IDs; remove the hardcoded two-person assumption before live multi-member use. Inviting/removing members and visit permissions belong to the household model.

Future direction to explore:

- Treat a household as a chosen close circle: siblings, relatives, close friends, or chosen family. One household is the initial experience; multiple memberships and a primary/default household are later options.
- A Neighbourhood entry point may zoom out to separate friends' houses, then open their hallways. Also provide an explicit button/list route so access does not depend on a zoom gesture.
- Friendship is not household membership and does not automatically grant board, goal, or prank access. Guest visits require an explicit access model and invitation.
- Open decisions: whether users want one or multiple households; whether their room is unique per house; guest actions; shared-home decoration ownership; and whether a neighbourhood map adds value over a simple house switcher. No map or universal-household model is committed yet.

## Quests, evolving items, and future shop

User direction: selectable quests can unlock items that evolve with continued activity. Example: attend boxing 20 times to unlock boxing gloves; further boxing upgrades the gloves. A future shop offers room/home decorations and provides a monetization route. These features are planned, not implemented.

Recommended first slice:

- Set up goals and choose quests in Me. Today surfaces their next actions and compact progress; Home shows owned/equipped items through decoration.
- Distinguish a flexible personal goal from a catalog quest with a fixed activity requirement and reward. Both can refer to the same completed action.
- Use explicit activity IDs such as `boxing_session`. Do not count all Body-category actions, task titles, or checkbox fragments as boxing visits.
- Give each logged activity a stable completion ID. One boxing session can advance daily, weekly, and quest progress without duplicating the activity or its point reward.
- Suggested cosmetic thresholds: gloves at 20 sessions, upgraded appearance at 50 and 100 total sessions. Only the 20-session unlock is user-specified; later thresholds need playtesting. Progress is cumulative and does not decay after a missed week.
- Keep quest definitions, enrolled progress, reward grants, owned inventory, and equipped decorations distinct. A future shop should grant into the same inventory as earned rewards.
- Retried events, quest re-enrollment, edits, and undo/re-complete must not duplicate unique rewards. Define correction/reversal behavior before shared-backend integration.

Recommended economy to validate: action points fund sibling mischief; earned decoration tokens buy ordinary cosmetics; optional real-money purchases offer clearly priced cosmetic items or room themes. Earned quest tiers remain tied to activity. Avoid a third premium currency in the first version. Pricing, payment implementation, catalog size, and purchase rules are undecided; no checkout is authorized by this planning discussion.

Reward rules: an activity grants its base reward once while advancing multiple linked goals. Milestone bonuses must be explicit, limited, and granted once. The proposed +20/+15/+5/+30 payouts are examples, not final balancing. Include learning, creativity, everyday life, memories, and shared activities; fitness does not define the whole economy. Temporary challenges and friendly races may exist, but the enduring reward is expression, collection, humor, and shared history. Paid cosmetics must not purchase stronger harassment or bypass activity-earned achievement tiers.

Implementation order: Me goals and linked actions → one boxing quest and earned gloves → collection/equip slots → small shop using earned tokens → paid cosmetic catalog after the core loop has been tested.

## Persistent mischief and keepsake memories

- Durable pranks follow **placed → discovered → reacted to → tidied or kept as a memory**. They persist until resolved, not necessarily forever. Quick reactions such as pokes can remain transient; a pillow toss can leave a pillow behind.
- Forced hats are temporary appearance overlays; furniture movement preserves the original slot; snack stealing is reversible play. No permanent removal of purchased inventory.
- Add a small configurable active-prank limit, sound opt-in, cooldowns, and quiet preferences. Pranks must not bury notes or block controls. Exact limits remain to be tested.
- Separate owned inventory, equipped room layout, and visitor effects. Tidying only clears the relevant effect. Shared-room edit permissions and ownership of gifts need explicit rules before implementation.
- Separate the **memory record** (event/date/participants/photo/note), its **displayable keepsake**, and its **placement**. Putting an object in storage never deletes its memory. Add an archive so a full room does not force deletion.
- Users choose which memories/photos become shared keepsakes. Private journal entries and photos are not automatically displayed to the household.
- Initial keepsakes can be a saved funny note, a challenge trophy, or one event souvenir. Polaroids, tickets, seasonal objects, and travel items expand the catalog later.

## Modular identity, rooms, and art MVP

Reference mix is directional, not a copying specification: Finch for simple modular customization and daily presence; LINE Play for rooms that feel inhabited; Animal Crossing for objects accumulating relationship history; Hamtaro for expressive, cozy personality. Lightweight relationship utilities can include meetup countdowns, dates, shared plans, and bucket lists; romantic-maintenance mechanics are outside the sibling core.

- Use one canonical current avatar appearance per user, edited in Me and rendered across profile, rooms, interactions, and future spaces. Keep pose/expression/temporary prank props separate from saved appearance.
- Live avatar references use current appearance; captured memory scenes may preserve appearance at the event date. Do not unintentionally rewrite old souvenir images when an outfit changes.
- Decide one initial avatar body type before asset production. The existing hamster prototype and proposed human clothing layers do not yet settle that choice.
- Each wearable is a reusable transparent asset with consistent canvas dimensions, base proportions, anchors, and compatibility/layer rules. Support recoloring where practical; hats/hairstyles and one-piece outfits require visibility rules, not just a fixed stack.
- Rooms are decoratable stages composed of wall, floor, window, rug, furniture, decor, small objects, and avatars. Use predefined slots and predictable asset bounds. Avoid baked-in lighting that prevents reuse. Free movement, collision, pathfinding, rotation, and geometry editing are not MVP requirements.
- Art direction: flat shapes, chunky outlines, limited warm palette, minimal texture, simple silhouettes, and small animations. SVG or sprites are suitable asset formats; avoid global pixelation that makes text or avatars blurry. Existing detailed illustration remains prototype-only; do not generate a large replacement catalog now.
- Reduced first art slice: **one body, three face presets, three outfits, three accessories, two wallpaper options, two floor options, four furnishings, three prank objects, and one earned keepsake**. Validate emotional attachment before producing the larger proposed wardrobe.
- Me retains My plans, My collection, and My tracking alongside the avatar preview; detailed clothing categories belong inside Customize.
- The app represents one shared home with personal bedrooms. Keep the approved hallway landing for now. A communal room and its entry point are a later layout comparison, not an automatic replacement. Cafés, parks, airports, beaches, and event spaces are later reusable stages for the same avatar.

Validation loop: **choose outfit → complete a real-life action → earn something → leave a pillow/note → sibling discovers it → keep one moment as a keepsake**. Measure whether people return to see what changed and feel the other person was present; coin accumulation alone is not success.

## Shared pet and later monetization

User direction: one jointly owned, ridiculous creature per household, not independent pets per person. It is a persistent resident and can carry gifts or deliver pranks. Pet type/name, household editing rights, and the timing of its introduction remain open.

- Candidate actions: feed for fun, dress, rename, decorate its bed, carry a gift, or visit a sibling's room. Apply the same permission, quiet, and prank-lifecycle rules as other interactions.
- Welcome users back after breaks. No hunger/neglect penalties, guilt loops, or payments to prevent the pet becoming distressed.
- The pet is an explicit future monetization surface. Candidate purchases: outfits, cosmetic appearances, accessories, beds/habitats, toys, and playful cosmetic animations. Examples are proposals; prices, bundles, and ownership rules are not finalized.
- Keep an enjoyable shared pet and basic interactions available without payment. Purchases add expression, not stronger pranks, quest progress, or maintenance obligations. Cosmetic appearances should customize the shared creature rather than silently introduce separate per-person pets.
- Resolve purchaser ownership versus household use, gifted-item consent, member departure, and purchase restoration before checkout. Earned and purchased items should use the same inventory/equipment contracts with distinct acquisition records.
- Sequence: validate shared home → introduce the basic shared pet → observe use → test earned pet cosmetics → consider clearly priced paid cosmetics. No pet, pet catalog, or payments are implemented now.

## Boundaries and open decisions

### Cross-device accounts and live sync requirement

#### Life Dashboard local audit — September 5, 2026

User supplied the existing project at `C:/Users/William/Desktop/LIFE DASHBOARD`. Read-only inspection found:

- React 19 / Vite 7, with Supabase JS installed.
- Local `.vercel/project.json` links to Vercel project `lifedashboard`. This confirms a local project link, not the current deployment's health or environment values.
- Supabase client reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; variable names are present in `.env.local`. No secret values were copied or recorded.
- Auth helpers support email OTP/magic-link and password sign-in/signup, with redirects to the app origin.
- Cloud persistence uses `dashboard_snapshots`: one private JSON dashboard snapshot per user, saved with a whole-record upsert. This is an existing Life Dashboard mechanism, not the recommended shared-household data model.
- Separate code exists for reminders and push subscriptions. Reuse only after checking ownership and application-specific behavior.
- `docs/STAGING.md` explicitly calls for a separate Supabase staging project and a separate Vercel project or staging-configured preview. Follow that testing separation; shared production identity remains an eventual option.

Adjusted beta setup: create a distinct Our Place Vercel project, use staging Supabase for two test accounts, and store Our Place household/goal/action data separately from Life Dashboard snapshots. Reuse auth patterns, but implement per-record changes, authoritative rewards, scoped Realtime, and reconnect reads. Inspect remote schema and configuration before any deployment or database changes. The Life Dashboard folder was not modified by this audit.

The user requires the same account's state to sync between phone and web, and household changes to appear for siblings. Recommend reusing Life Dashboard's Supabase project if both remain parts of the same product/account ecosystem. The root README already describes this shared-project intent, and root code contains Supabase Auth and repository adapters. This is not verification of remote deployment: local docs still say the proposed schema has not been applied remotely, and the interactive prototype remains browser-local.

- Reuse identity where appropriate; isolate Our Place's app-specific tables and permissions. Shared project storage must not automatically share private measurements or every Life Dashboard project with household members.
- Database persistence supplies the latest state on opening/resuming the app. Realtime subscriptions notify open clients about permitted changes; reconnect/refocus must re-fetch to recover missed events.
- Route completions, rewards, quest unlocks, and pranks through authoritative idempotent operations. Stable event IDs prevent duplicate rewards from retries or two devices.
- Define conflict handling for simultaneous note edits. Use version checks rather than overwriting an entire saved household snapshot.
- First beta can require connectivity for writes and clearly show saving/saved/error. Offline write queues and conflict reconciliation need an explicit later implementation; Realtime alone does not provide offline sync.
- Mobile and website use the same account, but sign-in sessions on different devices/domains require their own session handling.
- Before implementation against the shared remote project, inspect its actual schema, existing policies, auth redirects, and project ownership. Develop/test migrations locally first. No remote changes have been made for this requirement.

- No new remote database operations, deployment, or real sibling notifications were performed for this prototype work.
- Me planning/metrics, quests, inventory/shop, modular avatars/rooms, expanded prank lifecycle, keepsake archive, shared pet, customization, guestbook, quiet mode, cross-device delivery, widgets, expandable hallways, and neighbourhoods are not implemented here.
- Weekly progress currently measures completed actions per category. Quantity-based goals such as distance/minutes and richer schedules are later refinements.
- Completed-goal undo reverses one unspent point. If the balance is zero it is disabled; shared-app reward reversal needs a deliberate design.
- Old tasks lacked timestamps; migration assigns existing completions to the migration day, without granting points again.
- The root app already has separate backend/application work. Preserve it and integrate deliberately; do not replace it with this standalone prototype.

## Beginner code map

`Prototype.tsx` draws the screens. `house-model.ts` decides how actions change data. `house-store.tsx` saves that data locally. Keeping these responsibilities separate makes the behavior easier to test and the future storage connection easier to replace.
