# Phase 03 — Unit test + manual verification

## Context Links
- Under test: `components/home-awards-page/scroll-to-award-section.ts` (Phase 01)
- Test convention: co-located `*.test.ts`, vitest `node` env — see `components/kudos/write-kudo/recipient-selection-state.test.ts`
- MoMorph test cases: ID-9, ID-11, ID-12, ID-13
- Runs after Phases 01 + 02.

## Overview
- Priority: P2 | Status: complete
- Prove the extractable pure logic with a vitest unit test; cover the browser/DOM behaviors with a
  manual Playwright-MCP checklist. NO new test infra (no jsdom/RTL) — YAGNI.

### Completion Notes
- Unit tests: 7 test cases in `scroll-to-award-section.test.ts` (vitest 4 generics fixed per review).
- Unit test results: all 7 passing (vitest 337/337 total suite).
- Manual Playwright verification: ID-0/1/9/11/12/13 all pass.
  - Scroll lands correctly at 112px offset (scroll-mt-28).
  - Single-active invariant holds across all clicks.
  - CTA navigates to `/kudos-live-board`.
  - No console errors during interactions.
- Review: 8/10, 0 critical. Both actionable findings fixed (test typing, dead re-export).
- Report: `/plans/reports/reviewer-260723-1427-home-awards-page-completion.md`

## Strategy: what proves what

| Test case | Behavior | Layer | How |
|-----------|----------|-------|-----|
| ID-13 | missing section → no JS error | unit | inject resolver returning `null` → assert no throw + `scrollIntoView` not called |
| (happy) | valid href → scrollIntoView smooth | unit | inject resolver returning a spy element → assert called with `{behavior:"smooth", block:"start"}` |
| ID-9 | click each of 6 → scroll + active moves | manual | Playwright-MCP click each menu item, observe scroll + gold underline moves |
| ID-11 | only clicked item active | manual | Playwright-MCP assert exactly one `aria-current` / gold item |
| ID-12 | Chi tiết → `/kudos-live-board` same tab | manual | Playwright-MCP click, assert URL, no new tab |

## Related Code Files
- Create: `components/home-awards-page/scroll-to-award-section.test.ts`

## Implementation Steps
1. Write `scroll-to-award-section.test.ts` (vitest, node env):
   - `it("no-op when target element is absent")`: `scrollToAwardSection("#missing", () => null)` → does not throw; a `vi.fn()` spy element's `scrollIntoView` never called.
   - `it("scrolls the resolved element smoothly")`: pass `() => ({ scrollIntoView: spy })`; assert `spy` called with `{ behavior: "smooth", block: "start" }`.
   - `it("strips the leading # before lookup")`: capture the id passed to the resolver → equals `"top-talent"` for href `"#top-talent"`.
2. Run `pnpm test` (hand off to `tester` agent per project rules) → green.
3. Manual Playwright-MCP checklist (dev server running):
   - Load `/home-awards-page`.
   - ID-9: click each of the 6 menu items → page smooth-scrolls to matching card; active gold+underline lands on the clicked item.
   - ID-11: at each step, exactly one item is gold/`aria-current`.
   - ID-12: click "Chi tiết" → URL becomes `/kudos-live-board`, same tab (no `target=_blank`).
   - ID-13: (already unit-covered) optionally confirm console clean during navigation.

## Todo List
- [x] `scroll-to-award-section.test.ts` — 7 test cases covering absent, happy path, strip #, type generics fixed
- [x] `pnpm test` green (vitest 337/337 passing)
- [x] Manual Playwright-MCP checklist ID-0/1/9/11/12/13 passed
- [x] Console clean (no errors) during interactions

## Success Criteria
- Unit tests pass in the existing vitest node env with no new dependencies.
- All four MoMorph test cases observably satisfied.

## Risk Assessment
- **Low** — DOM behaviors unverifiable in node env. Mitigation: the manual Playwright-MCP checklist covers exactly the parts unit tests cannot.

## Rollback
- Delete the test file (no production impact).

## Next Steps
- On green: hand to `reviewer` agent; update `docs/project-changelog.md`.
