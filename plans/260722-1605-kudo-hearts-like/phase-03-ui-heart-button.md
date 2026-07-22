# Phase 03 — UI heart button + card wiring + i18n

## Context
- Plan: [plan.md](./plan.md) · Decisions: [clarifications.md](./clarifications.md) · Depends: phase 02.
- Spec C.4.1: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
- Mirror: `components/kudos-live-board/kudo-post-card.tsx` (C.4.1 hearts block, lines 132–149),
  `formatCount` in `lib/format/kudo-display-format.ts` (pure — safe in client),
  i18n `messages/{en,vi}.json` `LiveBoard` block, existing icon `/kudos-live-board/icon-heart.svg`.

## Overview
Priority P2 · Status pending. New client component `heart-button.tsx` — optimistic
toggle with gray (not liked) / red (liked) heart + count, disabled for own kudo, calls
`toggleKudoHeart`, reconciles with the returned count. Card renders it for interactive
rows and keeps the static display as fallback.

## Data flow
Card (server) → passes `kudoId=post.id`, `initialLiked=post.heartsLiked`,
`initialCount=post.heartsValue`, `disabled=post.isOwnKudo` → HeartButton (client) holds
`useState(liked, count)` + `useTransition` pending → on click: optimistic flip
(liked!, count±1) → `await toggleKudoHeart(kudoId)` → on `ok` reconcile to server
`{ liked, heartsCount }`; on error/exception revert to prior state. Count rendered via `formatCount(count)`.

## Related code files
- CREATE `components/kudos-live-board/heart-button.tsx` (`"use client"`, < 200 lines).
- EDIT `components/kudos-live-board/kudo-post-card.tsx` — replace static hearts block with
  `HeartButton` when `post.heartsValue !== undefined`, else keep current static span.
- EDIT `messages/en.json` + `messages/vi.json` — add `LiveBoard` heart aria-label keys.

## Implementation steps
1. `heart-button.tsx`: props `{ kudoId: string; initialLiked: boolean; initialCount: number; disabled: boolean }`.
   - `const [liked, setLiked] = useState(initialLiked); const [count, setCount] = useState(initialCount);`
   - `const [pending, startTransition] = useTransition();`
   - onClick (guard `disabled || pending`): snapshot prev; optimistic `setLiked(!liked); setCount(c => liked ? c-1 : c+1);`
     then `startTransition(async () => { const r = await toggleKudoHeart(kudoId); if (r.ok) { setLiked(r.liked); setCount(r.heartsCount); } else { setLiked(prev.liked); setCount(prev.count); } })`.
   - Wrap in try/catch to revert on thrown error (redirect is a thrown signal — let it propagate).
   - Render `<button disabled={disabled || pending}>` with count `<span>{formatCount(count)}</span>` + heart image.
   - Color: liked → red (design token, e.g. `text-[#D4271D]` / red heart asset); not liked → gray. Match card typography (`font-montserrat`, existing size). Add `aria-pressed={liked}` + `aria-label` from next-intl client hook (`useTranslations("LiveBoard")`).
   - Disabled (own kudo): muted styling + `aria-disabled`, tooltip/aria-label "own kudo" key.
2. Card: import `HeartButton`. Replace the `C.4.1_Hearts` `<div>` (lines 134–149) with
   `post.heartsValue !== undefined ? <HeartButton kudoId={post.id} initialLiked={!!post.heartsLiked} initialCount={post.heartsValue} disabled={!!post.isOwnKudo} /> : <static span>`.
   Copy-link button (C.4.2) unchanged.
3. i18n: add to `LiveBoard` in BOTH locales — e.g. `"likeKudo": "Like"` / `"Thích"`,
   `"unlikeKudo": "Unlike"` / `"Bỏ thích"`, `"ownKudoHeartDisabled": "You can't heart your own kudo"` / vi.
   Keep key parity (parity test enforces).

## Todo
- [x] heart-button.tsx (optimistic, useTransition, revert-on-error, disabled own) — Component created, <200 lines, handles all error paths
- [x] Gray/red styling per design tokens + aria-pressed/label — Styled per C.4.1, aria-label + aria-pressed wired to next-intl
- [x] Card wiring (interactive vs static fallback) — Conditional render in kudo-post-card.tsx, static fallback when fields absent
- [x] i18n keys added to en + vi (parity) — Keys added to LiveBoard block, parity test passes

## Success criteria
- Board renders heart button on every real card; click flips color + count optimistically, settles to server value.
- Own-kudo button disabled (no toggle). Double-click guarded by `pending`.
- Highlight carousel untouched. `tsc` + lint clean.

## Risk assessment
- Optimistic desync on error (Low) → revert to snapshot on non-ok / throw.
- Concurrent double insert (Low) → button disabled while `pending`.
- Client importing server-only code (Low) → only `formatCount` (pure) + the action import; no server-only modules.

## Security
- No secrets client-side. Action enforces all authz; button `disabled` is UX only, not the guard.

## Rollback
Delete `heart-button.tsx`, restore static hearts block, drop i18n keys. Card fallback already static.

## Next
Unblocks phase 04 (tests target action + mapper; live verify exercises this UI).
