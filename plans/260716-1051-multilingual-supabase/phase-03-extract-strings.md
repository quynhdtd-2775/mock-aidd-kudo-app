# Phase 03 — Extract Home + Header/Footer Strings

## Context Links
- Plan: [plan.md](plan.md) · Depends on [phase-01](phase-01-i18n-infrastructure.md)
- Files read: `app/home-page-saa/page.tsx`, `components/home/*`

## Overview
- **Priority:** P1
- **Status:** completed
- Replace hard-coded VN/EN copy in the home page + shared header/footer with next-intl message keys.
  Populate `messages/vi.json` and `messages/en.json`. Vietnamese text = the existing on-screen copy
  (source of truth); English = translated equivalents.

## Key Insights
- Real home route is `app/home-page-saa/page.tsx` (NOT `app/page.tsx`, which only redirects). It also
  carries `metadata` (title/description) that is Vietnamese — translate via `getTranslations` in a
  `generateMetadata` if metadata localization is desired (optional; keep static VN if out of scope).
- `SiteHeader` is a **server component** (`async`) → use `getTranslations` (server API), not the hook.
- Client components in `components/home/*` (e.g. `user-menu.tsx`, `hero-*` if `"use client"`) → use
  `useTranslations`. Check each file's directive before choosing the API.
- The header's inline language selector (VN flag + "VN" + chevron) is a **static placeholder** — leave
  it in place here; phase 04 replaces it with the Track A dropdown. Do NOT delete it in this phase to
  avoid a broken intermediate state.
- Strings visible: nav labels ("About SAA 2025", "Award Information", "Sun* Kudos"), aria-labels
  ("Tài khoản"), hero/awards/sunkudos section copy, footer copy, flag `alt` ("Tiếng Việt").

## Requirements
**Functional**
- All user-visible copy in `app/home-page-saa/page.tsx` + `components/home/*` reads from messages.
- `messages/vi.json` renders identical to today's screen; `messages/en.json` gives the English variant.
- Message namespaces organized per component (e.g. `Header`, `Footer`, `Hero`, `Awards`, `SunKudos`).

**Non-functional**
- No layout/markup changes beyond swapping literals for `t('key')`. Files stay < 200 lines.

## Architecture / Data Flow
```
messages/{vi,en}.json  ──(provider from phase 01)──►
   server comps: getTranslations('Namespace') → t('key')
   client comps: useTranslations('Namespace') → t('key')
```

## Related Code Files
**Modify**
- `app/home-page-saa/page.tsx` — (optional) localized `generateMetadata`.
- `components/home/site-header.tsx` — nav labels, aria-labels via `getTranslations('Header')`.
- `components/home/site-footer.tsx` — footer copy.
- `components/home/hero-section.tsx`, `hero-countdown.tsx`, `hero-cta.tsx`, `hero-theme-intro.tsx`,
  `hero-widget-button.tsx` — hero copy.
- `components/home/awards-section.tsx`, `award-card.tsx` — awards copy.
- `components/home/sunkudos-section.tsx` — SunKudos copy.
- `components/home/user-menu.tsx` — menu labels/aria (client → `useTranslations`).
- `messages/vi.json`, `messages/en.json` — fill all keys.

## Implementation Steps
1. Inventory every literal string across the files above; group into namespaces.
2. Add keys to `messages/vi.json` (VN = current copy) and `messages/en.json` (EN translation).
3. Per file: pick `getTranslations` (server) or `useTranslations` (client) by its directive; replace
   literals with `t('key')`. Keep `mm:` design-ref comments intact.
4. Leave the inline language selector placeholder untouched.
5. `pnpm build`; visually verify home renders unchanged in vi, and in en with a manual cookie flip.

## Todo List
- [x] String inventory + namespace map
- [x] Fill `vi.json`
- [x] Fill `en.json`
- [x] site-header + site-footer
- [x] hero-* components
- [x] awards-section + award-card + sunkudos-section
- [x] user-menu
- [x] Build + visual check both locales

## Success Criteria
- vi render is pixel-identical to pre-change home. en render shows English copy after cookie flip.
- No hard-coded user-visible strings remain in the listed files (spot-check via grep for Vietnamese diacritics).
- `vi.json` and `en.json` have identical key sets (no missing keys → no fallback warnings).

## Risk Assessment
- **Server vs client API misuse (Med/Med):** `useTranslations` in a server comp (or vice versa) errors
  at build. Countermove: check `"use client"` per file before editing.
- **Key drift between vi/en (Med/Low):** missing en key → next-intl warns/falls back. Countermove: keep
  the two files in lockstep; a test asserts key-set equality (phase 05).
- **Untranslatable design refs (Low):** do not touch `mm:` comments or class names.

## Security Considerations
- None new (static content only).

## Rollback
- Revert the component files to literals; empty the message catalogs. Phase 01 infra remains.

## File Ownership
- Owns `components/home/*` string edits + `messages/*`. Phase 04 edits `site-header.tsx` AFTER this
  phase (sequential via 04.blockedBy=03) → no concurrent write conflict.

## Next Steps
- Phase 04 swaps the placeholder selector for the real dropdown and consumes these Header messages.
