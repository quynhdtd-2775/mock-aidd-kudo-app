# Phase 06 — Seed Kudos + Wire ALL KUDOS Feed to Real Data

Track: B (follow-on) · Depends on: 02, 03, 04, 05 (all completed) · No parallel track

## Context / Patterns to reuse (DRY — do NOT re-invent)
- **DB→card mapper + formatters already exist** in `lib/profile/profile-view-mappers.ts`:
  `formatKudoTime(iso)` → `"10:00 - 10/30/2025"` (Intl, `timeZone: "Asia/Ho_Chi_Minh"`, `hour12:false`)
  and `formatCount(n)` → `"1.000"` (`toLocaleString("vi-VN")`). Both are module-private and TESTED
  via `profile-view-mappers.test.ts`. Extract, don't duplicate.
- **Join query pattern**: `lib/profile/profile-queries.ts` → `getReceivedKudos()` joins
  `kudos` ↔ `profiles!kudos_sender_id_fkey`, `.order("created_at", {ascending:false})`,
  guards to-one join as array (`Array.isArray(row.sender) ? row.sender[0] : row.sender`),
  returns `[]` on error (graceful degrade when DB down).
- **Sanitizer**: `lib/kudos/sanitize-message-html.ts` → `sanitizeMessageHtml(html)`.
- Card component: `components/kudos-live-board/kudo-post-card.tsx` (renders one post).
- Feed section: `components/kudos-live-board/live-board-all-kudos.tsx` (server component).
- i18n: `messages/{vi,en}.json` `LiveBoard` namespace; `message-keys.test.ts` enforces parity.
- Read `node_modules/next/dist/docs/` before touching server components — Next.js 16 breaking changes.

## Data Flow
```
public.kudos (+ sender/receiver profile joins)
  → getAllKudos()            [lib/kudos/kudos-feed-queries.ts]  — order created_at desc, limit 100, [] on error
  → KudoFeedItem[]           [type in lib/kudos/kudos-types.ts]
  → toKudoFeedCards(items)   [lib/kudos/kudo-feed-mapper.ts]    — PURE, server-side; anonymize; format
  → KudoPostData[]
  → LiveBoardAllKudos (async server component) → KudoPostCard (per row)   OR empty-state string
```
Mapping runs server-side, so anonymous rows never serialize sender identity to the client.

## Files to Create (owns `lib/kudos/**` new files + `lib/format/**`)
- `lib/format/kudo-display-format.ts` — extract `formatKudoTime` + `formatCount` verbatim from
  `profile-view-mappers.ts`, export both. Pure, no deps beyond Intl.
- `lib/kudos/kudos-feed-queries.ts` — `getAllKudos(): Promise<KudoFeedItem[]>`. Select
  `id, hashtag_title, message, attachment_count, hashtags, hearts_count, image_urls, is_anonymous,
  anonymous_name, created_at` + sender join (`profiles!kudos_sender_id_fkey (display_name, hero_code,
  hero_badge, avatar_url)`) + receiver join (`profiles!kudos_receiver_id_fkey (...)`).
  `.order("created_at",{ascending:false}).limit(100)`. Guard array joins. `[]` on error/exception.
- `lib/kudos/kudo-feed-mapper.ts` — `toKudoFeedCards(items: KudoFeedItem[]): KudoPostData[]`, PURE.
  Uses `formatKudoTime`, `formatCount`. Per row:
  - `messageHtml = sanitizeMessageHtml(item.message)` (defense-in-depth re-sanitize on read).
  - `imageUrls = item.imageUrls` (may be empty), `attachmentCount = item.attachmentCount`.
  - **Anonymous** (`item.isAnonymous`): `senderName = item.anonymousName?.trim() || "Ẩn danh"`,
    `senderHeroCode = ""`, `senderBadge = "new"`, `senderAvatarSrc = undefined` (→ card default asset).
    Drop the joined sender identity entirely — never map it.
  - Non-anon: sender fields from the sender join; receiver fields from the receiver join.

## Files to Modify
- `lib/profile/profile-view-mappers.ts` — delete the two local `formatKudoTime`/`formatCount`
  copies, import them from `@/lib/format/kudo-display-format`. Behavior identical → profile tests
  stay green. (Same-plan-owner edit; not touched by any parallel phase.)
- `components/kudos-live-board/kudo-posts-data.ts` — extend `KudoPostData` with OPTIONAL fields
  only: `messageHtml?: string`, `senderAvatarSrc?: string`, `receiverAvatarSrc?: string`,
  `imageUrls?: string[]`. `KUDO_POSTS` mock array stays untouched → mock render path unchanged.
- `components/kudos-live-board/kudo-post-card.tsx`:
  - Message body: if `post.messageHtml` present → render via
    `dangerouslySetInnerHTML={{ __html: post.messageHtml }}` (already sanitized); else keep
    `{post.message}` plain-text branch. (Mock rows have no `messageHtml` → unchanged.)
  - Avatars: `post.senderAvatarSrc ?? "/kudos-live-board/avatar-sender.png"` and
    `post.receiverAvatarSrc ?? "/kudos-live-board/avatar-receiver.png"`.
  - Attachments: if `post.imageUrls?.length` → map real URLs; else keep
    `attachmentCount` placeholder loop (design-parity for seed rows without uploads).
- `components/kudos-live-board/live-board-all-kudos.tsx` — make `async`; replace `KUDO_POSTS` with
  `const cards = toKudoFeedCards(await getAllKudos());`. If `cards.length === 0` → render empty-state
  paragraph using `t("allKudosEmpty")` (via `getTranslations("LiveBoard")`). Sidebar
  (`StatsOverviewPanel`, `GiftReceiversPanel`) and header stay exactly as-is.
- `messages/vi.json` + `messages/en.json` — add `LiveBoard.allKudosEmpty`
  (vi: "Chưa có lời cảm ơn nào." / en: "No kudos yet.").
- `supabase/seed.sql` — three adjustments (reuse existing verbatim Figma content, invent nothing):
  1. Rewrite each `message` as sanitized HTML matching modal output: wrap in `<p>…</p>` and escape
     the literal `<3` → `&lt;3` (raw `<3` would be mangled once the card renders HTML).
  2. Populate `image_urls` for the titled rows with the design's sample asset path(s)
     (`'{"/kudos-live-board/sample-image.png"}'`) so real-URL rendering is exercised; leave
     `attachment_count` for placeholder-path rows.
  3. Add ONE anonymous kudos row: `is_anonymous = true`, `anonymous_name = null`, newest
     `created_at` (renders top), message reusing existing seed content — exercises the "Ẩn danh" path.

## Tests (owns new `*.test.ts`; node env, no jsdom)
- `lib/format/kudo-display-format.test.ts` — `formatKudoTime` (fixed known ISO → exact string,
  TZ-stable), `formatCount` (0, 1000 → "1.000", large).
- `lib/kudos/kudo-feed-mapper.test.ts` — normal row (sender/receiver/time/hearts/messageHtml),
  anonymous row (null name → "Ẩn danh", heroCode "", badge "new", no sender leak),
  anonymous with custom name, imageUrls present vs empty→attachmentCount, HTML message sanitized.
- `message-keys.test.ts` auto-covers `allKudosEmpty` vi/en parity (no new test needed).
- `getAllKudos` is NOT unit-tested against a live DB — proven in phase-07.

## Todo
- [x] Extract `lib/format/kudo-display-format.ts`; re-point `profile-view-mappers.ts` imports
- [x] `lib/kudos/kudos-feed-queries.ts` (getAllKudos, dual join, order desc, limit, [] on error)
- [x] Add `KudoFeedItem` to `lib/kudos/kudos-types.ts`
- [x] `lib/kudos/kudo-feed-mapper.ts` (pure, anonymize + format + sanitize)
- [x] Extend `KudoPostData` optional fields (kudo-posts-data.ts)
- [x] Update `kudo-post-card.tsx` (HTML message, avatars, imageUrls)
- [x] Update `live-board-all-kudos.tsx` (async, real data, empty state)
- [x] Add `allKudosEmpty` to vi.json + en.json
- [x] Update `supabase/seed.sql` (HTML messages, image_urls, 1 anonymous row)
- [x] Add mapper + formatter tests
- [x] `pnpm typecheck` (or `pnpm build`) + `pnpm test` green

## Success Criteria (observable)
- `/kudos-live-board` ALL KUDOS lists seeded kudos, newest first, with sender+receiver
  name/hero code/badge/avatar sourced from `profiles`.
- Anonymous seed row displays "Ẩn danh", no hero code, `new` badge, default avatar; no sender
  identity present in the client payload for that row.
- Message body renders formatted rich text (no literal `<p>`/tags), sanitized.
- Empty `kudos` table → empty-state string renders, no crash.
- HIGHLIGHT / SPOTLIGHT / stats / gift-receivers panels visually unchanged (still mock-driven).
- `pnpm test` green (292 existing + new), `pnpm typecheck`/build clean.

## Risk Assessment
| Risk | L | I | Mitigation |
|------|---|---|-----------|
| HTML message shows literal tags OR mock "<3" mangled | Med | High | Seed messages as sanitized HTML (escape `<3`); card renders HTML only via optional `messageHtml`; mock rows keep plain-text branch |
| Anonymous sender identity leaks to client | Low | High | Anonymize in the pure mapper (server-side); never map joined sender fields for anonymous rows |
| DRY extraction breaks profile page/tests | Low | Med | Keep function names + bodies identical; run `profile-view-mappers.test.ts` |
| Supabase types to-one join as array | Low | Low | Reuse `Array.isArray(x)?x[0]:x` guard from profile-queries |
| Extending shared `KudoPostData` breaks other consumers | Low | Med | New fields OPTIONAL; only `live-board-all-kudos` consumes `KUDO_POSTS`; profile uses its own `ProfileKudoPostData` |

## Completion Notes (2026-07-22)
All deliverables completed and tested:
- **lib/format/kudo-display-format.ts**: extracted formatKudoTime + formatCount verbatim from profile-view-mappers, with dedicated test coverage.
- **lib/kudos/kudos-feed-queries.ts**: getAllKudos query with dual join (sender + receiver profiles), order descending, limit 100, graceful error fallback.
- **lib/kudos/kudo-feed-mapper.ts**: pure server-side mapper; anonymizes sender identity for anonymous rows (drops joined sender fields, uses anonymousName or "Ẩn danh"), re-sanitizes HTML, formats timestamps + counts.
- **kudo-post-card.tsx**: wired for optional messageHtml (renders dangerouslySetInnerHTML when present), optional sender/receiver avatar URLs (falls back to design defaults), optional imageUrls array (falls back to attachmentCount placeholders).
- **live-board-all-kudos.tsx**: async server component fetching real getAllKudos data; empty state uses i18n key allKudosEmpty.
- **seed.sql**: HTML-ified messages (escaped `<3` → `&lt;3`, wrapped in `<p>`), image_urls populated for sample rows, added 1 anonymous row with latest created_at (renders top).
- **Messages**: added LiveBoard.allKudosEmpty (vi: "Chưa có lời cảm ơn nào." / en: "No kudos yet.").
- **Tests**: 310/310 passing; new tests for formatters + mapper (anonymous edge cases, HTML sanitization, missing imageUrls).

## Out of Scope (YAGNI)
Pagination / infinite scroll, realtime subscriptions, hearts/copy-link interactions,
department/hashtag feed filters, spam badge on the live-board card (design has none). Note only.

## Rollback
Revert the 4 component/i18n edits (restore `KUDO_POSTS` import in `live-board-all-kudos.tsx`),
revert `profile-view-mappers.ts` import, delete the 3 new `lib/**` files + their tests, revert
`seed.sql`. No schema change in this phase → nothing to migrate down.

## Security
Re-sanitize message HTML on read (defense-in-depth); render only sanitized output via
`dangerouslySetInnerHTML`. Anonymous identity dropped server-side. Read path is anon-safe
(existing open read RLS). No secrets touched.
