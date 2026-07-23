# Review: Hệ thống giải awards page — behavioral completion

Scope: `git diff` (award-menu.tsx, award-card.tsx, sunkudos-section.tsx) + untracked
files in `components/home-awards-page/` (award-menu-nav.tsx, scroll-to-award-section.ts,
scroll-to-award-section.test.ts, icon-target.tsx). Verified against plan.md/clarifications.md.

## Score: 8/10 — Critical issues: 0 — High: 1 — Medium: 1 — Low: 2

## Findings

### High
1. **`scroll-to-award-section.test.ts:41,47,53,59,67,73,79,85` — file does not pass
   project-wide `tsc --noEmit`.** Reproduced independently (`npx tsc --noEmit -p tsconfig.json`),
   6 errors: `TS2558 Expected 0-1 type arguments, but got 2` and `TS2345 Argument of type
   'Mock<[id: string]>' is not assignable...`. Cause: vitest 4.x changed `vi.fn<T>()` to a
   single type parameter (the full function signature), but the test uses the old
   two-parameter form `vi.fn<Parameters<ElementResolver>, ReturnType<ElementResolver>>()`.
   `pnpm test` (vitest run, esbuild transform, no type-check) and `next build`'s internal
   TS pass both stay green — which is why this slipped through — but a plain `tsc --noEmit`
   fails, and this file is included by `tsconfig.json`'s `**/*.ts` glob (no test exclude).
   Verified fix compiles clean: replace the two-arg calls with `vi.fn<ElementResolver>(...)`.
   Contradicts the "tsc clean" evidence claim — that check must not have been run against
   this file, or was run before it existed.

### Medium
2. **`award-card.tsx:522`** re-exports `IconTarget` (`export { IconTarget, IconDiamond,
   IconLicense }`) but no file imports `IconTarget` from `award-card` anymore (confirmed via
   repo-wide grep) — it's dead re-export now that the real definition moved to `icon-target.tsx`.
   Harmless, but worth pruning next time this file is touched.

### Low
3. `GOLD = "rgba(255, 234, 158, 1)"` is now defined in both `award-menu-nav.tsx:7` and
   `award-card.tsx:41` — pre-existing duplication carried over from the old `award-menu.tsx`,
   not introduced by this diff. Not blocking (YAGNI says don't build the shared-constants
   module for two usages), flagging for awareness only.
4. `award-card.tsx` is 522 lines, over the 200-line guideline — pre-existing (539 lines 5
   commits ago), not something this diff grew; the diff actually shrank it by ~17 lines. Not
   a regression, just noting the file remains a candidate for a future split.

## Verification performed

- **Styling fidelity**: diffed `award-menu-nav.tsx`'s anchor/span JSX byte-for-byte against
  `git show HEAD:components/home-awards-page/award-menu.tsx`'s `AwardMenuLink` — className
  strings, inline `style` objects, and the `nav` wrapper className are identical; only
  `item.active` → local `active` and an added `onClick` differ. Fidelity confirmed.
- **Hydration**: `useState(items[0]?.href)` is a deterministic pure function of the `items`
  prop (server-resolved, no Date/Math.random/locale-dependent branching) → SSR and hydration
  render the same initial `activeHref` ("#top-talent"), no mismatch.
- **Single-active invariant**: state is one `string | undefined`, `active = item.href ===
  activeHref` — only one item can match given the 6 distinct anchors in `MENU_ITEM_DATA`.
- **preventDefault + href preserved**: `handleClick` calls `event.preventDefault()` then
  `scrollToAwardSection`; `href` attribute stays on the `<a>` for no-JS fallback (only
  reachable when JS is actually disabled, since the handler doesn't attach otherwise — correct
  progressive-enhancement reasoning, not a real fallback bug).
- **Server/client boundary**: `award-menu-nav.tsx` imports only `icon-target.tsx` and
  `scroll-to-award-section.ts`, neither touches `next-intl/server` or other server-only
  modules — confirmed no leakage into the client bundle. `icon-target.tsx` has zero imports,
  safe to use from both server (`award-card.tsx`) and client (`award-menu-nav.tsx`).
- **Anchor targets real**: `awards-section.tsx`'s `CARD_ANCHORS` map (`313:8467`→`top-talent`
  … `313:8510`→`mvp`) matches all 6 `MENU_ITEM_DATA` hrefs exactly — smooth-scroll has real
  targets, not just the null-guard path.
- **sunkudos-section.tsx**: `<button>` → `<Link href="/kudos-live-board">`, className/style
  untouched; `/kudos-live-board` route exists (`app/kudos-live-board/`). Matches
  clarifications.md decision ("same tab").
- Re-ran independently: `npx eslint` on all 7 touched/new files → clean. `npx vitest run`
  (full suite) → 337/337 passed. `npx next build` → succeeds (Turbopack, TS pass, static
  generation for all 9 routes incl. `/home-awards-page` and `/kudos-live-board`).
- File naming: all new files kebab-case. Sizes: award-menu-nav.tsx 83, scroll-to-award-section.ts
  18, scroll-to-award-section.test.ts 90, icon-target.tsx 21 — all well under 200 lines.

## Plan/clarifications compliance
All 3 success criteria in plan.md met: click-driven active state + smooth scroll (gap 1),
Chi tiết → /kudos-live-board same tab (gap 2), unit test for the null-guard path present (gap 3,
matches test case ID-13). No route alias added (clarification honored), no Supabase touch,
i18n stayed server-side per the "Key Decisions" in plan.md.

## Unresolved questions
None — recommend fixing finding #1 (swap to single-arg `vi.fn<ElementResolver>()`) before
merge since it's cheap and restores `tsc --noEmit` to green project-wide, but it does not
block `next build` or the test suite today.
