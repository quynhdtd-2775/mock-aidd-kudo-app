# Phase 03 — Countdown Math + Ticking Hook + At-Zero Redirect

**Track:** B · **Priority:** P1 · **Status:** completed · **Depends on:** none (pure logic)

## Context Links
- Spec: DAYS 00–99, HOURS 00–23, MINUTES 00–59; 2-digit zero-pad; tick every 1s; clamp to "00".
- Clarifications: at-zero → auto-redirect to `/`.

## Overview
Pure countdown math (testable, no React) + a thin client hook that ticks each second and, at zero,
redirects to `/`. UI (Track A) consumes these — this phase does NOT touch layout. Standalone from
Track A: the hook is imported by the UI during Phase 05 integration.

## Key Insights
- Countdown is **absolute-time**: `remainingMs = launchAt.getTime() - Date.now()`. Client TZ
  irrelevant — no local-timezone arithmetic needed. (Asia/Ho_Chi_Minh only shaped the seed.)
- Clamp rules: `remainingMs <= 0` → all "00". Days capped display 00–99 (spec upper bound);
  if days > 99 the design is out of range — clamp display to "99" is the safe default (confirm in
  integration if design says otherwise). Days shows "00" when < 1 day remains.
- Keep math **pure** so Phase 06 can unit-test without a DOM/timers.

## Requirements
- Functional: `computeCountdown(launchAt: Date, now: Date): { days, hours, minutes }` as
  2-digit zero-padded strings; below-range/after-completion → "00".
- Functional: `useCountdown(launchAt: Date)` client hook: state = current parts, ticks every 1000ms,
  on reaching zero calls `router.replace("/")` (Next `useRouter` from `next/navigation`) once.
- Non-functional: single interval, cleared on unmount; no tick after zero.

## Architecture
- `countdown-math.ts` (pure): computes days/hours/minutes from `remainingMs`; handles clamp + pad.
  `days = floor(ms / 86_400_000)`, `hours = floor(rem / 3_600_000) % 24`, `minutes = ... % 60`.
- `use-countdown.ts` (`"use client"`): `useState` of computed parts, `useEffect` sets
  `setInterval(1000)`, recomputes vs `Date.now()`, and when `remaining <= 0` clears interval +
  `router.replace("/")` guarded by a ref so it fires once.
- Data in: `launchAt: Date`. Data out: display parts; side-effect redirect at zero.

## Related Code Files
- Create: `lib/countdown/countdown-math.ts`
- Create: `lib/countdown/use-countdown.ts` (`"use client"`)
- Modify: none · Delete: none

## Implementation Steps
1. Implement `computeCountdown` pure fn + a `pad2` helper (DRY, local).
2. Decide the >99-days clamp behavior; default to "99" display, leave a `// TODO(confirm)` note.
3. Implement `useCountdown` using `next/navigation` `useRouter().replace`. One-shot redirect ref.
4. Recompute on each tick from `Date.now()` (do not accumulate drift by counting down a local var).

## Todo List
- [x] `computeCountdown` pure, zero-padded, clamps ≤0 → "00"
- [x] `<1 day` → days "00"; hours/minutes correct
- [x] `useCountdown` ticks 1s, clears interval on unmount
- [x] At-zero redirect to `/` fires exactly once
- [x] Compiles

## Success Criteria
- Unit tests (Phase 06) cover: normal, <1 day, exactly zero, past-due, >99 days.
- Manual: hook drives a demo value to 0 → navigates to `/` once.

## Risk Assessment
- **Timer drift (Low):** recompute from `Date.now()` each tick, not decrement — avoids drift.
- **Double redirect / redirect loop (Med):** guard with a ref; `/` is not locked once launched
  (Phase 04), so no ping-pong. Verify against Phase 04 lock logic.
- **SSR mismatch (Low):** hook is client-only; server passes `launchAt` as prop.

## Security Considerations
- No user input, no external calls. Pure client logic.

## Next Steps
- Consumed by Phase 05 integration (UI imports hook; math shared).
