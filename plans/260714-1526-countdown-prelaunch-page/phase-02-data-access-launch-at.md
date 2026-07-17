# Phase 02 — Data Access + Cached `launch_at` Accessor

**Track:** B · **Priority:** P1 · **Status:** done · **Depends on:** Phase 01

## Context Links
- Pattern to follow: `lib/profile/profile-queries.ts`, `lib/profile/profile-types.ts`, `lib/supabase/server.ts`
- Phase 01 (schema): `phase-01-db-migration-event-settings.md`

## Overview
Server-side module that reads `event_settings.launch_at`, plus a cached accessor for the proxy
(nav-lock runs on every request — avoid a DB round-trip each time). Follows the profile pattern:
safe fallback on error so a downed local Supabase never bricks the site.

## Key Insights
- Profile queries use `createClient()` from `lib/supabase/server.ts` and return safe empty values
  in `catch` — mirror that (return `null` on failure).
- Proxy runs Node.js runtime → a **module-level in-memory cache with short TTL** is valid and KISS.
  No Redis, no external cache (YAGNI).
- Fail-open contract: when `launch_at` is `null` (DB down / no row), the nav-lock (Phase 04)
  must NOT lock — decided there, but this module simply returns `null` truthfully.

## Requirements
- Functional: `getLaunchAt(): Promise<Date | null>` (uncached, server-component use);
  `getCachedLaunchAt(): Promise<Date | null>` (TTL-cached, proxy use).
- Non-functional: cache TTL ~60s; single in-flight guard optional (KISS: skip if not needed).

## Architecture
- Data in: Supabase `event_settings` row (id=1). Data out: `Date | null`.
- `launch-at-cache.ts` holds `{ value: Date | null; fetchedAt: number }` at module scope;
  on call, if `now - fetchedAt < TTL` return cached, else refetch via `getLaunchAt()`.
- Optional mock branch (mirror `isMockProfileDataEnabled`) if an env flag is desired for offline dev.

## Related Code Files
- Create: `lib/countdown/event-settings-queries.ts` (`getLaunchAt`)
- Create: `lib/countdown/launch-at-cache.ts` (`getCachedLaunchAt`, TTL)
- Create: `lib/countdown/countdown-types.ts` (shared types if needed)
- Modify: none · Delete: none

## Implementation Steps
1. `event-settings-queries.ts`: `createClient()` → `.from("event_settings").select("launch_at")
   .eq("id", 1).maybeSingle()`. Return `data ? new Date(data.launch_at) : null`; `catch → null`.
2. `launch-at-cache.ts`: module-level cache + `TTL_MS = 60_000`. `getCachedLaunchAt()` returns
   cached value within TTL else refetches. Guard against caching errors (don't cache `null` long —
   keep TTL short so recovery is quick).
3. Keep each file < 200 lines (these are tiny). No UI imports.

## Todo List
- [x] `getLaunchAt()` reads row, returns `Date | null`, safe on error
- [x] `getCachedLaunchAt()` TTL cache, refetch after expiry
- [x] Types exported; compiles (`pnpm tsc --noEmit` or build)

## Success Criteria
- Call returns seeded `Date`; simulate DB down → returns `null` without throwing.
- Repeated `getCachedLaunchAt()` within TTL hits cache (verified in Phase 06 test).

## Risk Assessment
- **Stale cache after admin changes launch_at (Low):** ≤ TTL staleness acceptable for a demo. Documented.
- **Module cache per server instance (Low):** fine for single-node local/dev; note for multi-instance prod.

## Security Considerations
- Read-only; anon key; no user input. No injection surface.

## Next Steps
- Unblocks Phase 04 (proxy uses `getCachedLaunchAt`) and Phase 05 (page uses `getLaunchAt`).
