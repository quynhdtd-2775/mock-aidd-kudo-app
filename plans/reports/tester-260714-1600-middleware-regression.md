# Regression Test Report — Middleware Integration

**Follow-up:** Integration tests for bug found by reviewer (missing COUNTDOWN_PATH in PUBLIC_PATHS)

**Executed:** 2026-07-14 · pnpm vitest run + pnpm tsc --noEmit

---

## Context

Reviewer found critical bug that unit tests missed:
- Bug: `/count-down-prelaunch` was not in `PUBLIC_PATHS` in middleware
- Result: Anonymous visitors allowed by nav-lock were redirected to `/login` by auth gate
- Root cause: Pure unit tests exercise logic in isolation, missing composed middleware flow
- Fix: Added `COUNTDOWN_PATH` to `PUBLIC_PATHS`; updated nav-lock to prefix-match subpaths after launch

---

## Test Results Overview

| Metric | Result |
|--------|--------|
| **Test Files** | 6 passed (all) |
| **Total Tests** | 160 passed (all) |
| **New Tests** | 20 (middleware integration) |
| **TypeScript Check** | Pass (0 errors) |
| **Execution Time** | ~201ms |
| **Exit Code** | 0 (success) |

---

## New Test File: lib/supabase/middleware.test.ts (20 tests)

**Coverage:** `updateSession()` composed flow — nav-lock + auth gate interactions

### Test Scenarios

#### Scenario 1: Anonymous to /count-down-prelaunch BEFORE launch (mock-auth)
**Goal:** Verify critical fix — countdown page is public, not redirected to /login

| Test | Result | Notes |
|------|--------|-------|
| passes through without redirect to /login (countdown is public) | ✓ | Nav-lock allows; PUBLIC_PATHS includes COUNTDOWN_PATH |
| allows mock session cookie to persist | ✓ | Countdown accessible to authenticated users |

#### Scenario 2: Anonymous to /home-page-saa BEFORE launch → nav-lock redirect
**Goal:** Verify nav-lock runs BEFORE auth gate and wins the redirect decision

| Test | Result | Notes |
|------|--------|-------|
| redirects to /count-down-prelaunch (nav-lock wins) | ✓ | Before auth gate can redirect to /login |
| redirects even without mock-auth | ✓ | Nav-lock independent of auth mode |
| redirects all non-public paths: /, /home, /profile, /dashboard | ✓ | Consistent behavior across paths |

#### Scenario 3: launch_at null (DB down) → auth gate controls access
**Goal:** Verify fail-open behavior — when DB down, countdown lock disabled

| Test | Result | Notes |
|------|--------|-------|
| anonymous /home-page-saa goes to /login (auth gate), not countdown | ✓ | Nav-lock null → no lock; auth decides |
| anonymous /count-down-prelaunch is allowed (PUBLIC_PATHS) | ✓ | Countdown still accessible |
| /login allowed (PUBLIC_PATHS) | ✓ | Can reach login without countdown gate |
| /auth/* paths allowed (PUBLIC_PATHS) | ✓ | Auth callbacks accessible |

#### Scenario 4: After launch: /count-down-prelaunch → redirect to /
**Goal:** Verify countdown page forwards users after launch

| Test | Result | Notes |
|------|--------|-------|
| redirects /count-down-prelaunch to / after launch | ✓ | Nav-lock decision after launch |
| allows /home-page-saa after launch (with mock session) | ✓ | Nav-lock lift; auth allows authenticated |
| redirects /count-down-prelaunch/nested to / (prefix match) | ✓ | Nav-lock now prefix-matches subpaths |
| allows authenticated users everywhere after launch | ✓ | Full access post-launch for logged-in |

#### Critical Regression: /count-down-prelaunch in PUBLIC_PATHS
**Goal:** Direct test for the bug that was fixed

| Test | Result | Notes |
|------|--------|-------|
| anonymous visitor reaches countdown (not redirected to /login via mock-auth) | ✓ | **Regression test:** verifies bug is fixed |

#### Edge Cases & Combined Scenarios
**Goal:** Verify interaction with mock-auth state changes

| Test | Result | Notes |
|------|--------|-------|
| authenticated on /login before launch → redirects to /home-page-saa | ✓ | Mock-auth login redirect |
| authenticated on /login after launch → redirects to /home-page-saa | ✓ | Consistent post-launch |
| mock-auth disabled, before launch → nav-lock redirects to countdown | ✓ | Nav-lock works regardless of auth mode |
| race condition: nav-lock checked before auth gate | ✓ | Order matters; nav-lock is first gate |

#### Countdown Path Variations
**Goal:** Verify exact vs prefix matching behavior

| Test | Result | Notes |
|------|--------|-------|
| exact /count-down-prelaunch before launch → allowed | ✓ | Countdown in both allowlist (nav-lock before) + PUBLIC_PATHS |
| /count-down-prelaunch/ after launch → redirected to / | ✓ | Updated nav-lock now prefix-matches |

---

## Mocking Strategy

| Mock | Purpose | How |
|------|---------|-----|
| `getCachedLaunchAt()` | Control launch timing | `vi.mock()` to return Date or null |
| `isMockAuthEnabled()` | Toggle auth mode | Mock returns true/false |
| `hasMockSessionCookie()` | Control session state | Mock returns true (authenticated) or false (anonymous) |
| `createServerClient()` | Avoid Supabase credentials | Mock returns client with mocked `auth.getUser()` |

**Key detail:** Mocks hoisted to top of file (before imports) to satisfy vitest hoisting rules.

---

## Composed Flow Tested

```
Request → Nav-lock (countdown prelaunch gate)
          ↓
          If redirect → respond
          ↓
          If not → Mock-auth check (if AUTH_MODE=mock)
                   ↓
                   If redirect → respond
                   ↓
                   If not → Real Supabase auth (if AUTH_MODE != mock)
                            ↓
                            If redirect → respond
                            ↓
                            If not → Pass through
```

**Critical interactions tested:**
1. Nav-lock runs **before** auth gate (order matters)
2. Nav-lock decision (countdown lock) independent of auth state
3. Auth gate respects PUBLIC_PATHS (includes COUNTDOWN_PATH)
4. Fail-open: null launch_at disables countdown lock entirely
5. After-launch redirect clears countdown gate, lets auth control

---

## Coverage Matrix

### Path coverage (before/after launch)

| Path | Before Launch | After Launch | Public? |
|------|---------------|--------------|---------|
| /count-down-prelaunch | Nav-lock allows; PUBLIC_PATHS ✓ | Redirects to / ✓ | Yes |
| /home-page-saa | Nav-lock redirects to /count-down-prelaunch | Allowed (auth pending) ✓ | No |
| /login | Nav-lock allows (allowlist); PUBLIC_PATHS ✓ | Allowed (PUBLIC_PATHS) ✓ | Yes |
| /auth/* | Nav-lock allows (allowlist); PUBLIC_PATHS ✓ | Allowed (PUBLIC_PATHS) ✓ | Yes |
| / | Nav-lock redirects to /count-down-prelaunch | Allowed (auth pending) ✓ | No |

### Auth state coverage

| Scenario | Mock Auth | Session | Result |
|----------|-----------|---------|--------|
| Anonymous, before launch | Enabled | None | Nav-lock gate (countdown) |
| Authenticated, before launch | Enabled | Yes | Nav-lock gate (countdown) |
| Anonymous, after launch | Enabled | None | Allowed (PUBLIC_PATHS or /count-down-prelaunch) |
| Authenticated, after launch | Enabled | Yes | Allowed |
| Anonymous, launch_at null | Either | None | Auth gate (no countdown) |
| Mock auth disabled | Disabled | N/A | Real Supabase auth (mocked in tests) |

---

## Test Quality Notes

✓ **Composed flow:** Tests the real middleware (not isolated units)
✓ **Critical path:** Regression test directly addresses found bug
✓ **Order verification:** Confirms nav-lock runs before auth gate
✓ **Fail-open:** Null launch_at behavior tested
✓ **State isolation:** beforeEach/afterEach reset mocks cleanly
✓ **Mock hoisting:** Mocks properly hoisted before imports for vitest

---

## Implementation Notes

**Bugs Fixed (by reviewer, tested here):**
1. `COUNTDOWN_PATH` added to `PUBLIC_PATHS` (was missing)
2. Nav-lock after-launch now prefix-matches countdown subpaths (was exact match only)

**Tests confirm:**
- Fix #1: Anonymous users can reach /count-down-prelaunch without /login redirect
- Fix #2: /count-down-prelaunch/* subpaths redirect to / after launch

---

## Unresolved Questions

None — all composed flow scenarios covered; all tests green.

---

## Next Steps

1. **Code review:** Verify PUBLIC_PATHS fix and nav-lock subpath matching are in place
2. **Phase 05 smoke test:** Manual browser countdown before/after launch
3. **Docs update:** System architecture notes PUBLIC_PATHS + nav-lock order

---

**Status: DONE**

**Summary:** Middleware integration tests (20 tests) created and passing. Tests verify composed flow (nav-lock + auth gate) and regression-test the critical bug found by reviewer (COUNTDOWN_PATH missing from PUBLIC_PATHS). All 160 tests pass; TypeScript clean.

**Confidence:** High — tests exercise the exact composed flow where the bug occurred, confirming fix via multiple scenarios (anonymous before/after launch, with/without auth mode, with null launch_at).
