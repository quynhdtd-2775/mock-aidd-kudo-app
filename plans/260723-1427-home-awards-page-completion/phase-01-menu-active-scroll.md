# Phase 01 — Menu active-state + smooth scroll

## Context Links
- Current menu: `components/home-awards-page/award-menu.tsx`
- Anchor targets: `components/home-awards-page/awards-section.tsx` (card wrappers carry `id=` + `scroll-mt-28`)
- Decisions: `clarifications.md` — active on click only, NO scroll-spy
- MoMorph: Hệ thống giải https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD

## Overview
- Priority: P2 | Status: complete
- Make menu items interactive: click moves the gold+underline active state to the clicked item
  (only one active) and smooth-scrolls to its award card. Keep visual styling byte-identical.

### Completion Notes
- **Deviation (approved by reviewer):** `IconTarget` extracted to new file `icon-target.tsx` instead of importing from `award-card.tsx`. Reason: `award-card.tsx` imports `next-intl/server` (server-only); importing it into client bundle causes hydration error. New file is pure, client-safe. Dead `IconTarget` re-export removed from `award-card.tsx` per review.
- Files created: `award-menu-nav.tsx`, `scroll-to-award-section.ts`, `icon-target.tsx`
- Files modified: `award-menu.tsx` (server half only), `award-card.tsx` (dead re-export removed)

## Key Insights
- `getTranslations` (server) cannot run in a client component → keep label resolution on the
  server, pass resolved strings down as props.
- Card wrappers already have `scroll-mt-28`; `scrollIntoView` honors `scroll-margin-top`, so no
  manual offset math needed.
- vitest env is `node` (no jsdom) → scroll logic must be a pure module with an injectable element
  resolver to be testable (ID-13).

## Requirements
- Functional: click item → set active = that item only; smooth-scroll to matching card section.
- Functional (ID-13): missing target element → no throw, no-op gracefully.
- Non-functional: styling/classes/inline styles unchanged; keep anchor `href` for no-JS/a11y;
  keep `aria-current` on active; each file < 200 lines.

## Architecture / Data Flow
```
award-menu.tsx  (server, async)
  getTranslations → build items: { id, label, href }[]  (topTalent active by default)
        │ props: items
        ▼
award-menu-nav.tsx  ("use client")
  useState(activeHref)  // init = first item's href (#top-talent)
  render <a href> per item; active = item.href === activeHref
  onClick(e): e.preventDefault(); setActiveHref(href); scrollToAwardSection(href)
        │ calls
        ▼
scroll-to-award-section.ts  (pure, no "use client")
  scrollToAwardSection(href, resolve = domResolver)
    id = href.replace(/^#/, "")
    el = resolve(id); if (!el) return;           // ID-13 guard
    el.scrollIntoView({ behavior: "smooth", block: "start" })
```

## Related Code Files
- Modify: `components/home-awards-page/award-menu.tsx` — keep async server; resolve labels; render `<AwardMenuNav items={items} />`. Move `AwardMenuLink` markup into the client file.
- Create: `components/home-awards-page/award-menu-nav.tsx` — `"use client"`; holds active state + click handlers + link/icon markup (import `IconTarget` from `./award-card`). Preserve the exact `<nav>` and link classes/styles/`GOLD`/`textShadow` from the current file.
- Create: `components/home-awards-page/scroll-to-award-section.ts` — pure helper + `domResolver` default.

## Implementation Steps
1. Create `scroll-to-award-section.ts`: export `scrollToAwardSection(href, resolve?)` with default `domResolver = (id) => document.getElementById(id)`; guard null; `scrollIntoView({behavior:"smooth", block:"start"})`.
2. Create `award-menu-nav.tsx`: `"use client"`; props `{ items: {id,label,href}[] }`; `useState` seeded with `items[0].href`; render the existing `<nav>` + per-item `<a>` markup (copy styling verbatim); onClick → `preventDefault` + `setActiveHref` + `scrollToAwardSection(href)`; `active = item.href === activeHref`.
3. Edit `award-menu.tsx`: drop the server `AwardMenuLink`; keep `getTranslations` + `MENU_ITEM_DATA` mapping to `items`; return `<AwardMenuNav items={items} />` (move `aria-label`/`menuAriaLabel` onto the nav, so pass it as a prop or keep the `<nav>` wrapper in the client component and pass the label string).
4. Compile check: `pnpm exec tsc --noEmit` (or the project build) — resolve any type errors.

## Todo List
- [x] `scroll-to-award-section.ts` created with injectable resolver + null guard
- [x] `award-menu-nav.tsx` client component with single-active state + click scroll
- [x] `award-menu.tsx` reduced to server label-resolver passing props
- [x] Styling/classes/`aria-*` preserved verbatim; anchor `href` kept
- [x] Type-check / build passes (tsc clean, vitest 337/337)

## Success Criteria
- Only one item shows gold+underline at a time; it follows clicks.
- Clicking scrolls smoothly to the correct card with the `scroll-mt-28` offset respected.
- No console error when a target id is absent.

## Risk Assessment
- **Med** — losing visual fidelity when moving markup. Mitigation: copy classes/inline styles verbatim; diff against current file before commit.
- **Low** — hydration mismatch. Mitigation: active init is deterministic (first href), identical server/client.

## Rollback
- Revert the three files; the menu returns to static server-rendered anchors (git revert of this phase's commit).

## Next Steps
- Feeds Phase 03 (unit test targets `scroll-to-award-section.ts`).
