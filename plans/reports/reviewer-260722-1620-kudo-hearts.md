# Review: kudo-hearts (like/hearts on ALL KUDOS feed) — 2026-07-22

Scope: uncommitted delta on `feat.some-page` per plan `plans/260722-1605-kudo-hearts-like/`. Excluded per instruction: app/login/*, next.config.ts, package*.json, pnpm-lock.yaml, docs/journals/*, `20260722090000_create_profile_on_signup.sql`.

Files reviewed: `supabase/migrations/20260722100000_kudo_hearts.sql`, `app/kudos-live-board/actions.ts`, `app/kudos-live-board/actions.test.ts`, `lib/kudos/kudos-feed-queries.ts`, `lib/kudos/kudo-feed-mapper.ts`, `lib/kudos/kudo-feed-mapper.test.ts`, `lib/kudos/kudos-types.ts`, `components/kudos-live-board/heart-button.tsx`, `components/kudos-live-board/kudo-post-card.tsx`, `messages/en.json`, `messages/vi.json`.

Verified live against the running Supabase container (psql), plus `tsc --noEmit`, `eslint`, `vitest run` on the touched test files.

## Critical

**1. `hearts_value` unbounded at the DB trust boundary — direct REST bypass can corrupt/inflate/deflate any kudo's public hearts_count.**
`supabase/migrations/20260722100000_kudo_hearts.sql:8-14` (column), `:27-32` (insert policy), `:54-56` (trigger INSERT branch).

The server action always inserts `hearts_value: 1` (`actions.ts:196`), but that's only the *app-layer* path. `kudo_hearts` is `GRANT INSERT ... TO authenticated` and the RLS `WITH CHECK` only validates `user_id = auth.uid()` and "not your own kudo" — it never constrains `hearts_value`. There's also no `CHECK` constraint on the column. Any authenticated user can call Supabase's auto-generated PostgREST endpoint directly (bypassing the Next.js action entirely) with e.g. `{"kudo_id": "<any-kudo-not-theirs>", "user_id": "<their-own-id>", "hearts_value": 999999}` — RLS passes it, and the trigger's INSERT branch does `hearts_count + NEW.hearts_value` with **no clamp**. Worse: a negative `hearts_value` (e.g. `-999999`) drives `hearts_count` deeply negative *on insert* — the `greatest(hearts_count - OLD.hearts_value, 0)` floor only exists on the DELETE branch (line 58), not INSERT (line 55). This directly answers the review-scope question "what happens on hearts_count going negative" — on the insert path, nothing stops it.

Verified via psql: the INSERT policy's `check_expr` is exactly `(user_id = auth.uid()) AND (auth.uid() <> sender_id-subquery)` — confirmed no value bound exists.

Fix: constrain `hearts_value` at the DB layer, e.g. `check (hearts_value between 1 and 2)` (clarifications.md says "+1 only this run," schema anticipates a future ×2 special day) either as a column CHECK or folded into the RLS `WITH CHECK`, **and** clamp the INSERT branch: `greatest(hearts_count + NEW.hearts_value, 0)` for defense in depth even after the CHECK lands.

## Major

**2. Check-then-insert race — duplicate-key (23505) not handled, causes UI/DB desync.**
`app/kudos-live-board/actions.ts:170-202`. The existing-like lookup and the insert are two separate round trips, not atomic. Two concurrent toggle calls for the same user (multi-tab, rapid retry, or a click landing just inside the `useTransition` pending-commit window — see Minor #5) can both read `existing = null`, then both attempt insert; the PK `(kudo_id, user_id)` correctly rejects the second with a unique-violation, but the code treats *any* insert error identically:
```
if (insertError) { ... return { ok: false, error: "toggle_failed" }; }
```
The client (`heart-button.tsx:48-50`) reverts its optimistic state on any non-ok result — so the losing request's UI shows "not liked" while the DB in fact has the like row (from the winning request) and `hearts_count` already incremented. It self-heals on the next click (since `existing` will then be found → delete/unlike path), but until then the UI lies about the true state. No test exercises this path (`actions.test.ts:556-566` only asserts a generic insert error → generic failure, not a 23505 specifically).

Suggest: on insert error, check `error.code === '23505'` and treat as "already liked" (re-read `hearts_count`, return `{ok:true, liked:true, ...}`) instead of failing; longer-term, collapse the read+write into one round trip (upsert or a `toggle_kudo_heart` RPC) to remove the TOCTOU window entirely.

**3. `likedByMe` query unbounded, not scoped to the fetched feed page.**
`lib/kudos/kudos-feed-queries.ts:59-70`. The comment says this is "cheaper than a per-row exists() check" (true, it avoids N+1), but the query itself has no bound: `.eq("user_id", uid)` pulls back *every* kudo the current user has ever liked, not just ones among the 100 rows just fetched (`FEED_LIMIT = 100`). For a long-tenured user with a large like history this grows without bound on every single page load, even though only membership within the current 100-row page is ever consulted. Add `.in("kudo_id", data.map((r) => r.id))` to bound it to the current page — keeps the "one extra query" shape but caps its size to match the feed limit.

## Minor

**4. `actions.ts` is 215 lines, over the repo's 200-line file-size convention.**
Content is cohesive (two independently-tested server actions plus shared helpers, all genuinely related to kudo mutation), so not a correctness issue — acceptable as logged debt. Suggest extracting `toggleKudoHeart` (and the `getWriteClient` helper it shares with `createKudo`) into its own module next time this file is touched, e.g. `app/kudos-live-board/actions/toggle-kudo-heart.ts`.

**5. `useTransition`'s `pending` guard is a UI nicety, not a real lock.**
`components/kudos-live-board/heart-button.tsx:29-31`. `isDisabled = disabled || pending` only takes effect once React commits the `pending=true` render; there's a narrow window between the first click firing `startTransition` and that commit landing where a second rapid click could still slip through client-side. In practice the real backstop is server-side (PK + RLS), which is exactly the path with the gap described in Major #2 — so this guard alone doesn't fully close the race. Not asking for a fix here beyond #2, just flagging it isn't the safety net its placement implies.

## Nit

**6. `HeartErrorCode` has no distinct code for an RLS-level self-like rejection.**
`lib/kudos/kudos-types.ts:87`. In real (non-mock-auth) production, if the app-layer `isOwnKudo`/self-like check were ever bypassed or stale and RLS caught it instead, the resulting Postgres error would surface as generic `toggle_failed` rather than `self_like`. Low impact since the app-layer check runs first and always catches it before the insert is attempted; purely a completeness note.

## Positive Observations

- **Anonymization invariant holds — no regression.** `KudoPostData` (`components/kudos-live-board/kudo-posts-data.ts`) has no `senderId` field, and `toKudoFeedCards` (`lib/kudos/kudo-feed-mapper.ts:29-63`) never reads `item.sender` when `item.isAnonymous`. Explicitly tested (`kudo-feed-mapper.test.ts:73-84`, asserts `senderName` is never `SENDER.displayName`). This is exactly the risk flagged in prior review memory (RLS being row-level lets `sender_id` leak via direct PostgREST query) — confirmed the *app-layer* mapper used for the client payload does not reintroduce it. (The underlying RLS-exposes-sender_id-via-direct-query issue itself is pre-existing/out of scope for this migration, already logged separately.)
- Self-like is guarded in both layers exactly per `clarifications.md`: app-layer check in `actions.ts:166-168` before RLS is even reached, and RLS `WITH CHECK` as defense-in-depth for the real-auth path.
- `hearts_count` floor of 0 on unlike is correct (`greatest(hearts_count - OLD.hearts_value, 0)`).
- Trigger is `SECURITY DEFINER`, owned by `postgres`; verified via psql `postgres` has `rolbypassrls = true` — so the sync correctly bypasses the fact that `kudos` has **no UPDATE RLS policy at all** (confirmed via `pg_policy` query: only `readable by all` SELECT and `insert by sender` INSERT policies exist on `kudos`). Without SECURITY DEFINER + bypassrls owner this trigger would silently no-op every update.
- `GRANT insert, delete on public.kudo_hearts to authenticated` — correctly scoped, no grant to `anon` (verified via `information_schema.role_table_grants`).
- i18n parity: `likeKudo` / `unlikeKudo` / `ownKudoHeartDisabled` present in both `en.json` and `vi.json`, no gap.
- Colors match spec and reuse existing design tokens: `COLOR_UNLIKED = #999999`, `COLOR_LIKED = #D4271D` (same red already used for hashtag text in the same card).
- Auth redirect pattern in `toggleKudoHeart` mirrors `createKudo` exactly — consistent codebase convention, not a one-off.
- `tsc --noEmit` clean, `eslint` clean on every reviewed file, `vitest run` 45/45 passing on the two changed test files.

## Verification performed

- `npx tsc --noEmit` — clean.
- `npx eslint <changed files>` — clean.
- `npx vitest run app/kudos-live-board/actions.test.ts lib/kudos/kudo-feed-mapper.test.ts` — 45/45 passed.
- `psql` against `supabase_db_mock-aidd-kudo-app`: dumped `kudo_hearts` schema/policies/grants, confirmed `postgres` (trigger owner) has `rolbypassrls=true`, confirmed `kudos` has no UPDATE policy, confirmed INSERT policy `check_expr` has no `hearts_value` bound.
- Did not re-verify live browser behavior — per task, toggle-cycle/trigger-sync/no-self-like facts taken as already live-verified.

## Metrics

- Files: 11 reviewed (migration + 4 lib/action files + 2 components + 2 test files + 2 message files)
- Lint issues: 0
- tsc errors: 0
- Test results: 45/45 (scoped run); 321/321 reported by task for full suite (not independently re-run)
- `actions.ts`: 215 lines (>200 convention, logged as debt per Minor #4)

## Score: 5/10

Driven by the Critical finding (#1) — a real trust-boundary gap reachable by any authenticated user via direct REST, not just a theoretical concern, since RLS is explicitly the production-path guard per this repo's own design (clarifications.md: "enforced in RLS insert policy too"). The two Majors (#2, #3) are real but lower blast-radius (self-healing desync; a scaling concern, not a live outage). Everything else — anonymization, self-like, grants, i18n, trigger ownership/RLS-bypass correctness, hearts_count floor on delete — is solid and matches the plan/clarifications exactly.

**Status: DONE_WITH_CONCERNS**

## Unresolved Questions

- Should the `hearts_value` CHECK be `= 1` (strict, matches "this run" scope) or `between 1 and 2` (matches the stated future ×2 special-day intent)? Recommend the latter since the column/comment already exist to support it, but confirm before writing the migration fix.
- Is direct PostgREST/REST access to `kudo_hearts` actually reachable in the current deployment (vs. e.g. network-level restriction to only the Next.js server), or is this purely a future-production concern given the mock-auth phase? Given the RLS policy is explicitly written to guard the real-auth path per clarifications, treating it as live-reachable now.

---

## Re-review — 2026-07-22 16:35 (focused: fix verification only)

Scope: verify the 3 blocking findings are genuinely closed and check for regressions. Minors/nits were deliberately not revisited (logged debt, per coordinator).

### CRITICAL-1 — hearts_value unbounded → **CLOSED**

`supabase/migrations/20260722100000_kudo_hearts.sql:16-29` adds `kudo_hearts_value_check check (hearts_value in (1, 2))` via an idempotent `do $$ ... if not exists ... $$` block (safe to re-run against an already-migrated local DB). Both trigger branches (`:69-77`) now use `greatest(..., 0)`, closing the "insert branch had no floor" gap specifically.

Verified live, independent of RLS (ran as `postgres`, which has `rolbypassrls=true`, so this exercises the CHECK constraint alone, not the app or RLS layer):
- `insert ... hearts_value = -5` → `ERROR: new row for relation "kudo_hearts" violates check constraint "kudo_hearts_value_check"` — rejected.
- `insert ... hearts_value = 999999` → same rejection.
- `insert ... hearts_value = 2` → accepted, and `kudos.hearts_count` incremented by exactly 2 via the trigger — confirms the reserved "special day ×2" value still works and the floor logic didn't regress normal accounting.

No regression: the RLS insert policy is unchanged (still identity/self-like only), which is fine now that the CHECK constraint is the value gate — defense-in-depth is correctly layered (CHECK blocks the value at the table level regardless of caller; RLS blocks who can act). This closes the finding at the actual trust boundary (the DB), not just the app layer.

### MAJOR-2 — check-then-insert race / 23505 not handled → **CLOSED**

`app/kudos-live-board/actions.ts:194-211` now branches on `insertError.code === "23505"` → treats it as already-liked (`liked = true`, falls through to the existing hearts_count re-read and returns `ok:true`), and preserves the old generic-failure behavior for every other error code. Confirmed the two new tests exist and are correctly targeted (`actions.test.ts:568-598`): one asserts `{code:"23505"}` → `{ok:true, liked:true, heartsCount:1001}`, the other asserts a different code (`23503`, FK violation) still → `{ok:false, error:"toggle_failed"}` — so the fix is scoped to the specific race case, not a blanket "insert errors are fine now" regression. Both tests pass (part of the 330/330 run).

No regression: the delete/unlike path and the non-existing-row insert path are untouched. The fix only changes behavior on the one specific error code that previously caused optimistic-UI/DB desync.

Residual (not a regression, just noting the fix's honest scope): this closes the *symptom* the finding described (spurious `toggle_failed` on a race) via error-code detection after the fact, not by removing the TOCTOU window itself (still two round trips: read-then-write). That's an acceptable, pragmatic fix for the finding as scoped — flagging only so it's not mistaken for "the race no longer exists," just "the race no longer misleads the UI."

### MAJOR-3 — unbounded likedByMe query → **CLOSED**

`lib/kudos/kudos-feed-queries.ts:61-76` now guards with `uid && data.length > 0` and adds `.in("kudo_id", data.map((row) => row.id))`, bounding the query to the current page's ids instead of the user's entire like history. New file `lib/kudos/kudos-feed-queries.test.ts` (7 `it(...)` blocks, not 8 as stated in the handoff — trivial miscount, not a concern) directly covers this: asserts `heartsEq` called with `("user_id", "viewer-1")` **and** `inFn` called with `("kudo_id", ["kudo-1", "kudo-2"])`, plus separate tests that the `kudo_hearts` query is skipped entirely when there's no user or the feed page is empty (both genuinely new edge cases the original code didn't guard — `uid` alone was checked before, not `data.length`).

No regression: `likedByMe`/`isOwnKudo` derivation logic on the returned rows is untouched; only the query's `WHERE` scope narrowed, which is strictly a subset relationship (a page's liked-ids among all-time liked-ids), so no set of previously-correct results can now be wrong.

### New findings from this pass

None. No new issues introduced by any of the three fixes.

### Verification performed (this pass)

- `psql` live against `supabase_db_mock-aidd-kudo-app`: confirmed constraint text (`hearts_value = ANY (ARRAY[1, 2])`), and ran real inserts (-5, 999999, 2) in rolled-back transactions to prove the constraint actually rejects/accepts at the DB layer.
- `npx tsc --noEmit` — clean.
- `npx eslint` on all touched files — clean (only a pre-existing "no config for .sql" advisory warning, not an error, not new).
- `npx vitest run` (full suite) — 330/330 passed across 20 files, confirming the coordinator's reported numbers.
- Read the new/changed test code directly (not just trusting counts) to confirm each test targets the specific fix (not a shallow "doesn't throw" assertion).

### Updated Score: 8/10

All three blocking findings verified genuinely closed at the layer that mattered (DB constraint for CRITICAL-1, not just app-layer hardcoding; specific error-code branch for MAJOR-2; query bound for MAJOR-3), each backed by a real, correctly-targeted test, with the CRITICAL-1 fix additionally live-verified against the running database independent of the app and RLS. No regressions found. Points held back only for the pre-existing, explicitly-deferred minors/nits (actions.ts line count, TOCTOU window still structurally present under MAJOR-2's fix, no distinct self-like error code) — none of which are new and none of which the coordinator asked to re-litigate.

**Status: DONE**
