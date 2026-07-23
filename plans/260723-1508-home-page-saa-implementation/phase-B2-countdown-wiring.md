# Phase B2 — Countdown wiring (non-redirecting variant)

## Context Links
- Contracts: `lib/countdown/use-countdown.ts` (redirects at zero — prelaunch behavior),
  `lib/countdown/countdown-math.ts` (`computeCountdown`, `CountdownParts`, pad2, 99-clamp),
  `lib/countdown/launch-at-cache.ts` (`getCachedLaunchAt(): Promise<Date|null>`, 60s TTL, never throws)
- Pattern ref: `app/count-down-prelaunch/countdown-display.tsx` (client tiles fed a server-fetched date)
- Current: `components/home/hero-countdown.tsx` (server component, hardcoded "20" tiles + "Coming soon")

## Overview
- **Priority:** P2 · **Status:** pending · **Blocked by:** none
- Replace the hardcoded homepage countdown with a live one driven by `event_settings.launch_at`,
  **without** the prelaunch page's redirect-at-zero behavior.

## Key Insights
- `useCountdown` unconditionally `router.replace("/")` at zero — consumed by `/count-down-prelaunch`.
  Homepage must NOT redirect. Add an **opt-out param** (`redirectOnZero = true` default) so prelaunch
  is unchanged and the homepage passes `false`. DRY: reuse the same hook, no fork.
- At zero the homepage shows `00 00 00` and HIDES "Coming soon" (spec). Derive from `isComplete`.
- Event-info copy (time/location/livestream) reads Hero-namespace messages owned by **Track A** — B2
  renders it but must NOT edit `messages/*.json`.

## Data Flow
`getCachedLaunchAt()` (server, in HeroCountdown) → ISO string prop → client tiles component →
`useCountdown(launchAt, { redirectOnZero: false })` ticks 1s → `CountdownParts` → split each 2-digit
value into glass digit tiles; hide "Coming soon" when `isComplete`.

## Requirements
- **Functional:** tiles reflect real remaining Days/Hours/Minutes, 2-digit 0-padded, update every second;
  at/after zero → `00 00 00`, "Coming soon" hidden, **no redirect** (ID-12, ID-39..43).
- **Non-functional:** null `launchAt` (DB down) → static `00 00 00`, no crash, no redirect.

## Related Code Files
- **Modify:** `lib/countdown/use-countdown.ts` (add `options?: { redirectOnZero?: boolean }`, default true)
- **Modify:** `components/home/hero-countdown.tsx` (fetch launchAt server-side; extract ticking tiles into a client child)
- **Create:** `components/home/hero-countdown-tiles.tsx` (`"use client"`; consumes launchAt, renders glass digit tiles + conditional "Coming soon")

## Implementation Steps
1. `use-countdown.ts`: add optional `options` arg; guard the redirect with `options?.redirectOnZero !== false`. Prelaunch caller unchanged (default true).
2. Move the `CountdownDigit` glass tile + `COUNTDOWN_UNITS` rendering into new client `hero-countdown-tiles.tsx`; call `useCountdown(launchAt, { redirectOnZero: false })`; split each `days/hours/minutes` string into its two digit chars.
3. `hero-countdown.tsx` stays a server component: `const launchAt = await getCachedLaunchAt()`, pass `launchAt?.toISOString() ?? null` + translated labels to the tiles child; keep event-info block server-rendered (reads Track A messages).
4. Hide the "Coming soon" `<p>` when countdown `isComplete` (lift the flag into the client tiles, or render "Coming soon" inside the client child).

## Todo List
- [ ] `redirectOnZero` opt-out param in useCountdown (default preserves prelaunch)
- [ ] client tiles component ticking from launchAt
- [ ] HeroCountdown fetches launchAt, passes ISO string
- [ ] "Coming soon" hidden at zero
- [ ] null launchAt → static 00 00 00, no redirect

## Success Criteria
- Live ticking tiles on `/home-page-saa`; at zero shows `00 00 00`, hides "Coming soon", stays on page.
- `/count-down-prelaunch` still redirects at zero (regression check). Satisfies ID-12, ID-39..43.

## Risk Assessment
- **Regressing prelaunch redirect** (Med/High): default-true param + explicit prelaunch caller untouched; verify prelaunch after change. Covered by B7 test on the opt-out flag.
- **Hydration mismatch** (Low/Med): server renders initial from launchAt; client re-ticks — acceptable, mirrors existing CountdownDisplay.

## Integration
- Event-info spec values arrive via Track A messages; B2 only renders. No shared file with Track A.

## Next Steps
- B7 tests the `redirectOnZero` opt-out + zero-state derivation (pure).
