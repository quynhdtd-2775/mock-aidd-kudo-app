# Reviewer Report — Write Kudos Modal (Viết Kudo)

Scope: supabase/migrations/20260716100000_write_kudos.sql, lib/kudos/**, app/kudos-live-board/actions.ts,
components/kudos/write-kudo/**, components/kudos-live-board/{write-kudo-launcher,function-buttons,secondary-buttons}.tsx,
messages/{vi,en}.json (WriteKudo), all *.test.ts under these.

Verification run: `pnpm exec tsc --noEmit` (exit 0), `pnpm exec eslint lib/kudos components/kudos components/kudos-live-board app/kudos-live-board` (exit 0),
`pnpm exec vitest run lib/kudos components/kudos messages app/kudos-live-board` → 7 files / 90 tests passed.

## Score: 7.5/10
Solid feature: sanitizer has real test coverage of the dangerous cases (script/style/comment/event-handler/js-url stripping),
service-role client is correctly gated (`server-only` + `AUTH_MODE=mock` + `NODE_ENV!=production`), auth-guard + redirect
path is correct (`unstable_rethrow` used properly so `NEXT_REDIRECT` isn't swallowed), image-upload cleanup on failure is
covered by tests, i18n key parity is 100% (51/51). Two Major-severity issues below should be fixed before calling this
production-ready; nothing is an immediate must-fix-before-commit blocker given the mock-auth/no-Docker-verification state
the plan already accepts.

## Critical
None found.

## Major

1. **Recipient resolved by display-name string match, not by stable id — `components/kudos/write-kudo/use-recipient-search.ts:29-32`**
   ```ts
   const selectedReceiverId = useMemo(
     () => recipientOptions.find((option) => option.name === recipientQuery)?.id ?? null,
     [recipientOptions, recipientQuery],
   );
   ```
   `RecipientSelector` (`components/kudos/write-kudo/recipient-selector.tsx:35-57`) is a plain text `<input list=...>` bound to a
   `<datalist>`. There is no explicit "user picked option X" event — `<datalist>` just fills the text value, and this hook then
   re-resolves an id by matching that raw text against `option.name`. `profiles.display_name` has no uniqueness constraint
   (see `supabase/migrations/20260714070000_profile_schema.sql:9`), so two colleagues with the same display name make this
   pick whichever happens to be first in `recipientOptions` — silently sending the kudo (and any anonymous/attached content)
   to the wrong person. Server-side `createKudo` only validates that the id exists (`app/kudos-live-board/actions.ts:81-88`),
   it can't detect a wrong-but-valid id. Recommend: select from the dropdown via an explicit onClick/onSelect that stores
   `{id, name}` directly (a custom listbox instead of native `<datalist>`), not text-match after the fact.

2. **Storage insert RLS has no per-user path restriction + no server-side content verification — `supabase/migrations/20260716100000_write_kudos.sql:22-25`, `lib/kudos/upload-kudo-images.ts:14-21`**
   ```sql
   create policy "kudos-images insert by authenticated" on storage.objects
     for insert to authenticated
     with check (bucket_id = 'kudos-images');
   ```
   Any authenticated user can insert to *any* path in the bucket, not just their own `{senderId}/...` prefix — the app only
   writes under the caller's own id, but nothing stops a user from calling the Storage API directly (bypassing the server
   action) to write under someone else's prefix or with an oversized/arbitrary file. Compounding this, `validateImages()`
   trusts the client-declared `file.type` MIME only (no magic-byte sniffing), and `uploadKudoImages` passes that same
   attacker-controlled value straight through as `contentType` on upload (`lib/kudos/upload-kudo-images.ts:44-48`). Since the
   bucket is public, this allows arbitrary file content to be hosted publicly under a `image/png`/`image/jpeg` content-type
   label. Recommend: add a `with check (bucket_id = 'kudos-images' and (storage.foldername(name))[1] = auth.uid()::text)`
   clause to scope inserts to the caller's own folder, and consider server-side content-type sniffing (e.g. check magic
   bytes) before upload if this bucket's content is exposed to viewers beyond the uploader.

## Minor

3. **Href sanitizer accepts protocol-relative URLs as "safe" — `lib/kudos/sanitize-message-html.ts:10`**
   `SAFE_HREF_PROTOCOL = /^(https?:|mailto:|\/|#)/i` — the bare `\/` alternative matches the leading slash of `//evil.com`
   too (protocol-relative URL), so a link like `<a href="//evil.com">click</a>` (reachable via the toolbar's manual "link"
   prompt, `components/kudos/write-kudo/editor-toolbar.tsx:45-53`, or via pasted HTML) survives sanitization and renders as
   a same-protocol external link. Not script-executing XSS, but an open-redirect/phishing vector inside a message that looks
   internal. Tighten the regex to reject a href starting with `//` (e.g. `/^(https?:|mailto:|#|\/(?!\/))/i`).

4. **Hashtags stored as a single comma-joined text column with no comma-escaping — `app/kudos-live-board/actions.ts:62-65,103`, `lib/kudos/kudos-queries.ts:44-49`**
   Free-text hashtag creation (`hashtag-suggestion-popover.tsx`) never rejects a value containing a comma. `hashtags.join(",")`
   on insert and `.split(",")` on read (`getHashtagSuggestions`) means a tag literally typed as `"a,b"` silently becomes two
   tags `"a"` and `"b"` after a round trip, and also could let a 1-hashtag submission bypass the "min 1" rule's intent by
   smuggling multiple tags past the `hashtags.length` cap check (e.g. one input string `"a,b,c,d,e,f"` counts as 1 array
   entry client-side, passing `<=5`, but expands to 6 stored tags). Add a comma-rejection (or general allowlist regex) in
   the add-hashtag path, both client (`hashtag-suggestion-popover.tsx`) and server (`createKudo`).

5. **`getHashtagSuggestions` does an unbounded full-table scan — `lib/kudos/kudos-queries.ts:37-56`**
   `supabase.from("kudos").select("hashtags")` has no `.limit()`; every popover open pulls every kudos row ever created to
   dedupe hashtags client-side in JS. Fine at today's scale, but will degrade linearly as the table grows. Consider a
   dedicated `distinct`-style query or a capped/materialized tag list before this ships broadly.

6. **`.env.local.example` doesn't document the new `SUPABASE_SERVICE_ROLE_KEY` requirement** — `kudos-service-client.ts`
   throws `"...must both be set"` if a dev sets `AUTH_MODE=mock` (which the example file does set) without also setting
   `SUPABASE_SERVICE_ROLE_KEY`, which isn't mentioned anywhere in `.env.local.example`. Any teammate following the example
   file hits an opaque runtime error the first time they submit a kudo. Add the var + a one-line comment on how to get it
   (`supabase status`).

7. **`searchProfilesAction` / `getHashtagSuggestionsAction` have no in-function auth check** — `app/kudos-live-board/actions.ts:21-27`.
   They rely entirely on `proxy.ts`'s matcher (`config.matcher` in `proxy.ts:9`) redirecting unauthenticated page loads before
   the action is ever invoked. That matcher does look broad enough to cover `/kudos-live-board` POSTs, so this isn't
   currently exploitable, but it's a single point of failure — if the matcher regex is ever narrowed, these two actions
   silently become open, unauthenticated data-leak endpoints (profile display names/avatars, all historical hashtags).
   Recommend an explicit `resolveCurrentUserId()` guard inside both actions for defense-in-depth, matching what `createKudo`
   already does.

## Nit

8. No check that `receiverId !== senderId` (self-kudo). Not in the spec/clarifications, so not a defect, just flag in case
   product wants to block it later.
9. `sanitize-message-html.ts` allowlists `ol`/`li` but not `ul` — consistent with the toolbar only offering a numbered-list
   button (no bullet list), so not a bug, just worth a one-line comment noting the intentional omission so a future
   contributor adding a bullet-list button remembers to update the sanitizer allowlist too.

## Positive Observations
- `sanitize-message-html.test.ts` directly exercises the OWASP-relevant cases (script/style/comment stripping, event-handler
  attrs, js/data/vbscript href schemes, mention data-attr allowlist with an injection payload) — good security test hygiene.
- `createServiceRoleClient` is properly isolated behind `import "server-only"` and a double-gated `isMockAuthEnabled()`
  (`AUTH_MODE=mock` AND `NODE_ENV!=production`) — can't leak into the client bundle or activate in a real prod build.
- `unstable_rethrow(err)` correctly precedes the generic catch handler in `use-write-kudo-form.ts:106`, so the server
  action's `redirect("/login")` (a thrown `NEXT_REDIRECT`) propagates to Next's router instead of being shown as a generic
  "insert failed" error — this is the correct, easy-to-get-wrong pattern.
- Migration is properly idempotent (`add column if not exists`, `drop policy if exists` + `create policy`, storage bucket
  `on conflict do nothing`), matches the "no Docker yet" constraint in the plan.
- `attachment_count` sync (`uploadResult.urls.length`) and cleanup-on-insert-failure (`removeKudoImages`) both have direct
  test coverage (`app/kudos-live-board/actions.test.ts`, `lib/kudos/upload-kudo-images.test.ts`).
- i18n key-set parity between `vi.json`/`en.json` WriteKudo namespace is exact (51/51 keys both sides), and there's an
  automated parity test (`messages/message-keys.test.ts`) guarding against future drift.
- All touched files are under the 200-line limit (largest non-test file is `write-kudo-modal.tsx` at 126 lines); naming is
  consistent kebab-case throughout.

## Unresolved Questions
- Is `profiles.display_name` intended to be unique org-wide? If yes, add a unique constraint/index and this Major #1
  mostly resolves itself (still worth the UX fix of selecting by id, but risk drops). If names can legitimately collide
  (common in a real company directory), #1 needs the UI fix.
- Is the `kudos-images` bucket meant to ever host content viewers other than the uploader interact with untrusted (e.g.
  rendered directly by URL from other origins)? If it's purely `<Image>`-rendered inside this Next app, the content-type
  spoofing risk in #2 is lower-severity than stated; flagging it as Major assumed the more cautious reading.

**Status:** DONE_WITH_CONCERNS

---

## Re-review (260716-1741) — Focused verification of fixes

Independently re-verified: `pnpm exec tsc --noEmit` (exit 0), `pnpm exec eslint lib/kudos components/kudos
components/kudos-live-board app/kudos-live-board` (exit 0), `pnpm exec vitest run` → 17 files / 292 tests passed.
Matches the coordinator's reported numbers.

### Per-finding verdict

| # | Finding | Verdict | Evidence |
|---|---|---|---|
| MAJOR-1 | Recipient resolved by name string-match | **Closed** | New `recipient-selection-state.ts` (pure `{query, selectedId}` transitions, `applyQueryChange` always nulls `selectedId`, `applySelection` sets both from an explicit `RecipientOption`) + `.test.ts` covers the exact duplicate-display-name case (`two different profiles sharing the same display name resolve to distinct ids`). `recipient-selector.tsx` no longer uses `<datalist>` — replaced with `RecipientSuggestionList`, a real click-driven listbox. `use-recipient-search.ts` exposes `selectRecipient`/`selectedReceiverId` sourced only from `selection.selectedId`. `use-write-kudo-form.ts:64,80` and `write-kudo-modal.tsx:58-64` wire `onSelect={form.selectRecipient}` — `canSubmit`/`handleSubmit` never touch display-name text for the id. Verified end-to-end, no leftover string-matching path. |
| MAJOR-2 | Storage RLS + unverified upload content | **Closed** | Migration `20260716100000_write_kudos.sql:26-31` insert policy now requires `(storage.foldername(name))[1] = auth.uid()::text`. `upload-kudo-images.ts` adds `sniffImageType()` (real JPEG `FFD8FF` / PNG 8-byte signature check on the file's actual bytes via `file.slice().arrayBuffer()`), rejects with `invalid_image_type` before any upload if the sniff fails, and passes `contentType: sniffedType` (not client `file.type`) to `.upload()`. Path is still `{senderId}/...`, consistent with the new RLS clause since `senderId` in the real (non-mock) path comes from `supabase.auth.getUser()` = `auth.uid()`. Tests added for sniff-mismatch (single file, and mid-batch with cleanup of the already-uploaded file) — both pass. |
| MINOR-3 | Protocol-relative href bypass | **Closed** | `SAFE_HREF_PROTOCOL` changed to `/^(https?:|mailto:|#|\/(?!\/))/i` — negative lookahead correctly rejects a second leading slash. New test cases `strips protocol-relative hrefs ... MINOR-3` cover `//evil.com` and `//evil.com/path?x=1`, both stripped to `<a>click</a>`. Confirmed regex logic by hand: `//evil.com` fails all four alternatives (no `https?:`, no `mailto:`, no `#`, and `\/(?!\/)` fails because the char after the first `/` is another `/`). |
| MINOR-4 | Comma-joined hashtags corruption | **Closed** | Client: `hashtag-suggestion-popover.tsx:61` strips commas as typed (`.replace(/,/g, "")`). Server: `actions.ts:75-77` rejects any hashtag containing a comma with a new `invalid_hashtag` code, checked *before* the count-cap check (also closes the "smuggle extra tags past the 5-cap via one comma-joined string" variant noted in the original finding). New error code is fully wired: `kudos-types.ts:32` (`CreateKudoErrorCode`), `map-create-kudo-error.ts:14` (`errorInvalidHashtag`), both `en.json`/`vi.json:244` have the string. No dangling references. |
| MINOR-6 | Missing `SUPABASE_SERVICE_ROLE_KEY` doc | **Closed** | `.env.local.example` now has the var with a clear comment (why it's needed, how to get the value via `supabase status`), placed right before `AUTH_MODE=mock` so the dependency reads naturally. |
| MINOR-7 | No in-function auth guard on read actions | **Closed** | `searchProfilesAction`/`getHashtagSuggestionsAction` (`actions.ts:26-36`) now call `resolveCurrentUserId()` and return `[]` when unauthenticated, with a comment explaining this is defense-in-depth against the `proxy.ts` matcher being narrowed later. Matches the pattern `createKudo` already used. |
| MINOR-5 | Unbounded `getHashtagSuggestions` full-table scan | **Not fixed (deliberately, YAGNI)** | Confirmed still unbounded in `kudos-queries.ts` — acceptable per coordinator's explicit skip decision; not a regression, just intentionally deferred. |

### Regression check

- **Recipient selector rewrite (keyboard/blur):** `RecipientSuggestionList` renders real `<button type="button">` options, so
  Tab + Enter/Space still lets a keyboard-only user reach and pick an option — the security-relevant property (explicit
  id-carrying selection) holds regardless of input method. However, this is a genuine UX regression versus the old native
  `<datalist>`: there is no arrow-key (↑/↓) navigation within the list and no `Escape`-to-close handler — `recipient-selector.tsx`
  only closes the dropdown on `pointerdown` outside (`useEffect` at line 37-43) or on an explicit `onSelect`. A keyboard-only
  user tabbing away leaves the dropdown visually open until the next outside pointer event. **New finding — Minor (UX/a11y,
  not a correctness or security regression).** Recommend adding `onKeyDown` handling (Escape to close, optionally ↑/↓ to move
  a highlighted index) to `recipient-selector.tsx`/`recipient-suggestion-list.tsx`.
- **Test helper magic-byte embedding:** `upload-kudo-images.test.ts` and `actions.test.ts` both updated their `makeFile()`
  helpers to embed real JPEG/PNG magic bytes by default (`JPEG_MAGIC`/`PNG_MAGIC` prefixed into the byte array), so all
  pre-existing happy-path tests (which construct fake images) still pass the new sniff check without being weakened —
  the sniff-failure paths use separate helpers/calls that deliberately omit the magic bytes. No test was loosened to
  paper over the new check; this is exactly the right way to keep old tests honest against a new invariant.
- Re-ran the full suite independently (not just trusting the coordinator's numbers) — 292/292 green, tsc/eslint clean.
- No other file in the original review scope was touched in a way that reopens any other prior finding (spot-checked
  `sanitize-message-html.ts` allowed-tags list, storage bucket provisioning, i18n parity — all unchanged/still correct).

### New findings
- **Minor (new):** Recipient dropdown lost keyboard arrow-nav / Escape-to-close from the old native `<datalist>` (see
  Regression check above). Not blocking; recommend follow-up before this ships broadly to keyboard/screen-reader users.

### Updated Score: 9/10
All Critical/Major findings closed with correct, well-tested fixes; the one deliberately-skipped Minor (#5) is an
accepted YAGNI tradeoff, not an oversight. Docked half a point for the new keyboard/a11y regression on the recipient
picker, half a point for MINOR-5 remaining open (by design).

**Status:** DONE

---

## Session 260722 delta review — grants migration + ALL KUDOS live feed

Scope (uncommitted, `git status --short` on `feat.some-page`): `supabase/migrations/20260722070000_grant_table_privileges.sql`
(new), `supabase/config.toml` (analytics disabled), `lib/format/kudo-display-format.ts` + `.test.ts` (new, extracted from
`lib/profile/profile-view-mappers.ts`), `lib/kudos/kudos-feed-queries.ts` (new), `lib/kudos/kudo-feed-mapper.ts` +
`.test.ts` (new), `lib/kudos/kudos-types.ts` (feed types), `lib/profile/profile-view-mappers.ts` (import re-point),
`components/kudos-live-board/{live-board-all-kudos.tsx,kudo-post-card.tsx,kudo-posts-data.ts}`,
`messages/{vi,en}.json` (`LiveBoard.allKudosEmpty`), `supabase/seed.sql` (HTML-ified messages, `image_urls`, anonymous row).

Independently re-verified: `pnpm exec tsc --noEmit` (exit 0, clean), `pnpm exec eslint lib/kudos lib/format lib/profile
components/kudos-live-board app/kudos-live-board` (exit 0, clean), `pnpm exec vitest run` → 19 files / 310 tests passed.
Matches the coordinator's claimed numbers. Did not re-verify the live browser round-trip (task marked that
live-verified already) — took it as given.

### Spot-check of the 5 prior fixes (untouched by today's diff, confirmed still present)

| Fix | File | Verdict |
|---|---|---|
| Recipient selection carries explicit id | `components/kudos/write-kudo/recipient-selection-state.ts:15,24-25,32-33` | Present — `applyQueryChange` nulls `selectedId`, `applySelection` sets both fields from an explicit `RecipientOption` only |
| Magic-byte sniffing on upload | `lib/kudos/upload-kudo-images.ts:40,69,71` | Present — `sniffImageType()` still gates upload, rejects on mismatch |
| Uid-scoped storage insert policy | `supabase/migrations/20260716100000_write_kudos.sql:26-31` | Present — `with check (bucket_id = 'kudos-images' and (storage.foldername(name))[1] = auth.uid()::text)` |
| Protocol-relative href rejection | `lib/kudos/sanitize-message-html.ts:14` | Present — `SAFE_HREF_PROTOCOL = /^(https?:|mailto:|#|\/(?!\/))/i` unchanged |
| `invalid_hashtag` comma rejection | `app/kudos-live-board/actions.ts:75-76` | Present — `hashtags.some((tag) => tag.includes(","))` still gates before insert |

None of these files appear in today's diff, so no regression risk here — confirmed by direct read, not just diff absence.

### Major

1. **`getAllKudos` silently swallows PostgREST-level errors — no logging at all, not even the `error` object —
   `lib/kudos/kudos-feed-queries.ts:36-46`**
   ```ts
   const { data, error } = await supabase.from("kudos").select(...)...;
   if (error || !data) return [];
   ```
   The `try/catch` around this only catches *thrown* exceptions (e.g. network failure before a response arrives) and
   logs those via `console.error("getAllKudos: query failed", err)` (line 63). But a Postgres/PostgREST error returned
   as data (exactly the `42501 permission denied` class of error that motivated today's grants migration — see the
   migration's own comment "every anon/authenticated read failed with 42501") does **not** throw; it resolves normally
   with `{ data: null, error: {...} }`. That branch is checked but never logged before falling through to `return [];`.
   Net effect: if the grants config ever regresses (a future migration narrows a GRANT, a `REVOKE` lands, RLS gets
   tightened), the ALL KUDOS feed will silently render the "no kudos yet" empty state — indistinguishable from a
   genuinely empty table — with **zero server-side signal** that anything is wrong. This is the same failure mode the
   team just spent a live-verification session diagnosing blind; right now a recurrence would be just as invisible.
   Recommend: `if (error) { console.error("getAllKudos: query failed", error); return []; }` (log the error object, not
   just the caught-exception path) — ideally paired with real error telemetry before this ships beyond local dev.

2. **Grants migration converts the pre-existing "anonymous sender_id leak" from latent to practically live —
   `supabase/migrations/20260722070000_grant_table_privileges.sql:10`, `lib/kudos/kudo-feed-mapper.ts:29-38`**
   `grant select on all tables in schema public to anon, authenticated` matches the existing "readable by all" RLS
   posture on all 5 public tables (confirmed: `profiles`, `kudos`, `secret_box_icons`, `user_icon_unlocks` in
   `20260714070000_profile_schema.sql:58-64`, `event_settings` in `20260714080000_event_settings.sql:22-23` — all
   identical `for select to anon, authenticated using (true)`), so this migration itself introduces no *new* table
   over-exposure — it's completing a posture that was already the explicit (if commented "do NOT ship to prod as-is")
   design intent. However: **before this migration, the missing GRANT meant literally nothing was readable via
   PostgREST — including `kudos.sender_id` on anonymous rows.** The anonymization in `toKudoFeedCards()` is
   app-layer-only (the joined `sender` object is simply never read into the card when `item.isAnonymous`); Postgres RLS
   filters *rows*, not *columns*, so `kudos readable by all` was always going to expose `sender_id` in full once reads
   worked at all. This migration is what makes `sender_id` on an anonymous kudos row now genuinely fetchable by anyone
   holding the anon key via a direct REST call (`/rest/v1/kudos?select=sender_id,is_anonymous&is_anonymous=eq.true`),
   defeating the entire point of the anonymous-post feature for a moderately technical user. Per the task framing this
   is a pre-existing schema-design gap, not a new bug to fix now — but it is worth being precise that today's delta is
   what activates it. Recommend (do not implement): stop granting `select` on `public.kudos` directly to
   `anon`/`authenticated`; instead expose a `security_invoker` view (e.g. `kudos_public`) that projects
   `case when is_anonymous then null else sender_id end as sender_id`, revoke direct table select for those roles, and
   grant select on the view instead. Column-level `GRANT SELECT (col, col) ON kudos TO anon` doesn't help here since it
   can't be conditioned on `is_anonymous`'s value per-row.

### Minor

3. **Dead code: `KUDO_POSTS` in `components/kudos-live-board/kudo-posts-data.ts:35-100`** — no longer imported anywhere
   (`live-board-all-kudos.tsx` now calls `getAllKudos()`/`toKudoFeedCards()`; only the `KudoPostData` type export is
   still consumed). ~65 lines of unused mock data. YAGNI — remove, or repurpose explicitly as a Storybook/test fixture
   if still wanted for that.
4. Grants migration's blanket table-select posture (Major #2 above) is a repeat of the same "local-dev only, revisit
   before real deployment" caveat already on record in `20260714070000_profile_schema.sql:51-52` and
   `20260714080000_event_settings.sql:17-19` — flagging again here so it doesn't get lost as the migration count grows.

### Nit

5. `kudo-post-card.tsx` keys the real `imageUrls` map on `src + index` — fine in practice (real storage URLs are unique
   per upload), but `src` alone would be a more meaningful key if two rows could ever share a URL; not a real risk today.

### Correctness verification (delta-specific)

- **Mapper anonymization completeness** (`lib/kudos/kudo-feed-mapper.ts:29-38`): direct read + test suite
  (`kudo-feed-mapper.test.ts:55-76`) confirm `senderName`/`senderHeroCode`/`senderBadge`/`senderAvatarSrc` are all
  replaced/defaulted when `isAnonymous`, `receiver` fields are left untouched (correct — only the sender is
  anonymized), and the joined `sender.displayName` is asserted to never leak into the card
  (`expect(card.senderName).not.toBe(SENDER.displayName)`). Solid.
- **`formatHashtagsDisplay` legacy vs comma-joined** (`lib/format` — actually `lib/kudos/kudo-feed-mapper.ts:13-20`):
  correctly idempotent on legacy pre-formatted seed strings (`"#Dedicated #Inspring..."` → unchanged, no double `#`,
  no comma to split on) and correctly expands modal-written comma-joined bare tags (`"LiveTest,TeamWork"` →
  `"#LiveTest #TeamWork"`); trims and drops empty segments. Tests cover all three cases.
- **Empty-feed state**: `live-board-all-kudos.tsx:30-39` correctly gates on `cards.length > 0`, new `allKudosEmpty` key
  present in both `en.json`/`vi.json` (parity enforced by the existing `messages/message-keys.test.ts`, part of the
  310 green tests).
- **`getAllKudos` error handling**: see Major #1 — the `[]`-on-error fallback itself (keeping the page rendering when
  the DB read fails) is the right *behavior*; the gap is purely the missing log line.
- **XSS / `dangerouslySetInnerHTML`** (`components/kudos-live-board/kudo-post-card.tsx:79-85`): only ever receives
  `post.messageHtml`, which is populated exclusively by `sanitizeMessageHtml(item.message)` inside
  `toKudoFeedCards()` (`kudo-feed-mapper.ts:53`) — no other code path sets `messageHtml`. Sanitization is re-applied at
  *read* time regardless of how `message` got into the DB (modal writes already-sanitized HTML; `seed.sql` writes
  hand-authored HTML directly, bypassing the app layer entirely) — `kudo-feed-mapper.test.ts:102-108`
  ("re-sanitizes the message HTML on read (defense-in-depth)") directly proves a `<script>` + `onclick` payload
  embedded in `message` gets stripped to `<p>hi</p>` before render. This is exactly the right defense-in-depth
  posture given `seed.sql` and any future direct-DB writers don't go through `sanitize-message-html.ts` on write.

### Regression check
- `lib/profile/profile-view-mappers.ts` re-point to `lib/format/kudo-display-format.ts`: `formatCount`/`formatKudoTime`
  extracted verbatim (byte-identical logic, confirmed by diff), all profile-page call sites (`profile-view-mappers.ts:48-52,73,78`)
  updated to the new import — no behavior change, `tsc`/`vitest` confirm no breakage.
- `kudo-posts-data.ts` `KudoPostData` interface gained 3 optional fields (`messageHtml`, `senderAvatarSrc`/`receiverAvatarSrc`,
  `imageUrls`) — additive, optional, backward compatible with the (now-dead, see Minor #3) `KUDO_POSTS` mock array.
- `kudo-post-card.tsx` avatar/image rendering: correctly falls back to the original static design assets
  (`avatarSrc="/kudos-live-board/avatar-sender.png"` etc.) via `??` when real data is absent — no broken-image risk for
  any row still missing profile/image data.
- No prior review scope file (sanitizer allowlist, storage RLS, recipient selection, hashtag validation) was touched by
  today's diff — confirmed by absence from `git status --short` and direct reads above.

### Updated Score: 8/10
A real production bug fixed correctly (missing GRANTs, the actual root cause, not a workaround), clean feed-wiring with
solid mapper test coverage and correct XSS defense-in-depth at read time. Docked for one genuine Major (silent
PostgREST-error swallowing that would hide a recurrence of the exact bug class this session just fixed) and for
surfacing — now practically live rather than latent — the anonymous-sender-id read exposure, which is accurately
flagged as pre-existing/by-design-for-now but should not go further without the view-based fix outlined above.

**Status:** DONE_WITH_CONCERNS

