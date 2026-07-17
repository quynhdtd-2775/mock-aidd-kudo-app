# Phase 03 — Profile UI (Track A, parallel)

**Track:** A (UI) · **Status:** completed · **Runs in parallel — no blocks/blockedBy vs Track B.**

**Deliverables:** `components/profile/*` (10 component files) + `public/profile/*` (assets) + initial `app/profile/page.tsx` with mock data from Figma design.

- **Screen:** Profile bản thân — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/3FoIx6ALVb
- **Clarifications:** `./clarifications.md`
- **Goal:** Build presentational profile components from Figma + an initial `app/profile/page.tsx` rendering with mock data (extracted from design, no invented data).
- **Owns:** `components/profile/**`, `app/profile/page.tsx` (initial mock version).

## Out of Scope
- No data fetching, no Supabase, no auth. Interactive elements (Mở quà, Xem tất cả) are static placeholders; header links to `/`.

## Integration Contract (props Track B will supply in phase 04)
- `ProfileData`: displayName, heroCode, avatarUrl, heroBadge (`new|rising|legend|super`).
- `ProfileStats`: kudosReceived, kudosSent, heartsReceived, boxesOpened, boxesUnopened.
- `IconCollectionItem[]`: { name, imageUrl, unlocked } (gray when `unlocked===false`).
- `ReceivedKudo[]`: sender {name, heroCode, heroBadge}, message, hashtagTitle, hashtags, attachmentCount, heartsCount, time.

Components must accept these as props (presentational) so phase 04 swaps mock → real with no structural change.
