# Phase B5 — Widget button → WriteKudoModal

## Context Links
- Current: `components/home/hero-widget-button.tsx` (inert server component, floating pen pill)
- Pattern ref: `components/kudos-live-board/write-kudo-launcher.tsx` (client state holds modal open)
- Contract: `components/kudos/write-kudo/write-kudo-modal.tsx` — `WriteKudoModal({ isOpen, onClose })`

## Overview
- **Priority:** P3 · **Status:** pending · **Blocked by:** none
- Wire the floating widget button to open `WriteKudoModal`, reusing the kudos-live-board launcher pattern.

## Key Insights
- Modal needs client-side open state; the button is currently a server component reading `t()`.
  Simplest KISS: convert `hero-widget-button.tsx` to `"use client"` using `useTranslations("Hero")`,
  hold `isOpen` state, render the existing pill + `<WriteKudoModal>` — inline launcher pattern.
- No new i18n keys (aria label already exists in Hero namespace).

## Data Flow
Button click → `setIsOpen(true)` → `<WriteKudoModal isOpen onClose={() => setIsOpen(false)} />`.

## Requirements
- **Functional:** clicking the widget button opens WriteKudoModal; closes on modal's onClose (ID-54).
- **Non-functional:** preserve existing pill visuals (glow shadow, position, pen/kudos icons).

## Related Code Files
- **Modify:** `components/home/hero-widget-button.tsx` (→ client component holding modal state)

## Implementation Steps
1. Add `"use client"`; swap `getTranslations` (server) for `useTranslations("Hero")` (client).
2. Add `const [isOpen, setIsOpen] = useState(false)`; `onClick={() => setIsOpen(true)}` on the button.
3. Render `<WriteKudoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />` alongside the button.
4. Confirm the page (`app/home-page-saa/page.tsx`) still renders it (no server-only prop passed in).

## Todo List
- [ ] hero-widget-button → client component
- [ ] modal open state + onClick
- [ ] WriteKudoModal mounted, closes correctly
- [ ] pill visuals unchanged

## Success Criteria
- Widget button opens the kudos modal; closing returns cleanly. Satisfies ID-54.

## Risk Assessment
- **Server→client conversion breaks async render** (Low/Med): button had no server-only deps beyond `t()`; `useTranslations` client hook is a drop-in. Low risk.

## Next Steps
- None.
