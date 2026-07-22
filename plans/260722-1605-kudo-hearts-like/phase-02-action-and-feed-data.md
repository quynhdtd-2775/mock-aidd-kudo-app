# Phase 02 — Server action + feed data enrichment

## Context
- Plan: [plan.md](./plan.md) · Decisions: [clarifications.md](./clarifications.md) · Depends: phase 01.
- Mirror: `app/kudos-live-board/actions.ts` (`createKudo` auth guard + `getWriteClient`
  mock/service-role pattern), `lib/profile/current-user.ts` (`resolveCurrentUserId`),
  `lib/kudos/kudos-feed-queries.ts` + `kudo-feed-mapper.ts` + `kudos-types.ts`.

## Overview
Priority P2 · Status pending. Add the `toggleKudoHeart` server action and enrich the
feed so each card knows whether the current user liked it and whether it is their own.

## Data flow
`heart-button` click → `toggleKudoHeart(kudoId)` → resolve uid (redirect /login if null)
→ getWriteClient (service-role in mock, anon+RLS in prod) → load kudo.sender_id
→ reject if sender==uid → check existing kudo_hearts row → insert (like) or delete (unlike)
→ trigger updates kudos.hearts_count → re-read hearts_count → return `{ ok, liked, heartsCount }`.
Feed: `getAllKudos` resolves uid, adds `sender_id` to select, and one extra query for the
user's liked kudo ids → sets `likedByMe` + `senderId` per item → mapper derives `isOwnKudo`.

## Related code files
- EDIT `app/kudos-live-board/actions.ts` — add `toggleKudoHeart`.
- EDIT `lib/kudos/kudos-types.ts` — `HeartToggleResult`, `HeartErrorCode`; extend `KudoFeedItem` (`senderId`, `likedByMe`).
- EDIT `lib/kudos/kudos-feed-queries.ts` — add `sender_id` to select; resolve uid; fetch liked ids; set fields.
- EDIT `lib/kudos/kudo-feed-mapper.ts` — pass through `heartsValue` (number), `heartsLiked`, `isOwnKudo`.
- EDIT `components/kudos-live-board/kudo-posts-data.ts` — optional `heartsValue?`, `heartsLiked?`, `isOwnKudo?`.

## Implementation steps
1. Types: `HeartErrorCode = "self_like" | "kudo_not_found" | "toggle_failed"`;
   `HeartToggleResult = { ok:true; liked:boolean; heartsCount:number } | { ok:false; error:HeartErrorCode }`.
   Extend `KudoFeedItem` with `senderId: string` and `likedByMe: boolean`.
2. Action `toggleKudoHeart(kudoId: string)`:
   - `const uid = await resolveCurrentUserId(); if (!uid) redirect("/login");`
   - `const supabase = await getWriteClient();` (reuse existing helper — extract if not exported).
   - Load `sender_id` from kudos by id; not found → `{ ok:false, error:"kudo_not_found" }`.
   - `if (sender_id === uid) return { ok:false, error:"self_like" };` (enforced in code — service role bypasses RLS).
   - Select existing `kudo_hearts` by (kudo_id, user_id). Exists → `delete`, `liked=false`; else `insert { kudo_id, user_id: uid, hearts_value: 1 }`, `liked=true`.
   - On write error → `{ ok:false, error:"toggle_failed" }`.
   - Re-read `kudos.hearts_count` (trigger already applied) → `{ ok:true, liked, heartsCount }`.
   - Do NOT write `hearts_count` here (trigger owns it).
3. `getAllKudos`: add `sender_id` to select columns; `const uid = await resolveCurrentUserId();`
   if uid, `select kudo_id from kudo_hearts where user_id = uid` → `Set`; map `likedByMe = set.has(row.id)`, `senderId = row.sender_id`. If no uid, likedByMe=false.
4. Mapper: `heartsValue: item.heartsCount` (raw number), `heartsLiked: item.likedByMe`,
   `isOwnKudo: uid != null && item.senderId === <uid>`. Since mapper is pure, pass `currentUserId` param OR precompute `isOwnKudo` in the query layer and add to `KudoFeedItem` — prefer computing `isOwnKudo` in `getAllKudos` (it has uid) and adding it to `KudoFeedItem`, keeping mapper a pure passthrough.
   - Adjust: add `isOwnKudo: boolean` to `KudoFeedItem` (set in query), mapper just forwards it.
5. Keep `heartsCount` (formatted string) as-is for the static fallback path.

## Todo
- [x] Types: HeartToggleResult/HeartErrorCode + KudoFeedItem fields (senderId, likedByMe, isOwnKudo) — Added to kudos-types.ts
- [x] toggleKudoHeart action (auth redirect, self-like reject, toggle insert/delete, re-read count) — Implemented in actions.ts with full error handling
- [x] getAllKudos: sender_id select + uid + liked-ids query + fields — Feed enrichment complete, likedByMe/senderId set
- [x] Mapper passthrough (heartsValue, heartsLiked, isOwnKudo) — Mapper updated, isOwnKudo computed in query layer
- [x] KudoPostData optional fields — Optional fields added, fallback tested

## Success criteria
- Action returns correct `{ liked, heartsCount }` across insert→delete cycle; self-like → `self_like`; unauth → redirect.
- Feed items carry accurate `likedByMe` / `isOwnKudo`; mapper output includes `heartsValue` numeric.
- `tsc` clean.

## Risk assessment
- Service role bypasses RLS (High) → self-like + one-per-user enforced in action code (steps 2). Tested in phase 04.
- Extra feed query per load (Low) → single `select kudo_id` for uid; negligible.
- Optimistic reconcile needs numeric count → `heartsValue` added; format done client-side.

## Security
- Action re-guards auth (defense-in-depth vs proxy matcher). Error CODES only, no i18n here (UI maps copy).

## Rollback
Revert edits via git; card falls back to static display when optional fields absent.

## Next
Unblocks phase 03 (UI consumes action + fields).
