# Phase 04 — Integration: Wire Dropdown into Site Header

## Context Links
- Plan: [plan.md](plan.md) · Depends on [phase-02](phase-02-supabase-preference.md),
  [phase-03](phase-03-extract-strings.md), and **Track A** (`components/language-dropdown/`)
- MoMorph — Dropdown ngôn ngữ: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/hUyaaugye2
- Files read: `components/home/site-header.tsx`, `components/home/user-menu.tsx` (client pattern)

## Overview
- **Priority:** P1
- **Status:** completed
- **Merge point.** Replace the static language-selector placeholder in `site-header.tsx` with the
  finished Track A dropdown, wired to phase 02's `setLocale` action and the active locale from next-intl.

## Track A Integration Contract (what phase 04 expects from the external UI agent)
- Component at `components/language-dropdown/` (presentational, `"use client"`).
- Props (assumed; confirm on delivery): `currentLocale: 'vi' | 'en'` and
  `onSelect: (locale: 'vi' | 'en') => void`. Owns its own open/close state and visuals (flag + label +
  chevron + menu). Renders nothing locale-persisting itself.
- If actual prop names differ, adapt in the client wrapper below — do NOT edit Track A's files.

## Key Insights
- `SiteHeader` is a **server** component; the dropdown + its `onSelect` handler are **client**. Bridge
  with a thin client wrapper that owns the handler and calls the server action + `router.refresh()`.
- `setLocale` (phase 02) is a server action → callable from the client wrapper; after it resolves,
  `router.refresh()` re-renders server components so the new locale/messages take effect without full reload.
- Active locale comes from `getLocale()` (server, in SiteHeader) passed down as a prop.

## Requirements
**Functional**
- Selecting a language: updates cookie (+ DB if logged in), UI re-renders in the chosen locale, dropdown
  reflects the new current locale.
- Placeholder markup fully removed; no dead flag/chevron code left behind.

**Non-functional**
- Wrapper < 200 lines; kebab-case. No visual regression vs the MoMorph dropdown design.

## Architecture / Data Flow
```
SiteHeader (server): const locale = await getLocale()
   └─► <LanguageSwitcher currentLocale={locale} />   (client wrapper — new file)
          └─► <LanguageDropdown currentLocale onSelect={handleSelect} />  (Track A)
                 handleSelect(next): startTransition(() => setLocale(next).then(router.refresh))
```

## Related Code Files
**Create**
- `components/home/language-switcher.tsx` — `"use client"`; imports Track A `LanguageDropdown` +
  `setLocale`; owns `handleSelect` (calls action, `useRouter().refresh()`, optional `useTransition`).

**Modify**
- `components/home/site-header.tsx` — delete the inline language-selector `<div>` block
  (`mm:I2167:9091;186:1696`), render `<LanguageSwitcher currentLocale={await getLocale()} />` in its place.

## Implementation Steps
1. On Track A delivery, read `components/language-dropdown/` to confirm export name + prop shape.
2. Create `components/home/language-switcher.tsx` bridging dropdown → `setLocale` → `router.refresh()`.
3. In `site-header.tsx`, import `getLocale`, remove the placeholder block, mount `<LanguageSwitcher>`.
4. `pnpm build`; manual test: switch vi↔en as guest (cookie) and as logged-in user (cookie + DB).

## Todo List
- [x] Confirm Track A export + props
- [x] `language-switcher.tsx` wrapper
- [x] Replace placeholder in `site-header.tsx`
- [x] Manual switch test (guest + logged-in)
- [x] Build passes

## Success Criteria
- Clicking EN switches the whole home page to English and marks EN current; VN switches back.
- Logged-in switch persists across reload (DB); guest switch persists across reload (cookie).
- No leftover placeholder markup; `mm:` design fidelity preserved.

## Risk Assessment
- **Track A not delivered / prop mismatch (Med/High):** blocks the swap. Countermove: contract above +
  adapt only in the wrapper; if Track A late, `setLocale` + wrapper can be tested against a temporary
  minimal button, then dropdown dropped in.
- **Stale UI after switch (Med/Med):** forgetting `router.refresh()` leaves old locale on screen.
  Countermove: refresh in the handler; verify in manual test.
- **Server/client boundary error (Low/Med):** wrapper MUST be `"use client"`; SiteHeader stays server.

## Security Considerations
- Locale still validated in `setLocale` (phase 02) — the client passes only `'vi'|'en'`, but never trust it.

## Rollback
- Restore the inline placeholder block in `site-header.tsx`; delete `language-switcher.tsx`. i18n from
  phases 01–03 still functions (just no in-UI switcher).

## File Ownership
- Owns `components/home/language-switcher.tsx` + the selector region of `site-header.tsx`. Runs AFTER
  phase 03's header edits (blockedBy 03) → no concurrent write. Never edits `components/language-dropdown/`.

## Next Steps
- Phase 05 tests the switch + persistence end-to-end.
