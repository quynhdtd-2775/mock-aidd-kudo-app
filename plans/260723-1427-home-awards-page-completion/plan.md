---
title: "Hệ thống giải — behavioral completion"
description: "Wire menu active-state + smooth scroll and the Chi tiết CTA on the awards page (UI already built)"
status: complete
priority: P2
effort: 2h
branch: feat.some-page
tags: [awards-page, next-intl, client-component, navigation]
created: 2026-07-23
completed: 2026-07-23
---

# Hệ thống giải (/home-awards-page) — Behavioral Completion

UI is fully built and committed. Only 3 behavioral gaps remain. NO UI rebuild, NO Supabase
schema change, NO route rename (see `clarifications.md` — authoritative).

## Scope

| # | Gap | File(s) |
|---|-----|---------|
| 1 | Menu active-state (gold+underline) moves on click + smooth-scroll to card | `award-menu.tsx` + new `award-menu-nav.tsx` + new `scroll-to-award-section.ts` |
| 2 | "Chi tiết" CTA → navigate to `/kudos-live-board` same tab | `sunkudos-section.tsx` |
| 3 | Verify against MoMorph test cases ID-9/11/12/13 | new `scroll-to-award-section.test.ts` + manual checklist |

## Phases

| Phase | Title | Status | Completion Notes |
|-------|-------|--------|------------------|
| [01](phase-01-menu-active-scroll.md) | Menu active-state + smooth scroll | complete | Menu active state moves on click + smooth scroll implemented. New files: `award-menu-nav.tsx`, `scroll-to-award-section.ts`, `icon-target.tsx` (deviation: extracted to own file to avoid server-bundle pollution from next-intl/server in award-card). |
| [02](phase-02-chi-tiet-cta.md) | Chi tiết CTA navigation | complete | Button → `<Link href="/kudos-live-board">` in `sunkudos-section.tsx`. |
| [03](phase-03-verification.md) | Unit test + manual verification | complete | Unit tests: 7 cases in `scroll-to-award-section.test.ts` (vitest 4 typing fixed). Manual: Playwright checklist ID-0/1/9/11/12/13 all pass. Reviewer: 8/10, 0 critical. |

Phases 01 and 02 touch disjoint files → parallel-runnable. 03 gates on both.

## Key Decisions

- **i18n stays server-side.** `award-menu.tsx` remains an async server component that resolves
  labels via `getTranslations`, then passes resolved `items` (id/label/href) as props to a new
  client component `award-menu-nav.tsx`. Avoids converting i18n to `useTranslations`.
- **Scroll logic extracted to a pure module** (`scroll-to-award-section.ts`) with an injectable
  element resolver → unit-testable in the repo's `node` vitest env (no jsdom needed).
- **CTA becomes `next/link` `<Link>`** styled identically (the repo convention; already used in
  this feature's header/footer). No client component required.
- **Test infra = vitest (node env only), no jsdom/RTL.** Pure logic gets a unit test; DOM/browser
  behaviors (real scroll, active visual, navigation) get a manual Playwright-MCP checklist. Adding
  jsdom/testing-library would violate YAGNI.

## Success Criteria

- Click any of 6 menu items → smooth-scroll to its card, active state moves to only that item.
- Click with a missing target section → no JS error (guarded, no-op).
- "Chi tiết" → `/kudos-live-board` in same tab.
- `pnpm test` green; all files < 200 lines; existing visual styling byte-identical.
