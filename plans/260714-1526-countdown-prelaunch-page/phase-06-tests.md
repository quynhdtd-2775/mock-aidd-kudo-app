# Phase 06 — Tests (vitest)

**Track:** B · **Priority:** P2 · **Status:** done · **Depends on:** Phase 02, 03, 04

## Context Links
- Runner: `vitest.config.ts` (node env, `**/*.test.ts`, `@` alias to root)
- Existing test style: `lib/profile/profile-view-mappers.test.ts`, `lib/profile/current-user.test.ts`
- Units under test: `countdown-math.ts` (P03), `launch-at-cache.ts` (P02), `nav-lock.ts` (P04)

## Overview
Unit-test the pure logic that carries correctness risk: countdown math, cache TTL behavior, and the
nav-lock decision matrix. These are node-env, no-DOM, no-network — fast and deterministic.

## Key Insights
- Pure functions were carved out precisely so they test without React/timers/DB (P03, P04).
- Nav-lock loop risk is the highest — cover its full matrix explicitly.
- The client hook (`use-countdown.ts`) needs DOM/timer mocking; vitest is `environment: "node"`.
  Keep hook coverage light (fake timers on the pure recompute path) or defer to manual smoke —
  do NOT add jsdom just for this (YAGNI). Prefer testing `computeCountdown` exhaustively instead.

## Requirements
- `computeCountdown`: normal, <1 day (days "00"), exactly zero (all "00"), past-due (all "00"),
  >99 days (clamp), 2-digit padding, hours%24 / minutes%60 boundaries.
- `getCachedLaunchAt`: returns value; second call within TTL does not refetch (spy/mock the query);
  refetches after TTL; returns `null` safely when query fails.
- `resolveNavLock`: before-launch non-allowlisted → redirect to countdown; allowlisted → null;
  after-launch countdown path → `/`; after-launch other → null; `launchAt == null` → null (no loop).

## Architecture
- Mock the Supabase query for cache tests (inject/stub `getLaunchAt`), or structure `launch-at-cache`
  to accept a fetcher for testability (DI keeps it pure) — decide in P02 impl, reflect here.
- Use vitest fake timers for the TTL test (`vi.useFakeTimers`, advance past TTL).

## Related Code Files
- Create: `lib/countdown/countdown-math.test.ts`
- Create: `lib/countdown/launch-at-cache.test.ts`
- Create: `lib/countdown/nav-lock.test.ts`
- Modify: none (tester owns test files only) · Delete: none

## Implementation Steps
1. `countdown-math.test.ts`: table-driven cases for each clamp/boundary.
2. `nav-lock.test.ts`: the full before/after/allowlist/null matrix (loop-safety asserts).
3. `launch-at-cache.test.ts`: fake timers; assert single fetch within TTL, refetch after, null-safe.
4. `pnpm test` green; no failing tests waved through.

## Todo List
- [x] Math tests cover all boundary/clamp cases
- [x] Nav-lock matrix incl. loop-safety + fail-open
- [x] Cache TTL: hit / expire-refetch / error→null
- [x] Full suite green (160 tests / 6 files)
- [x] lib/supabase/middleware.test.ts composed-flow regression suite (20 tests, critical post-review verification)

## Success Criteria
- `pnpm test` passes; new units meaningfully covered; error paths exercised.

## Risk Assessment
- **Over-mocking hides real bugs (Med):** keep pure fns un-mocked; mock only the DB fetch. No fake
  data to force green (per rules).
- **Fake-timer flake (Low):** advance time deterministically; avoid real `setTimeout`.

## Security Considerations
- None (test-only).

## Next Steps
- On green, hand to `reviewer`; then Phase 05 smoke + docs sync closes the plan.
