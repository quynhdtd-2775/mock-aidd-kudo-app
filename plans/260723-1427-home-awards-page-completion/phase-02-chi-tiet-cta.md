# Phase 02 — "Chi tiết" CTA navigation

## Context Links
- File: `components/home-awards-page/sunkudos-section.tsx` (button ~line 92)
- Target route: `app/kudos-live-board/page.tsx` (exists)
- Decision: `clarifications.md` → navigate to `/kudos-live-board`, same tab
- Convention: `next/link` already used in `site-header.tsx` / `site-footer.tsx`

## Overview
- Priority: P2 | Status: complete
- Replace the inert `<button type="button">` with a `next/link` `<Link>` to `/kudos-live-board`,
  keeping all existing classes, inline styles, and the `IconUp`.

### Completion Notes
- `sunkudos-section.tsx` button element replaced with `next/link` Link element to `/kudos-live-board`.
- All styling, icons, and children preserved byte-identically.
- Manual Playwright verification: CTA navigates to `/kudos-live-board` same tab (ID-12).

## Requirements
- Functional (ID-12): activating "Chi tiết" navigates to `/kudos-live-board` in the same tab.
- Non-functional: styling identical; `SunKudosSection` stays an async server component (Link works
  in server components — no `"use client"`); file < 200 lines.

## Architecture / Data Flow
```
sunkudos-section.tsx (server)
  <Link href="/kudos-live-board" className={…same as button…} style={…same…}>
     <span>…detailsButton…</span> <IconUp/>
  </Link>
```

## Related Code Files
- Modify: `components/home-awards-page/sunkudos-section.tsx` — add `import Link from "next/link"`; swap the `<button>` element for `<Link href="/kudos-live-board">`; drop `type="button"`; keep every className, the inline `style` (padding/bg/color), inner `<span>` structure, and `<IconUp/>`.

## Implementation Steps
1. Add `import Link from "next/link";` at top.
2. Replace `<button type="button" …>…</button>` with `<Link href="/kudos-live-board" …>…</Link>`, carrying className + style + children unchanged.
3. Compile check / build.

## Todo List
- [x] `<button>` replaced by `<Link href="/kudos-live-board">`
- [x] className, inline style, inner span, `IconUp` preserved
- [x] Build passes

## Success Criteria
- Clicking "Chi tiết" loads `/kudos-live-board` in the same tab; button visuals unchanged.

## Risk Assessment
- **Low** — `<Link>` renders an `<a>`; button-specific styles (`active:translate-y-px`) still apply to anchors. Mitigation: visual check in browser (Phase 03).

## Rollback
- Revert the single-file change.

## Next Steps
- Verified in Phase 03 manual checklist (ID-12).
