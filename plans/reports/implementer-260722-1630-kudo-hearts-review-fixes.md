# Implementer: kudo-hearts review-finding fixes — 2026-07-22

Fixes review findings from `plans/reports/reviewer-260722-1620-kudo-hearts.md` (CRITICAL-1, MAJOR-2, MAJOR-3). Minor/nit items explicitly skipped per task instruction.

## CRITICAL-1 — `hearts_value` unbounded (DB trust boundary)

`supabase/migrations/20260722100000_kudo_hearts.sql`

- Lines 16-29: added `kudo_hearts_value_check` constraint (`hearts_value in (1, 2)`) via idempotent `do $$ ... if not exists (select 1 from pg_constraint ...) $$` block — matches the file's existing `create if not exists` / `drop policy if exists` idempotent style.
- Line 72: INSERT trigger branch now `greatest(hearts_count + NEW.hearts_value, 0)` (was unclamped) — defense-in-depth alongside the new CHECK.
- DELETE branch (line 75) was already floored; unchanged.

Applied live against `supabase_db_mock-aidd-kudo-app` via `docker exec -i ... psql` (DO block for the constraint + `create or replace function` for the trigger). Verified:

```
\d kudo_hearts  →  Check constraints: "kudo_hearts_value_check" CHECK (hearts_value = ANY (ARRAY[1, 2]))

insert into public.kudo_hearts (kudo_id, user_id, hearts_value)
values ('8977de79-fa0c-4ffd-b258-0011f7a5066d', '00000000-0000-4000-8000-000000000001', -5);
→ ERROR:  new row for relation "kudo_hearts" violates check constraint "kudo_hearts_value_check"

(also tested hearts_value = 999999 in a rolled-back transaction → same rejection)
```

Ran as `postgres` superuser (RLS-bypassing), so this is purely the CHECK constraint firing — confirms the fix holds even for a direct-REST / RLS-bypass path.

## MAJOR-2 — duplicate-key race in `toggleKudoHeart`

`app/kudos-live-board/actions.ts:194-211` (insert branch). On `insertError.code === "23505"`, treat as already-liked (`liked = true`) instead of `toggle_failed` — falls through to the existing post-toggle `hearts_count` re-read, so the response shape (`{ ok: true, liked: true, heartsCount }`) is identical to the normal insert-success path. Non-23505 insert errors still return `toggle_failed` as before.

Tests added in `app/kudos-live-board/actions.test.ts`:
- `"treats a 23505 duplicate-key insert error as already-liked (MAJOR-2 race fix)"` — asserts `{ ok: true, liked: true, heartsCount: 1001 }`.
- `"returns toggle_failed (not liked:true) for a non-23505 insert error"` — guards against over-broadening the catch (e.g. `23503` FK violation still fails).

## MAJOR-3 — unbounded `likedByMe` query

`lib/kudos/kudos-feed-queries.ts:59-75`. Added `.in("kudo_id", data.map((row) => row.id))` to the `kudo_hearts` query, and guarded the whole block with `data.length > 0` (skip the query entirely on an empty feed page rather than issue a no-op `.in([])`).

New test file `lib/kudos/kudos-feed-queries.test.ts` (none existed before) covers: feed-query error → `[]`; `createClient` throw → `[]`; no-uid skips `kudo_hearts` query; empty feed page skips `kudo_hearts` query; the `.in()` call is scoped to exactly the fetched page's ids and `likedByMe` reflects it per-row; liked-ids query error degrades to `likedByMe: false` for all rows (not a full feed failure); `isOwnKudo` correctly keyed off `sender_id`.

## Verification

- `pnpm exec tsc --noEmit` — clean.
- `pnpm exec eslint app/kudos-live-board/actions.ts app/kudos-live-board/actions.test.ts lib/kudos/kudos-feed-queries.ts lib/kudos/kudos-feed-queries.test.ts` — clean.
- `pnpm exec vitest run` — **330/330 passed** (20 test files; task expected ≥321).
- Live psql verification above (constraint + rejected negative/large insert).

## Skipped (per task instruction)

- Minor #4 (`actions.ts` now 225 lines, was 215 — over 200-line convention). Logged debt, unchanged scope decision; the +10 lines come entirely from the 23505 branch in MAJOR-2.
- Minor #5 (pending-guard window) — same root cause as MAJOR-2, mitigated by it.
- Nit #6 (no distinct RLS-self-like error code) — no new error code added.

## Status: DONE

## Unresolved Questions

None — clarifications.md's "+1 only this run... hearts_value stores per-like value so a future x2 can land without remigration" directly resolved the CHECK's bound (`in (1, 2)`, matching the reviewer's recommended option).
