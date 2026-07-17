# Phase 05 — Tests

Track: B · Depends on: phase-03 (code) — run after phase-04 (deps installed)

## Context
- Vitest configured (`vitest.config.ts`). Reference: `lib/supabase/middleware.test.ts`,
  `lib/profile/current-user.test.ts`, `messages/message-keys.test.ts`.
- CONSTRAINT: no live Supabase (Docker blocked). Tests MUST mock the Supabase client — no DB calls.

## Test Matrix
| Target | Type | Cases |
|--------|------|-------|
| `sanitize-message-html.ts` | unit | strips script/onclick/disallowed tags; keeps allowlist (b/i/s/ol/li/a/blockquote/mention); empty-after-strip detection |
| `kudos-queries.ts` | unit (mock client) | searchProfiles trims + min-1-char guard + ilike query shape; getHashtagSuggestions dedupes, drops empties |
| `upload-kudo-images.ts` | unit (mock storage) | rejects >5, non-jpg/png, oversized; returns URLs on success; cleanup on partial failure |
| `createKudo` (actions) | unit (mock client + resolveCurrentUserId) | unauth → redirect; missing recipient/message/hashtags → field errors; valid → insert called once with sanitized+joined payload; DB error → `{ error }` |
| `messages` | unit | WriteKudo key parity vi/en (extend existing message-keys.test if needed) |

## File Ownership (tester owns test files only)
- Create: `lib/kudos/*.test.ts`, `app/kudos-live-board/actions.test.ts`
- Mock `@/lib/supabase/server`, `@/lib/profile/current-user`, `next/navigation`.

## Todo
- [x] sanitize-message-html.test.ts
- [x] kudos-queries.test.ts
- [x] upload-kudo-images.test.ts
- [x] actions.test.ts (createKudo)
- [ ] locale parity assertion for WriteKudo — BLOCKED: no `WriteKudo` namespace exists yet in
      `messages/en.json` / `messages/vi.json` (Track A UI work, out of file-ownership scope for
      this phase). The existing `messages/message-keys.test.ts` already asserts vi/en key-set
      parity globally, so it will automatically cover `WriteKudo` once those keys are added —
      no new test needed at that point.

## Success Criteria
`pnpm test` (or `pnpm vitest run`) green with no live Supabase; error paths + auth guard covered;
no mocked-away assertions that hide the insert payload shape.

## Risk Assessment
| Risk | L | I | Mitigation |
|------|---|---|-----------|
| Over-mocking hides real insert shape | Med | Med | Assert on exact args passed to `.insert()`; do not stub the mapper. |
| `redirect()` throws in tests | Low | Low | Mock `next/navigation.redirect`; assert it was called. |

## Rollback
Delete test files — no production impact.
