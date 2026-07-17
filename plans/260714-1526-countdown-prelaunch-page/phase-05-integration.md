# Phase 05 — Integration: Wire Real `launch_at` into UI

**Track:** B + A · **Priority:** P1 · **Status:** done · **Depends on:** Phase 02, Phase 03, Track A UI

## Context Links
- Track A output: `app/count-down-prelaunch/` (presentational components + mock `targetDatetime` prop)
- Data: `lib/countdown/event-settings-queries.ts` (Phase 02)
- Logic: `lib/countdown/use-countdown.ts`, `countdown-math.ts` (Phase 03)

## Overview
The only phase that waits on Track A. Replace the UI's mock `targetDatetime` prop with the real
`launch_at` fetched server-side, and wire the ticking hook + at-zero redirect into the UI component.

## Key Insights
- Track A builds a **presentational** component taking a `targetDatetime` (ISO string / Date) prop.
  Integration = server component fetches, passes real value; client component uses `useCountdown`.
- Server → client boundary: pass `launch_at` as an **ISO string** prop (serializable); client
  reconstructs `new Date(iso)` for the hook.
- If `getLaunchAt()` returns `null` (DB down): render a safe fallback (all "00" or a lightweight
  message) — do not crash the public page.

## Requirements
- Functional: `/count-down-prelaunch` renders the real countdown to seeded `launch_at`.
- Functional: hook ticks + redirects to `/` at zero (Phase 03) inside the real component.
- Non-functional: server component (RSC) does the fetch; no anon key leak to client.

## Architecture
- Data flow: `page.tsx` (server, `app/count-down-prelaunch/page.tsx`) → `getLaunchAt()` →
  pass `launchAt.toISOString()` to the Track A client component → `useCountdown(new Date(iso))`.
- Confirm the exact prop name/shape Track A exposes (from its completion report) and adapt the wiring;
  do NOT rewrite Track A layout.

## Related Code Files
- Create/Modify: `app/count-down-prelaunch/page.tsx` (server component: fetch + pass prop)
- Modify: the Track A client component to consume `useCountdown` (per its reported interface)
- Modify: `docs/system-architecture.md` (note `event_settings` + nav-lock) — docs sync
- Delete: mock `targetDatetime` default once real wiring lands

## Implementation Steps
1. Read Track A's completion report: component tree, prop names, where mock data enters.
2. In `page.tsx` (server) fetch `getLaunchAt()`; handle `null` fallback.
3. Pass ISO string prop into Track A component; inside it call `useCountdown` for ticking + redirect.
4. Remove the mock target-datetime source (replace-in-place, no duplicate "enhanced" file).
5. Run build/tsc; smoke-test the route before and after the seeded instant.

## Todo List
- [x] Server component fetches real `launch_at`
- [x] ISO prop passed across server→client boundary
- [x] Hook wired; at-zero redirect works with real data
- [x] Null/DB-down fallback renders safely (hook accepts `Date | null`, static "00" without redirect)
- [x] Mock prop source removed
- [x] `docs/system-architecture.md` updated (doc-writer session completed)

## Success Criteria
- Route shows live countdown to seeded value; reaching zero navigates to `/`.
- No Track A visual regression (matches its validated design).

## Risk Assessment
- **Track A interface drift (Med):** prop name/shape differs from assumption. Mitigation: read Track A
  report first; adapt wiring, not layout.
- **Server/client serialization (Low):** pass ISO string, not a `Date` instance, across the boundary.
- **File ownership overlap (Med):** this phase edits Track A files — run only AFTER Track A completes
  (that is the one allowed cross-track dependency).

## Security Considerations
- Fetch stays server-side; only the launch instant (non-sensitive) crosses to the client.

## Next Steps
- Hand to Phase 06 for full-suite run; then `reviewer`.
