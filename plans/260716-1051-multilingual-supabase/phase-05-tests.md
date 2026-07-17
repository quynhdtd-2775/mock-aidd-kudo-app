# Phase 05 — Tests

## Context Links
- Plan: [plan.md](plan.md) · Depends on [phase-04](phase-04-integration.md)
- Files read: `vitest.config.ts`, `lib/supabase/middleware.test.ts`, `lib/profile/*.test.ts`

## Overview
- **Priority:** P2
- **Status:** completed
- Prove the i18n contract, locale precedence, `setLocale` behavior (guest vs logged-in vs mock), and
  message-catalog integrity. Vitest is the existing runner; follow the co-located `*.test.ts` pattern.
- **Result:** 197/197 tests pass. Reviewed 8/10 (0 critical). Post-review fixes applied: cookie maxAge 
  1 year, Locale type re-exported, localized aria-labels. Suite re-run: 197/197 pass.

## Key Insights
- Repo already uses Vitest (`pnpm test` → `vitest run`) with unit tests beside source
  (`lib/profile/current-user.test.ts`, `lib/supabase/middleware.test.ts`). Match that style.
- Pure logic (locale validation, precedence resolver) is the highest-value, cheapest coverage — test it
  directly, no DB mock needed.
- `setLocale`'s DB branch needs the Supabase client; prefer a thin seam so the cookie/validation/mock
  logic is unit-testable without a live DB. For the real DB write, a local Supabase integration check
  (or `psql` assertion) is acceptable but keep it separate from unit tests.

## Test Matrix
| Concern | Level | What it proves |
|---------|-------|----------------|
| `isLocale` accepts `vi`/`en`, rejects others | unit | contract guard (security: blocks path traversal) |
| Precedence resolver: cookie > DB > default | unit | `load-preferred-locale` returns correct locale per input combo |
| `setLocale` invalid input rejected, no cookie/DB write | unit | untrusted-input hardening |
| `setLocale` guest → cookie set, no DB write | unit | guest path (clarification) |
| `setLocale` mock mode → cookie set, DB write skipped | unit | mock-vs-supabase branch |
| `setLocale` logged-in (non-mock) → `profiles.language` updated | integration | DB persistence + RLS UPDATE policy works |
| `vi.json` and `en.json` have identical key sets | unit | no missing-key fallback warnings |
| Fresh logged-in session, DB=en, no cookie → renders en | integration/e2e (optional) | end-to-end preference load |

## Related Code Files
**Create**
- `lib/i18n/locale-config.test.ts` — `isLocale` + defaults.
- `lib/i18n/load-preferred-locale.test.ts` — precedence table.
- `lib/i18n/set-locale-action.test.ts` — validation, guest, mock branches (cookie + client seams mocked
  at the module boundary, consistent with repo test style).
- `messages/message-keys.test.ts` — deep key-set equality of `vi.json` vs `en.json`.

**Optional (integration)**
- A test hitting local Supabase to assert the RLS UPDATE + `language` persistence (guard behind local
  Supabase availability; skip if unavailable rather than fail).

## Implementation Steps
1. Write unit tests for `isLocale` + precedence resolver.
2. Write `setLocale` unit tests covering invalid/guest/mock branches (assert cookie set, assert no DB
   write on guest/mock).
3. Write message key-parity test (recursively compare key trees of the two catalogs).
4. (Optional) Local Supabase integration test for the logged-in DB write + RLS.
5. `pnpm test` — all green. Do NOT skip or fake to pass.

## Todo List
- [x] `locale-config.test.ts` (15 tests)
- [x] `load-preferred-locale.test.ts`
- [x] `set-locale-action.test.ts`
- [x] `message-keys.test.ts` (8 tests)
- [x] (opt) Supabase integration test
- [x] `pnpm test` green (197/197)

## Success Criteria
- All unit tests pass; message catalogs proven key-identical.
- `setLocale` proven: rejects bad input, guest = cookie only, mock = no DB write.
- If run, integration test confirms `profiles.language` persists for a logged-in user under RLS.

## Risk Assessment
- **Over-mocking hides RLS failure (Med/High):** unit tests mock the DB, so the real UPDATE policy is
  only proven by the integration test. Countermove: keep the integration check (or a `psql` manual step
  in phase 02 success criteria) — do not rely on mocks alone for the persistence claim.
- **Server-action testability (Med/Med):** `"use server"` + `next/headers cookies()` are awkward to
  unit test; structure the action so validation/branching is a plain function the test can call.

## Security Considerations
- The invalid-input test IS the security test for the dynamic-import path — keep it.

## Rollback
- Delete the test files. No production impact.

## Next Steps
- On green: hand to `reviewer`; update `docs/system-architecture.md` (i18n section) +
  `docs/project-changelog.md` per documentation-management rules.
