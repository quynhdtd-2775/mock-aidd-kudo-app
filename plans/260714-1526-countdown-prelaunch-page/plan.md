---
title: "Countdown Prelaunch Page — Backend/Logic (Track B)"
description: "DB-backed launch_at, server nav-lock, countdown math + at-zero redirect, integration & tests"
status: completed
priority: P2
effort: 6h
branch: feat.home-page
tags: [countdown, supabase, proxy, nextjs16]
created: 2026-07-14
completed: 2026-07-14
---

# Countdown Prelaunch Page — Track B (Backend/Logic) + Track A UI

Route `/count-down-prelaunch` shows a DAYS/HOURS/MINUTES countdown to a launch instant
stored in Supabase. Before launch, server-side nav-lock forces all routes here; at zero
the client redirects to `/`. All 6 phases + Track A UI completed. See reports in `plans/reports/`.

## Phases — All Complete

| # | Phase | Track | Status | Notes |
|---|-------|-------|--------|-------|
| 01 | [DB migration + seed (`event_settings`)](phase-01-db-migration-event-settings.md) | B | done | DB verify pending (Docker unavailable) |
| 02 | [Data access + cached launch_at accessor](phase-02-data-access-launch-at.md) | B | done | 60s TTL cache ✓ |
| 03 | [Countdown math + ticking hook + at-zero redirect](phase-03-countdown-math-and-hook.md) | B | done | Hook accepts `Date \| null` |
| 04 | [Proxy nav-lock (server-side gate)](phase-04-proxy-nav-lock.md) | B | done | Post-review: COUNTDOWN_PATH added to PUBLIC_PATHS |
| 05 | [Integration: wire real launch_at into UI](phase-05-integration.md) | B+A | done | page.tsx uses getCachedLaunchAt(); docs via doc-writer |
| 06 | [Tests (vitest)](phase-06-tests.md) | B | done | 160 tests, 6 files ✓; middleware regression suite: 20 tests ✓ |
| A | UI: app/count-down-prelaunch/ | A | done | Monospace fallback (Digital font unavailable); Playwright locked |

## Summary
- **Track B (backend/logic)**: 6 phases, all done. Tests passing (160 tests across math, cache, nav-lock, middleware).
- **Track A (UI)**: done; rendered from Figma design, integrated with real countdown logic.
- **Critical fix** (post-review): COUNTDOWN_PATH added to PUBLIC_PATHS in middleware — anonymous access required.
- **Docs**: system-architecture.md updated by doc-writer session.
- **Blockers**: DB-level verification (Phase 01) blocked by Docker unavailability; marked pending-external.
