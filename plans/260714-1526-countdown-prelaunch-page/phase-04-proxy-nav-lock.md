# Phase 04 — Proxy Nav-Lock (Server-Side Gate)

**Track:** B · **Priority:** P1 · **Status:** done · **Depends on:** Phase 02

## Context Links
- Root proxy: `proxy.ts` (Next 16 renamed convention) → delegates to `updateSession`.
- Edit target: `lib/supabase/middleware.ts` (`updateSession`).
- Cached accessor: `lib/countdown/launch-at-cache.ts` (Phase 02).

## Overview
Before launch, redirect ALL routes except the allowlist to `/count-down-prelaunch`. Once
`now >= launch_at`, lift the lock and optionally redirect visitors of `/count-down-prelaunch` to `/`.
Runs first in `updateSession`, before the auth branches, using the TTL-cached `launch_at`.

## Key Insights
- **Next 16**: this is `proxy.ts`, default **Node.js runtime** → `getCachedLaunchAt()` (DB-backed
  cache) is safe here; no Edge-runtime restriction. `NextResponse.redirect` still applies.
- The existing matcher in `proxy.ts` already excludes `_next/static`, `_next/image`, `favicon.ico`,
  and common image extensions — static assets need no extra allowlisting.
- Allowlist (before launch): `/count-down-prelaunch`, `/login`, `/auth/*`. Everything else → redirect.
- **Fail-open**: if `getCachedLaunchAt()` returns `null`, skip the lock entirely (never brick site).
- Lock must run **before** the mock/Supabase auth redirects so it takes precedence for public users.

## Requirements
- Functional: `now < launch_at` and path not in allowlist → 307 redirect to `/count-down-prelaunch`.
- Functional: `now >= launch_at` and path == `/count-down-prelaunch` → redirect to `/` (optional per
  clarifications; implement it — lock lifts + auto-forward).
- Functional: `launch_at == null` → no lock, fall through to existing auth logic unchanged.
- Non-functional: no per-request DB hit beyond TTL cache; avoid redirect loops.

## Architecture
- New helper `lib/countdown/nav-lock.ts` exporting a pure decision fn
  `resolveNavLock(pathname, launchAt, now): { redirectTo: string } | null` — pure & unit-testable.
- `updateSession` calls `getCachedLaunchAt()` once at top, then `resolveNavLock(...)`; if it returns
  a target, `return NextResponse.redirect(url)` immediately (copy cookies not required — no session
  mutation happened yet). Else continue existing logic untouched.
- Data in: request pathname + cached `launch_at` + `Date.now()`. Data out: redirect or pass-through.

## Related Code Files
- Create: `lib/countdown/nav-lock.ts` (pure `resolveNavLock`)
- Modify: `lib/supabase/middleware.ts` (call cache + `resolveNavLock` at top of `updateSession`)
- Modify: none else · Delete: none

## Implementation Steps
1. `nav-lock.ts`: define `COUNTDOWN_PATH = "/count-down-prelaunch"`,
   `ALLOWLIST = ["/count-down-prelaunch", "/login", "/auth"]`. Pure `resolveNavLock`:
   - `launchAt == null` → `null` (fail-open).
   - `now < launchAt`: if pathname NOT starts-with any allowlist entry → `{ redirectTo: COUNTDOWN_PATH }`; else `null`.
   - `now >= launchAt`: if pathname === COUNTDOWN_PATH → `{ redirectTo: "/" }`; else `null`.
2. In `updateSession`, at the very top (before mock-auth block): `const launchAt = await
   getCachedLaunchAt(); const lock = resolveNavLock(request.nextUrl.pathname, launchAt, new Date());`
   if `lock` → build URL from `request.nextUrl.clone()`, set pathname, `return NextResponse.redirect`.
3. Leave all existing auth logic below untouched.

## Todo List
- [x] `resolveNavLock` pure, covers before/after/allowlist/null
- [x] Wired at top of `updateSession`, before auth branches
- [x] Fail-open on null launch_at (no lock)
- [x] No redirect loop on `/count-down-prelaunch` (self-allowlisted before; forwards to `/` after)
- [x] **COUNTDOWN_PATH added to PUBLIC_PATHS** (post-review critical fix: anonymous access required)
- [x] After-launch redirect now prefix-matches subpaths
- [x] Compiles

## Success Criteria
- Before launch: visiting `/home-page-saa` → redirected to `/count-down-prelaunch`; `/login` reachable.
- After launch (seed a past instant): `/count-down-prelaunch` → `/`; other routes normal.
- DB down: no lock; existing auth flow intact.

## Risk Assessment
- **Redirect loop (High):** `/count-down-prelaunch` must be in the before-launch allowlist AND the
  after-launch branch forwards it away — verify both. Mitigation: pure fn + Phase 06 unit tests on
  the exact matrix.
- **Precedence bug (Med):** lock placed after auth would let auth redirect public users to `/login`
  first. Mitigation: lock is the first statement in `updateSession`.
- **Cache staleness at launch moment (Low):** lock lifts up to TTL late; acceptable, documented.

## Security Considerations
- Public gate only; does not weaken auth (auth logic still runs after lock lifts). No secrets in logic.

## Next Steps
- Phase 06 tests the matrix; Phase 05 integration verifies end-to-end with real seed.
