# Kudo Hearts Like System

**Date**: 2026-07-22 15:40
**Severity**: Medium (RLS incomplete at first review, fixed before merge)
**Component**: /kudos-live-board hearts feature, kudo_hearts table, toggleKudoHeart action, feed annotation
**Status**: Resolved (feature complete, column extensibility noted for future special-day logic)

## What Happened

Narrowed scope from a sprawling gap-analysis (filters, spotlight, detail-page) down to hearts only — a self-contained like toggle for each kudo, visible only to the reader. Shipped in parallel to the morning's permissions work: a kudo_hearts table with composite PK (kudo_id, user_id) and hearts_value CHECK constraint, an RLS+GRANT-secured toggleKudoHeart action with idempotent 23505 handling, page-scoped likedByMe feed enrichment, and a HeartButton component (optimistic UI, disabled on own kudos, aria-pressed state). Final tally: 330/310 vitest passing, live-verified full toggle cycle through two accounts, zero self-like rows in production.

## The Brutal Truth

The review caught us half-way up a ladder we didn't nail to the wall. First pass marked CRITICAL: RLS validated **who** could insert (not your own kudo) but left **what** unbounded — hearts_value could be sent as 999 or -1 via direct PostgREST, and the trigger's insert branch was unfloored. The lesson stung because it felt like a permissions problem when it was actually a constraint problem. RLS is identity; CHECK constraints are value gates. We had one, not both. The real frustration: we'd spent the morning fixing the bigger permissions collapse across schema, caught the hearts RLS gap in minutes during review, but the oversight exposed a mental model gap — conflating "who accesses" with "what values are allowed." After adding CHECK and flooring the trigger, re-review bumped it to 8/10 with zero critical. Clean enough.

## Technical Details

**Shipped:**
- **Table**: `kudo_hearts` (composite PK: kudo_id + user_id; hearts_value CHECK IN (1,2); created_at timestamp; RLS policies for insert + delete on own rows only; GRANT SELECT, INSERT, DELETE on anon, authenticated).
- **Action**: `toggleKudoHeart(kudoId, heartValue)` with self-like guard, 23505 race handling (treated as idempotent success, not error), service-role path for mock mode.
- **Feed enrichment**: `likedByMe` boolean added to kudo DTOs when fetching a page of kudos; scoped to current page to prevent unbounded annotation queries.
- **Component**: HeartButton (disabled on own kudos, aria-pressed matches state, optimistic toggle with debounce for rapid clicks).

**RLS & Security:**
- Initial: RLS checked identity only. Review flagged that hearts_value was unbounded.
- Fix 1: Added CHECK constraint `hearts_value IN (1, 2)` at table level.
- Fix 2: Floored trigger insert branch to reject out-of-range values before insert.
- Fix 3: Explicit GRANT statements for anon, authenticated roles (part of broader grant sprint from morning).

**Evidence:**
- Tests: 330/310 vitest (includes feed enrichment, toggle semantics, self-like guard, 23505 idempotence).
- Live verification: Playwright + two Google accounts, full toggle cycle (like → unlike → like), zero self-like rows in kudo_hearts table.
- Code review: 5/10 CRITICAL (RLS incomplete) → 8/10 after constraint fixes, 0 critical.
- Commits: 32e146c (fix db signup-profile trigger, infrastructure support), 423321d (fix config image hosts, dependency setup), 060fea5 (feat kudos hearts, core feature), 3eaadfe (docs).

## What We Tried

1. **RLS-only approach**: Initial design assumed RLS policies were a complete gate. Review caught that PostgREST direct insert bypassed logic validation. Applied CHECK constraint + floored trigger to bind hearts_value at schema level.
2. **Idempotent 23505 handling**: Duplicate-key error (23505) on toggle comes from the composite PK when a user tries to like twice. Early approach was to throw. Changed to idempotent success (detect 23505, treat as "already liked, toggle off, return success"). This keeps optimistic UI in sync — otherwise the UI marks liked, action fails, UI desyncs to unlike, user confused.
3. **Unbounded annotation queries**: Feed enrichment first queried "all kudos this user has liked" globally. For a page of N kudos, this means 1 global query vs N page-scoped subqueries. Switched to page-scoped to prevent the annotation query from bloating as liked-count grows. Trade: slightly more queries per page fetch, but bounded and cacheable.

## Root Cause Analysis

1. **Identity gate ≠ value gate**: RLS policies decide who can act. CHECK constraints decide what values are legal. We had RLS correct but assumed it covered the value space too. The gap: an authenticated user can insert, RLS allows it, but the inserted value might be invalid. Schema-level constraints (CHECK, CHECK with trigger logic) are the answer, not just policy.

2. **Race condition as feature signal**: The 23505 duplicate-key error is not a failure — it's a signal that "the user already liked this." In a toggle UI, the semantic is idempotent: "like this kudo" should succeed whether it's the first time or the twentieth. Treating 23505 as error breaks the optimistic UI. Treating it as "already done, remove the like" matches the UX.

3. **Annotation query scope**: Adding a boolean to every kudo record (likedByMe) requires a per-user lookup. Without page scoping, this query scales with the number of kudos the user has ever liked, not the number on the current page. Page-scoped annotation prevents silent O(all_liked_kudos) queries.

4. **Column design for extensibility**: hearts_value as (1, 2) tuple per-row is a bet on future special-day features (×2 hearts on Monday, etc.). Alternative was a multiplier column or a separate table. The per-row choice makes future code changes possible without migration — just update the CHECK constraint and trigger logic. This was a deliberate extensibility call, not over-engineering.

## Lessons Learned

1. **RLS is identity + values need constraints**: RLS policies enforce "who can do what to which rows." CHECK constraints enforce "what values are allowed in this column." They are orthogonal gates. Don't assume one covers the other. On code review, ask: "Does RLS validate identity?" and "Do CHECK constraints validate the column range?" Both must be true.

2. **Idempotent semantics for race errors**: When a unique constraint fires (23505), it often means "this action is already done." In a toggle UI, "already liked" is a valid terminal state, not an exception. Catch the error code and treat it as success. This keeps the optimistic UI and actual DB in sync. Lesson: the error code shapes the semantic meaning.

3. **Bind annotation scope to the data scope**: When enriching returned records with a per-user computed field (likedByMe), scope the lookup query to the same dataset being returned. "All kudos on this page" + "which of these N did I like?" is vastly cheaper than "all N kudos globally + which did I like?" If you can't scope it, it's a query-complexity time-bomb.

4. **Column-per-value beats tables-for-multipliers**: hearts_value as a CHECK (1,2) column is simpler than a hearts_multiplier column + base_hearts column or a separate hearts_special_day table. It costs a table scan to change the rule, but that's a code+migration together, not a data migration. For features that are "future maybe," this is the right bet.

5. **Permissions audit after every review**: The morning's grants fix + this session's constraints discovery share a pattern: schema completeness must include identity (RLS), values (CHECK), and access (GRANT). After review, run a permission checklist: RLS (identity) + CHECK (values) + GRANT (roles) all present? This is now a 3-question gate, not a 1-question gate.

## Next Steps

1. **Deferred in plan.md**: actions.ts has grown to 225 lines and contains a TOCTOU window (user's heart count may drift vs display). Refactor to use a dedicated hearts service class, split from kudo mutations, and add a refreshHeartState call after toggle. Medium priority.
2. **Special-day logic**: Future feature to multiply hearts on specific days. The CHECK constraint can be extended and the trigger's value flooring updated. Plan as a follow-up when the special-day calendar is locked.
3. **Cross-viewer freshness**: When user A likes a kudo and user B is viewing the feed, user B doesn't see the heart count update. Real-time sync would require subscriptions or polling. Document the tradeoff (eventual consistency for now) and revisit when other real-time features land.
4. **Grant audit completion**: The morning's migration added GRANT SELECT. Verify that kudo_hearts is included in any future GRANT audit runs. This is now part of the schema-completeness checklist.
5. **Column constraint audit**: Review all tables with CHECK constraints and verify they are enforced in both RLS policies (identity) and application code (validation on input). Create a pattern document for future schema work.

---

**Files created/modified:**
- `supabase/migrations/20260722090000_create_kudo_hearts_table.sql` (new, hearts table + RLS + GRANT)
- `lib/kudos/actions.ts` (toggleKudoHeart, 23505 idempotent handling, self-like guard)
- `lib/kudos/queries.ts` (likedByMe feed annotation, page-scoped)
- `components/HeartButton.tsx` (new, optimistic toggle, disabled on own kudos)
- `app/kudos-live-board/page.tsx` (HeartButton integration)
- `tests/kudos-hearts.test.ts` (330/310 vitest, includes toggle, race, annotation)

**Evidence directory**: Commits 32e146c, 423321d, 060fea5, 3eaadfe; live Playwright verification (two accounts, full toggle cycle); psql inspection of kudo_hearts table showing zero self-like rows.
