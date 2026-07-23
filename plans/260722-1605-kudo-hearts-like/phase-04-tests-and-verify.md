# Phase 04 — Tests + live verify

## Context
- Plan: [plan.md](./plan.md) · Decisions: [clarifications.md](./clarifications.md) · Depends: 01, 02, 03.
- Mirror test style: `app/kudos-live-board/actions.test.ts` (hoisted `vi.mock` for
  `resolveCurrentUserId`, `isMockAuthEnabled`, `createClient`, `createServiceRoleClient`,
  `next/navigation.redirect`), `lib/kudos/kudo-feed-mapper.test.ts`. Vitest node env, `*.test.ts` only.
- Suite baseline: 310 green. i18n key-parity test already exists.

## Overview
Priority P2 · Status pending. Unit-test the action + mapper; verify the SQL trigger and
end-to-end toggle live (Playwright MCP + psql) since trigger logic isn't unit-testable in node.

## Test matrix
| Layer | Target | Cases |
|-------|--------|-------|
| Unit | `toggleKudoHeart` (actions.test.ts) | unauth → redirect /login; kudo not found → `kudo_not_found`; sender==uid → `self_like`; no existing row → insert, `liked:true` + returned count; existing row → delete, `liked:false`; write error → `toggle_failed`; asserts hearts_count NOT written by action (only kudo_hearts insert/delete + re-read) |
| Unit | mapper (kudo-feed-mapper.test.ts) | `heartsValue` numeric passthrough; `heartsLiked` / `isOwnKudo` forwarded; formatted `heartsCount` unchanged |
| Unit | i18n | new `LiveBoard` heart keys present + en/vi parity (existing parity test) |
| Live | migration + trigger | `supabase db reset`; psql: insert kudo_hearts → hearts_count +1; delete → -1 (floor 0); RLS insert self-like rejected |
| Live/E2E | UI (Playwright MCP) | click gray→red +1; reclick red→gray -1; reload persists; own-kudo disabled; profile "Hearts received" reflects |

## Implementation steps
1. Extend `app/kudos-live-board/actions.test.ts` with a `describe("toggleKudoHeart")` block;
   build a chainable supabase mock (from().select().eq().maybeSingle(), insert, delete) per existing style.
   Cover both mock-mode (service-role client) and the self-like/toggle branches.
2. Extend `lib/kudos/kudo-feed-mapper.test.ts` for the new passthrough fields.
3. `pnpm test` → all green (310 + new). `pnpm lint`. `tsc --noEmit`.
4. Live: `supabase db reset`; psql checks on trigger + RLS self-like rejection.
5. Playwright MCP against running dev server: exercise toggle, reload persistence, own-kudo disabled;
   confirm `kudos.hearts_count` in psql and profile stat.

## Todo
- [x] Action unit tests (6 cases above) — All 6 test cases passing (redirect/not_found/self_like/insert/delete/error)
- [x] Mapper unit tests (new fields) — heartsValue/heartsLiked/isOwnKudo passthrough verified
- [x] i18n parity confirmed — LiveBoard block keys en/vi matched, parity test passes
- [x] Full suite + lint + tsc green — 330/330 tests (+20 new), zero lint/tsc errors
- [x] Live: db reset + trigger/RLS psql checks — Trigger +/-1 behavior verified, RLS self-like rejection confirmed
- [x] Live: Playwright toggle + reload + own-kudo + profile stat — Full cycle tested (like→red+count; unlike→gray-count; reload persists; own disabled); profile Hearts received stat synced

## Success criteria
- All unit tests pass, no baseline regressions (>= 310 + new).
- Live toggle flips color + count and persists; own-kudo disabled; hearts_count + profile stat consistent.
- No mocks/stubs standing in for real behavior; failing tests fixed, not skipped.

## Risk assessment
- Trigger untestable in node (Med) → covered by live psql verification (steps 4).
- Mock-mode service-role path diverges from prod RLS path (Med) → assert self-like/one-per-user in action tests AND RLS self-like in live psql.

## Rollback
Tests are additive; no rollback. If live verify fails, loop back to the owning phase.

## Next
On green → hand to `reviewer`; update `docs/project-changelog.md` (Docs impact: minor).
