# Phase 03 — Server Actions + Data Queries

Track: B · Depends on: phase-02 (schema) · Parallel with Track A

## Context / Patterns to follow
- Server action pattern: `app/login/actions.ts`, `app/auth/actions.ts` (`"use server"`, try/catch, i18n via `getTranslations`).
- Auth resolution: `lib/profile/current-user.ts` → `resolveCurrentUserId()` (handles mock + real).
- Supabase server client: `lib/supabase/server.ts` → `createClient()`.
- Read `node_modules/next/dist/docs/` before writing — Next.js 16 has breaking changes.

## Files to Create (Track B owns `lib/kudos/**`)
- `lib/kudos/kudos-types.ts` — `CreateKudoInput`, `CreateKudoResult`, `ProfileSuggestion`.
- `lib/kudos/sanitize-message-html.ts` — allowlist sanitizer (tags: p, br, strong/b, em/i, s,
  ol, li, a[href], blockquote, span[data-mention,data-id]). Uses `sanitize-html` (installed phase-04).
- `lib/kudos/kudos-queries.ts` — `searchProfiles(q)` (`profiles` display_name `ilike %q%`, trim,
  min 1 char, limit ~8); `getHashtagSuggestions()` (distinct non-empty `hashtags` from `kudos`).
- `lib/kudos/upload-kudo-images.ts` — validate (≤5, jpg/png, size cap), upload to `kudos-images`,
  return public URLs. On partial failure → cleanup uploaded, return error.
- `app/kudos-live-board/actions.ts` — `"use server"`:
  - `searchProfilesAction(q)` and `getHashtagSuggestionsAction()` (thin wrappers over queries).
  - `createKudo(input)`:
    1. `userId = resolveCurrentUserId()`; if null → `redirect('/login')` (auth guard).
    2. Validate: recipient is existing profile id; message non-empty after sanitize+strip;
       hashtags 1–5; images ≤5 jpg/png. Return field errors, no throw.
    3. Sanitize message HTML.
    4. Upload images → URLs.
    5. Insert row: sender_id=userId, receiver_id, message(sanitized), hashtags(joined),
       hashtag_title(first), image_urls, attachment_count=urls.length, is_anonymous, anonymous_name.
    6. Return `{ ok: true }` (client does `router.refresh()` + close). On DB error → `{ error }`.

## Data Flow
`createKudo` is pure server logic returning a serializable result — the client component owns
modal close + `router.refresh()`. Queries are callable from the client via action wrappers.

## File Ownership
`lib/kudos/**`, `app/kudos-live-board/actions.ts`. Does NOT edit `package.json` (deps installed phase-04)
nor `function-buttons.tsx` (phase-04). No overlap with Track A's `components/kudos/write-kudo/**`.

## Todo
- [x] kudos-types.ts
- [x] sanitize-message-html.ts (allowlist)
- [x] kudos-queries.ts (searchProfiles, getHashtagSuggestions)
- [x] upload-kudo-images.ts (validate + upload + cleanup)
- [x] actions.ts (createKudo + query wrappers, auth guard, validation)

## Success Criteria
Given a valid input + authenticated user, `createKudo` inserts exactly one sanitized row and
returns `{ ok: true }`; invalid inputs return structured field errors without throwing;
unauthenticated → redirect to `/login`.

## Risk Assessment
| Risk | L | I | Mitigation |
|------|---|---|-----------|
| Mock-auth anon insert rejected by RLS | High | High | In `createKudo`, when `isMockAuthEnabled()`, use a service-role client for the insert (server-only key from env) OR document that end-to-end submit needs real Supabase auth. Keep prod path on anon+RLS. Escalate key choice to user. |
| XSS via message HTML | Med | High | Strict server-side allowlist sanitize; never trust client HTML. Store sanitized only. |
| Orphan images if insert fails | Med | Low | Upload after validation; on insert error, best-effort delete uploaded objects. |
| Next.js 16 action API drift | Med | Med | Read `node_modules/next/dist/docs/` first; verify, don't guess. |

## Rollback
Delete `lib/kudos/**` + `app/kudos-live-board/actions.ts` — no schema/data change here.

## Security
Auth guard on every mutation; RLS enforces `sender_id = auth.uid()`; sanitized HTML only;
image type/size validation server-side; no secrets in client bundle.
