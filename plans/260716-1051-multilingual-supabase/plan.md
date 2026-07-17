---
title: "Multilingual (VN/EN) i18n with Supabase preference"
description: "Cookie-based next-intl i18n (no URL prefix) for home + header/footer, with Supabase-persisted language preference."
status: completed
priority: P2
effort: 8h
branch: feat.home-page
tags: [i18n, next-intl, supabase, home-page]
created: 2026-07-16
---

# Multilingual (VN/EN) with Supabase preference

Cookie-based locale switching via **next-intl** (no URL locale prefix; existing routes unchanged).
Default **vi**. Static JSON translations in `messages/`. Logged-in users persist their choice to
`public.profiles.language`; guests use the cookie only. Scope THIS task: home page
(`app/home-page-saa/page.tsx`) + shared header/footer (`components/home/*`).

> Verified: next-intl 4.x is compatible with Next.js 16 App Router; cookie-based mode reads the
> locale in `i18n/request.ts` (no i18n routing, no `setRequestLocale`/`generateStaticParams` needed —
> those are routing/static-rendering only). Middleware is `proxy.ts` in Next 16 (already present).

## Track model (MoMorph parallel rule)
- **Track A (UI, external):** presentational dropdown at `components/language-dropdown/` is built by a
  separate background agent (props: current locale + `onSelect`, own open/close state). NOT a phase here.
- **Track B (backend/i18n):** phases 01–03, 05 below. No `blocks`/`blockedBy` cross Track A↔B.
- **Integration (phase 04):** wires the finished Track A dropdown into `site-header`. Merge point.

## Phases

| # | Phase | Status | Depends on |
|---|-------|--------|-----------|
| 01 | [i18n infrastructure (next-intl cookie mode)](phase-01-i18n-infrastructure.md) | completed | — |
| 02 | [Supabase migration + preference persistence](phase-02-supabase-preference.md) | completed | 01 |
| 03 | [Extract home + header/footer strings](phase-03-extract-strings.md) | completed | 01 |
| 04 | [Integration: wire dropdown into site-header](phase-04-integration.md) | completed | 02, 03 + Track A |
| 05 | [Tests](phase-05-tests.md) | completed | 04 |

## Key dependencies
- 01 establishes the locale contract (`SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, cookie name) reused by all.
- 02 + 03 both depend only on 01 → runnable in parallel within Track B.
- 04 is the single merge point (needs 02's `setLocale` action, 03's translated header, Track A dropdown).

## Non-goals (YAGNI)
- No URL locale prefix / locale routing. No translation of pages outside home + header/footer.
- No building the dropdown visuals (Track A owns them). No admin UI for editing translations.

## Note / discrepancy to confirm
- Task brief names `app/page.tsx` as "home page", but that file only `redirect("/home-page-saa")`.
  The real home UI is `app/home-page-saa/page.tsx` using `components/home/*`. Plan targets the latter.
