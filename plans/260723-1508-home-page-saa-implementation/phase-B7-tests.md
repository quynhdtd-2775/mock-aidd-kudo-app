# Phase B7 — Unit tests for new logic

## Context Links
- Depends on: [B2](phase-B2-countdown-wiring.md), [B3](phase-B3-notifications-bell.md), [B6](phase-B6-awards-hash-scroll.md)
- Test env: Vitest, **node environment (NO jsdom)** — DOM code must expose injectable seams.
- Pattern ref: `components/home-awards-page/scroll-to-award-section.test.ts` (injected resolver),
  `lib/countdown/countdown-math.ts` (already covers 00 00 00 + isComplete)

## Overview
- **Priority:** P2 · **Status:** pending · **Blocked by:** B2, B3, B6
- Cover the pure logic added by Track B. Tests run against final code; no mocks-for-green.

## Key Insights
- No jsdom → don't test React hooks/DOM directly. Test the **pure helpers** each phase extracted:
  countdown zero-state derivation, `hasUnread`, `readHashOnLoad` with injected hash + scroll fn.
- `computeCountdown` zero-state already covered — B7 adds the redirect-opt-out decision + unread + hash.

## Requirements
- **Functional (unit):**
  - Countdown: `redirectOnZero: false` path does not trigger a redirect at zero; at-zero parts are `00 00 00` (assert on the pure derivation / a redirect-decision helper, not the hook internals).
  - Notifications: `hasUnread([])` false; all-read → false; ≥1 `read_at null` → true.
  - Hash-scroll: `readHashOnLoad` with a hash → calls scroll with that hash; empty/missing hash → no call; injected resolver returning null → no throw.
- **Non-functional:** all tests node-env, deterministic, `pnpm test` green; `pnpm lint`, `pnpm build` pass.

## Related Code Files
- **Create:** `lib/notifications/notifications-types.test.ts` (`hasUnread`),
  `components/home/hero-countdown-tiles.test.ts` OR `lib/countdown/use-countdown.test.ts` (redirect-opt-out decision helper — whichever seam B2 exposed),
  `components/home-awards-page/hash-scroll-on-load.test.ts` (`readHashOnLoad` with injected hash + scroll spy)
- **Read for context:** the helpers created in B2/B3/B6

## Implementation Steps
1. `hasUnread` tests: empty, all-read, mixed.
2. Countdown opt-out test: assert the redirect-decision helper returns "no redirect" when `redirectOnZero: false` even at `isComplete`; and zero-state parts = `00 00 00`.
3. `readHashOnLoad` tests: present hash → scroll called with it; empty → not called; resolver→null → no throw.
4. Run `pnpm test`, then `pnpm lint` + `pnpm build`.

## Todo List
- [ ] hasUnread unit tests (3 cases)
- [ ] countdown redirect-opt-out + zero-state test
- [ ] readHashOnLoad injected-seam tests
- [ ] `pnpm test` / `pnpm lint` / `pnpm build` green

## Success Criteria
- New helpers covered; full suite + lint + build pass. Satisfies the testing clause of the acceptance criteria (ID-24..26, ID-36 regression via existing suite).

## Risk Assessment
- **Untestable seam** (Med/Med): if B2/B6 didn't expose a pure helper, coordinate a small refactor back to those phases rather than adding jsdom (repo convention is node-env only).

## Next Steps
- Hand final code to `reviewer` per primary workflow.
