# Phase 01 — i18n Infrastructure (next-intl cookie mode)

## Context Links
- Plan: [plan.md](plan.md) · Clarifications: [clarifications.md](clarifications.md)
- Verified refs: next-intl docs — [App Router](https://next-intl.dev/docs/getting-started/app-router),
  [Request config](https://next-intl.dev/docs/usage/configuration)
- Files read: `app/layout.tsx`, `next.config.ts`, `proxy.ts`

## Overview
- **Priority:** P1 (foundation — 02/03/04 all depend on it)
- **Status:** completed
- Stand up next-intl in **cookie mode, no i18n routing**. Provide the locale contract, the request
  config that reads the cookie, empty-but-valid message catalogs, and the client provider in the root
  layout. No strings are extracted yet (that is phase 03).

## Key Insights
- next-intl 4.x supports Next.js 16. Cookie mode needs NO middleware/proxy changes, NO
  `generateStaticParams`, NO `setRequestLocale` — those belong to locale-routing/static rendering only.
- `proxy.ts` (Next 16's renamed middleware) already exists and must stay untouched here.
- Root layout is a server component and already `async`-free; adding `getLocale()/getMessages()` makes
  it `async` — verify nothing depends on it being sync.
- `NextIntlClientProvider` inherits locale/messages automatically when rendered by a server component.

## Requirements
**Functional**
- App resolves a locale on every request: cookie value if valid, else `DEFAULT_LOCALE` (`vi`).
- `useTranslations`/`getTranslations` work in both server and client components.
- `<html lang>` reflects the active locale.

**Non-functional**
- Files < 200 lines, kebab-case. No behavior change for existing pages (they render, untranslated).

## Architecture / Data Flow
```
request → i18n/request.ts getRequestConfig
            reads cookie NEXT_LOCALE (via next/headers cookies())
            → validate against SUPPORTED_LOCALES, fallback DEFAULT_LOCALE
            → { locale, messages: messages/{locale}.json }
app/layout.tsx (server) → getLocale() + getMessages()
            → <html lang={locale}> + <NextIntlClientProvider>
```

## Related Code Files
**Create**
- `lib/i18n/locale-config.ts` — `SUPPORTED_LOCALES = ['vi','en'] as const`, `type Locale`,
  `DEFAULT_LOCALE = 'vi'`, `LOCALE_COOKIE = 'NEXT_LOCALE'`, `isLocale(x): x is Locale`. Single source
  of truth for the locale contract (imported by 02, 03, 04).
- `i18n/request.ts` — `getRequestConfig` reading `LOCALE_COOKIE` via `cookies()`, validating with
  `isLocale`, dynamic-importing `messages/${locale}.json`.
- `messages/vi.json` — valid JSON, seeded with minimal namespaces used in phase 03 (may start `{}`).
- `messages/en.json` — same shape as `vi.json`.

**Modify**
- `next.config.ts` — wrap export with `createNextIntlPlugin('./i18n/request.ts')` from `next-intl/plugin`.
- `app/layout.tsx` — make `RootLayout` async; `const locale = await getLocale();
  const messages = await getMessages();` set `<html lang={locale}>`; wrap `{children}` (keep
  `<AuthStateListener/>`) in `<NextIntlClientProvider messages={messages}>`.
- `package.json` — add `next-intl` dependency (`pnpm add next-intl`).

## Implementation Steps
1. `pnpm add next-intl`; confirm resolved version supports Next 16 (>=4.x).
2. Create `lib/i18n/locale-config.ts` with the contract above.
3. Create `i18n/request.ts` (cookie read + validate + message import).
4. Create `messages/vi.json` and `messages/en.json` (valid JSON, identical key shape).
5. Wrap `next.config.ts` with `createNextIntlPlugin('./i18n/request.ts')`.
6. Update `app/layout.tsx` (async, `<html lang={locale}>`, provider).
7. `pnpm build` (or `pnpm dev`) — app compiles and renders untranslated.

## Todo List
- [x] Install next-intl
- [x] `lib/i18n/locale-config.ts`
- [x] `i18n/request.ts`
- [x] `messages/vi.json` + `messages/en.json`
- [x] `next.config.ts` plugin wrap
- [x] `app/layout.tsx` provider + `lang`
- [x] Build passes

## Success Criteria
- Build succeeds. Setting `NEXT_LOCALE=en` cookie manually switches `<html lang>` to `en`.
- No existing route breaks (home, login, countdown still render).
- Contract exports importable from `lib/i18n/locale-config.ts`.

## Risk Assessment
- **next-intl ↔ Next 16 incompatibility (Med likelihood / High impact):** pin to a 4.x release that
  lists Next 16 support; if plugin fails, fall back to reading messages directly in layout without the
  SWC plugin. Countermove: verify build immediately after step 5.
- **Root layout → async regression (Low/Med):** confirm `AuthStateListener` (client) still mounts.

## Security Considerations
- Cookie value is untrusted input → MUST validate with `isLocale` before dynamic import (prevents
  path traversal in `messages/${locale}.json`).

## Rollback
- Revert `next.config.ts` + `app/layout.tsx`, remove `i18n/`, `messages/`, `lib/i18n/`, uninstall
  next-intl. No DB or data touched.

## Next Steps
- Unblocks phase 02 (uses `LOCALE_COOKIE`, `Locale`) and phase 03 (uses provider + messages files).
