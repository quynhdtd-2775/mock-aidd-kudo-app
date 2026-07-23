# Phase B6 — Awards page hash-scroll-on-load

## Context Links
- Existing helper: `components/home-awards-page/scroll-to-award-section.ts` (`scrollToAwardSection(href, resolve?)`, injectable resolver, unit-tested)
- CARD_ANCHORS slugs: `top-talent, top-project, top-project-leader, best-manager, signature-2025-creator, mvp`
- Target page: `app/home-awards-page/page.tsx` (renders sections with those slug ids)

## Overview
- **Priority:** P2 · **Status:** pending · **Blocked by:** none
- The awards page already has `CARD_ANCHORS` ids + `scrollToAwardSection` + menu-nav scroll. Missing:
  scroll-to-section on **initial load** when the URL carries a hash (arriving from a homepage award card).

## Key Insights
- `awards-section.tsx` in this dir is a **Track A file** — OFF LIMITS. Do NOT add the effect there.
- Instead mount a tiny client component in `app/home-awards-page/page.tsx` that, on mount, reads
  `window.location.hash` and calls the existing `scrollToAwardSection` (DRY — reuse, don't reimplement).
- Reuse the injectable-resolver seam so the on-load logic is unit-testable in node env (no jsdom).
- Section ids are already in the DOM by mount (server-rendered) — safe to resolve immediately;
  a `requestAnimationFrame` / microtask defer guards against layout-not-ready edge.

## Data Flow
Homepage award card link `/home-awards-page#<slug>` → navigation → awards page mounts →
`HashScrollOnLoad` effect reads `location.hash` → `scrollToAwardSection(hash)` → smooth scroll.

## Requirements
- **Functional:** loading `/home-awards-page#<slug>` scrolls to that section; missing/empty hash is a
  no-op (ID-47..52; ID-62 tolerates missing hash). Existing menu-nav click scroll still works.
- **Non-functional:** no crash when hash targets a non-existent id (existing guard returns early).

## Related Code Files
- **Create:** `components/home-awards-page/hash-scroll-on-load.tsx` (`"use client"`; effect + pure `resolveHashTarget` helper for testability)
- **Modify:** `app/home-awards-page/page.tsx` (mount `<HashScrollOnLoad />`)

## Implementation Steps
1. `hash-scroll-on-load.tsx`: `"use client"`; `useEffect(() => { if (location.hash) scrollToAwardSection(location.hash); }, [])`. Wrap the read in a pure helper `readHashOnLoad(getHash, scroll)` so it accepts injected hash + scroll fn (node-testable).
2. `page.tsx`: import and render `<HashScrollOnLoad />` inside `<main>` (renders null; effect-only).
3. Verify existing `AwardMenuNav` menu-click scroll path is untouched.

## Todo List
- [ ] HashScrollOnLoad client component (effect reuses scrollToAwardSection)
- [ ] pure `readHashOnLoad(getHash, scroll)` seam for tests
- [ ] mounted in awards page
- [ ] no-op on empty/missing hash; menu-nav scroll intact

## Success Criteria
- Navigating from a homepage award card lands scrolled to the right section; no hash = top of page.
  Satisfies ID-47..52, ID-62.

## Risk Assessment
- **Editing a Track A file** (Low/High): mitigated — new component + page.tsx edit only; `awards-section.tsx` untouched.
- **Section not laid out at mount** (Low/Med): defer scroll to next frame if needed; existing guard no-ops on missing target.

## Integration
- **Track A ↔ B contract:** homepage award cards (Track A `components/home/award-card.tsx`) must emit
  `/home-awards-page#<slug>` using the shared `CARD_ANCHORS` slugs. B6 consumes them. Slugs are the contract.

## Next Steps
- B7 tests `readHashOnLoad` / `scrollToAwardSection` with injected resolver.
