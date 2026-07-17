# Review: mock-auth layer

**Status:** DONE_WITH_CONCERNS
**Score:** 8/10

## Summary
Clean, well-isolated mock auth. `isMockAuthEnabled()` NODE_ENV guard is applied consistently everywhere mock branches gate (middleware, auth-service, actions). `mock-session.ts` stays runtime-agnostic (no `next/headers`) so nothing leaks into the proxy/edge bundle — verified import chain: `middleware.ts` → `mock-session.ts` only, never `mock-session-server.ts`. All `redirect()` calls in mock branches sit outside try/catch, so the NEXT_REDIRECT throw isn't swallowed. `PUBLIC_PATHS` is a single shared const reused by both mock and Supabase branches in `lib/supabase/middleware.ts` — no duplication drift.

## Findings

**Medium — dual bypass mechanisms left inconsistent** (`lib/supabase/middleware.ts:11-22` vs `lib/auth/auth-service.ts`, `lib/profile/current-user.ts:20-24`)
Two separate dev bypasses coexist: legacy `DISABLE_AUTH=true` (skips all gating, no user identity) and new `AUTH_MODE=mock` (cookie-based session). `middleware.ts` and `current-user.ts` both still check `DISABLE_AUTH` as a fallback path, but `auth-service.ts`'s `getCurrentUser()` (used by both `SiteHeader`s) only checks `isMockAuthEnabled()` — it has no `DISABLE_AUTH` branch. If someone sets `DISABLE_AUTH=true` without `AUTH_MODE=mock` (as `.env.local.example` half-suggests by keeping it commented next to AUTH_MODE), middleware lets every route through with no redirect, but the header would render logged-out (no user) while `/profile` resolves to the seeded demo user — an inconsistent app state. Low risk in practice since `.env` files currently only set `AUTH_MODE=mock`, but the leftover `DISABLE_AUTH` path is untested against the new facade and should either be removed now or documented as deprecated/mutually exclusive.

**Low — mock session cookie missing `secure` flag** (`lib/auth/mock-session-server.ts:16-22`)
`createMockSession()` sets `httpOnly` + `sameSite: lax` but no `secure`. Acceptable since it's NODE_ENV-gated out of prod and typically dev-http, but worth a one-line comment noting it's intentional so a future reader doesn't "fix" it into prod.

**Suggestion — `.env.local.example` documents both flags side by side**
The example file lists `AUTH_MODE=mock` active and `# DISABLE_AUTH=true` commented directly below with overlapping "temporary bypass" comments — reads like two competing options rather than one deprecated-in-favor-of-the-other. A short note ("DISABLE_AUTH is legacy, prefer AUTH_MODE=mock") would prevent someone re-enabling the untested path above.

## Verified
- `isMockAuthEnabled()` NODE_ENV production guard present at the single source (`mock-session.ts:20-24`), consumed everywhere else — no duplicated/divergent guard logic.
- No `next/headers` import reaches `lib/supabase/middleware.ts`'s import graph via `mock-session.ts`.
- Redirect-inside-try pitfall: none found — every mock-branch `redirect()` call (login Google/email, logout) sits after/outside its try block.
- `PUBLIC_PATHS` single definition, shared by both auth-mode branches in middleware.
- `MOCK_USER.id` matches `DEMO_USER_ID` in `lib/profile/current-user.ts` and `supabase/seed.sql` — profile resolution is correct by construction.
- `.env`/`.env.local` are gitignored (`.env*` in `.gitignore`), not tracked — no secret committed.

## Unresolved Questions
- Is `DISABLE_AUTH` intended to stay as a second, permanent bypass, or should it be removed now that `AUTH_MODE=mock` covers the same need? If kept, `getCurrentUser()`/`SiteHeader` should honor it too for consistency.
