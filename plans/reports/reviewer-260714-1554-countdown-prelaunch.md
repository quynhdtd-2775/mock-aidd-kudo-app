# Review: Countdown Prelaunch Page

Scope: supabase/migrations/20260714080000_event_settings.sql, lib/countdown/*, lib/supabase/middleware.ts, app/count-down-prelaunch/*. Plan: plans/260714-1526-countdown-prelaunch-page/. `pnpm vitest run` → 140/140 passing (5 files).

## Overall Score: 6/10

Math/cache/nav-lock unit logic is clean and well-tested. But the nav-lock's core promise — "public page, no login required" — is broken by a composition bug in `updateSession`: the countdown page passes the nav-lock allowlist but then gets caught by the *existing* auth gate right below it and bounced to `/login`. This is untested (no test exercises the composed `updateSession`, only the pure `resolveNavLock`) and directly contradicts clarifications.md ("Public — no login required; middleware allowlists this route").

## Critical Issues

### 1. Countdown page is not actually public — auth gate re-blocks it after nav-lock allows it
`lib/supabase/middleware.ts:10, 33-36, 77-79`

```ts
const PUBLIC_PATHS = ["/login", "/auth"];
...
const isPublic = PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));
if (!hasSession && !isPublic) { ... redirect to /login }   // mock-auth branch, line 36
...
const isPublicPath = PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));
if (!user && !isPublicPath) { ... redirect to /login }     // real supabase branch, line 81
```

`PUBLIC_PATHS` was never updated to include `COUNTDOWN_PATH` (`/count-down-prelaunch`). Trace an anonymous visitor before launch:
1. Request `/` → nav-lock (line 19) redirects to `/count-down-prelaunch` (correct).
2. Request `/count-down-prelaunch` → nav-lock allows it (path is in its own allowlist, line 8 of nav-lock.ts) → falls through to the mock-auth block (or real Supabase block) → `hasSession`/`user` is false, `isPublic` is false (COUNTDOWN_PATH not in `PUBLIC_PATHS`) → **redirected to `/login`**.

Net effect: unauthenticated users can never actually see the countdown page — they get bounced to `/login` instead. This affects both the mock-auth branch (dev) and the real Supabase branch (prod), since both reuse the same stale `PUBLIC_PATHS` array. Not a redirect *loop* (it terminates at `/login`), but it is a correctness break of the primary acceptance criterion.

**Fix:** add `COUNTDOWN_PATH` to `PUBLIC_PATHS` (or reuse `lib/countdown/nav-lock.ts`'s allowlist as the single source of truth for both gates), e.g.:
```ts
import { COUNTDOWN_PATH } from "@/lib/countdown/nav-lock";
const PUBLIC_PATHS = ["/login", "/auth", COUNTDOWN_PATH];
```
Also add a test exercising `updateSession` end-to-end (or at least PUBLIC_PATHS coverage) — the 140 passing tests never touch this composition, which is exactly why it shipped broken.

## High Priority

### 2. Duplicate DB round-trip per countdown-page load
`app/count-down-prelaunch/page.tsx:16` calls uncached `getLaunchAt()` directly, while `lib/supabase/middleware.ts:18` already fetched `getCachedLaunchAt()` for the same request just moments earlier in the proxy. Every navigation to the countdown page does two Supabase reads (one cached-ish in the proxy, one fresh in the page). Not wrong per the documented contract (page comment explicitly says "Uncached"), but worth reusing `getCachedLaunchAt()` here too — the 60s staleness is already accepted for the nav-lock, so reusing it for the display removes a redundant query with no correctness cost.

### 3. Module-level cache in `launch-at-cache.ts` is single-instance-only
`lib/countdown/launch-at-cache.ts:10` — acknowledged in the file's own comment ("phase-02 Risk Assessment for multi-instance prod caveat") and in the plan. Fine for current deployment target, but flag explicitly: if this ever runs on multi-instance/serverless (e.g. Vercel edge functions per-region, or multiple Node processes), each instance has its own 60s-stale cache, so lock/unlock timing can visibly diverge across requests hitting different instances near the launch boundary. Not blocking given current single-instance local/dev target, but should be called out again before any multi-instance deploy.

## Medium Priority

### 4. `event_settings` RLS comment flags its own risk but ships anyway
`supabase/migrations/20260714080000_event_settings.sql:19` — "Do NOT ship this to prod as-is." The migration *is* the thing that ships to prod (migrations apply as-is by definition). If this is meant to gate on an env-specific seed value rather than the RLS policy itself, the comment is misleading; if it's about the read-for-everyone policy, that's actually correct for a public countdown table (no PII, no secrets) — the policy itself is fine, the comment undersells it. Worth a follow-up: either strengthen the comment to say what needs to change before prod (e.g. seed value / cutover process) or remove the alarming phrasing since the RLS as written is appropriate for this public, non-sensitive table.

### 5. SSR/CSR hydration mismatch risk in `use-countdown.ts`
`lib/countdown/use-countdown.ts:30-32` — initial `useState` computed from `computeCountdown(launchAt, new Date())` runs once server-side (during SSR of the client component tree) and again client-side at hydration, using two different `now` values (network-latency apart). If the minute/hour boundary happens to tick over between server render and client hydration, React will warn/mismatch on the initial digits before the first `tick()` in `useEffect` corrects it a moment later. Cosmetic (self-heals in <1 tick), but worth knowing — could suppress via `suppressHydrationWarning` on the digit spans if it becomes noisy, or accept as-is since it's extremely low probability and self-correcting.

## Low Priority

- `lib/countdown/countdown-types.ts` — single-field interface (`EventSettings.launchAt`) is currently unused; `event-settings-queries.ts` returns `Date | null` directly rather than `EventSettings | null`. Confirm this type is intentionally forward-looking (e.g. Phase 05 note) rather than dead code; if unused, YAGNI suggests dropping it until something needs it.
- `countdown-fonts.ts:20` "Digital Numbers" font isn't self-hosted (no such Google Font) — degrades to monospace fallback stack. Acceptable per the comment's own reasoning, just noting the visual will differ from the Figma reference on machines without that font installed locally.

## Edge Cases Found

- **DB-down fail-open verified correct**: `getLaunchAt()` (event-settings-queries.ts:20) and `getCachedLaunchAt()` (launch-at-cache.ts) both degrade to `null` on any error, and `resolveNavLock(path, null, now)` (nav-lock.ts:28) always returns `null` (no lock) — matches the fail-open contract. `useCountdown(null)` renders static "00 00 00" with no redirect (use-countdown.ts:35-38) — also correct.
- **Days clamp at exactly 100 days**: `computeCountdown` (countdown-math.ts:49-53) clamps `rawDays` to 99 via `Math.min`, tested boundary presumably in countdown-math.test.ts — logic is correct (`Math.floor` then `Math.min`, no off-by-one).
- **At-zero redirect fires exactly once**: `hasRedirectedRef` guard in use-countdown.ts:29,44-47 is correct — subsequent ticks after zero keep computing (harmless, all-"00" output) but never call `router.replace` again.
- **After-launch forward for countdown subpaths**: `resolveNavLock` (nav-lock.ts:41-43) correctly prefix-matches `/count-down-prelaunch/*` to redirect home post-launch, symmetric with the pre-launch allowlist prefix match — no asymmetry bug found here.
- **No redirect loop in the nav-lock layer itself**: traced `/`→countdown→(login, per bug #1)→login is a terminating chain, not a loop. `/login` and `/auth/*` are allowlisted at both the nav-lock layer and (already) the pre-existing auth layer, so no cycle. The bug is a *dead end*, not a loop — but still breaks the public-access requirement.

## Positive Observations

- Nav-lock decision logic (`nav-lock.ts`) is a pure, well-documented function — easy to unit test in isolation, which is exactly what the 140 tests exercise well for the units they cover.
- Consistent fail-open pattern mirrors `lib/profile/profile-queries.ts` (try/catch → `null`, mock-flag branch convention) — good adherence to existing codebase conventions.
- `countdown-math.ts` avoids the classic countdown bug (decrementing a local counter causing drift) by always recomputing from the absolute instant — correct and explicitly documented as such.
- RLS policy on `event_settings` (read-only, no write policies) is appropriate for this public, non-PII singleton config table.
- Comments throughout are unusually good at explaining *why*, not just what (TTL rationale, fail-open rationale, single-instance caveat) — makes future maintenance easier.

## Recommended Actions

1. **Critical**: Fix `PUBLIC_PATHS` in `lib/supabase/middleware.ts` to include `COUNTDOWN_PATH` (both mock-auth and real-Supabase branches) so the countdown page is actually reachable by unauthenticated visitors as specified. Add a test (integration-style or at least an explicit `PUBLIC_PATHS` assertion) covering the composed proxy behavior, since pure `resolveNavLock` tests alone did not catch this.
2. **High**: Consider reusing `getCachedLaunchAt()` in `app/count-down-prelaunch/page.tsx` to avoid the duplicate per-request DB read.
3. **Medium**: Clarify or soften the "Do NOT ship this to prod as-is" migration comment — state precisely what must change before prod cutover.
4. **Low**: Confirm intent behind unused `EventSettings` interface; drop if dead.

## Metrics
- Test Coverage: 140/140 vitest tests passing across 5 files (countdown-math, launch-at-cache, nav-lock, + others) — but 0 tests cover the composed `updateSession` proxy behavior where the critical bug lives.
- Type Coverage: no `any` observed in reviewed files.
- Linting Issues: none observed in reviewed files (not independently re-run beyond vitest).

## Unresolved Questions
- Is there a reason `PUBLIC_PATHS` (auth gate) was kept separate from the nav-lock's own `ALLOWLIST` rather than sharing one list? If intentional (e.g. future divergence planned), at minimum the countdown path still needs adding to `PUBLIC_PATHS` today.
- Was `EventSettings`/`countdown-types.ts` meant for a not-yet-written consumer (Phase 05 integration)? If so no action needed beyond a comment noting the forward reference.

**Status:** DONE_WITH_CONCERNS
**Summary:** Core math/cache/nav-lock units are solid and well-tested (140/140 passing), but a critical composition bug in `lib/supabase/middleware.ts` re-blocks the countdown page behind the pre-existing auth gate (`PUBLIC_PATHS` missing `/count-down-prelaunch`), breaking the "public, no login required" requirement from clarifications.md. Must fix before merge.
**Concerns/Blockers:** Critical issue #1 (auth gate blocks countdown page) should block deploy/merge until fixed; everything else is high/medium/low and non-blocking.
