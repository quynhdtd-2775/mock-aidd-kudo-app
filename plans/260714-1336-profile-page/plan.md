---
title: "Profile Page (/profile) — Backend/Data Track"
description: "Supabase schema, seed, and data-access layer feeding the /profile screen; UI built in parallel (Track A)."
status: completed
priority: P2
effort: 5h
branch: feat.home-page
tags: [profile, supabase, backend, momorph]
created: 2026-07-14
---

# Profile Page (/profile) — Implementation Plan

MoMorph screen: **Profile bản thân** — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/3FoIx6ALVb
Clarifications (authoritative): `./clarifications.md`

Two-track MoMorph structure. **Track A (UI) and Track B (data) run in parallel — no cross-track blocking.**
This plan owns Track B + integration; Track A is a single minimal phase executed by `tkm:takumi` later.

## Scope

Data/backend only. Feed the profile screen: current-user info, collectible-icon grid,
aggregate stats, and the list of kudos posts **received** by the user. Interactive elements
(Mở quà, Xem tất cả) stay static per clarifications — no gift-opening logic (YAGNI).

## Phases

| # | Phase | Track | Status | Depends on |
|---|-------|-------|--------|------------|
| 01 | [Supabase init + schema + seed](./phase-01-supabase-schema-seed.md) | B | completed | — |
| 02 | [Profile data-access layer](./phase-02-data-access-layer.md) | B | completed | 01 |
| 03 | [Profile UI (parallel)](./phase-03-track-a-ui.md) | A | completed | — (parallel) |
| 04 | [Integration — wire real data](./phase-04-integration.md) | B | completed | 01, 02, 03 |

## Dependency Graph

```
01 ──► 02 ──┐
            ├──► 04 (integration / merge point)
03 ─────────┘   (Track A runs free, joins only at 04)
```

## Key Architecture Decisions

- **Supabase CLI not installed, Docker not running.** Run via `pnpm dlx supabase` (no global install). `supabase start` requires Docker Desktop up — prerequisite for phase 01 verification.
- **Current-user resolution:** `DISABLE_AUTH=true` → seeded demo-user UUID; else real session user via `supabase.auth.getUser()`. Single helper, one code path for queries.
- **Stats are derived, not stored** (except boxes): kudos received/sent + hearts received come from `count`/`sum` queries. `boxes_opened`/`boxes_unopened` are static columns on `profiles` (no gift logic yet).
- **No separate `hearts` table** (YAGNI): screen shows only aggregate + per-post counts, so `hearts_count` is a column on `kudos`. Documented in phase 01.
- **Track A owns presentational components + initial mock page**; integration (phase 04) rewrites `app/profile/page.tsx` into a server component that fetches + passes props. No Track-B edits to Track-A component files.

## File Ownership (no overlap)

- Phase 01 → `supabase/**`
- Phase 02 → `lib/profile/**`
- Phase 03 (Track A) → `components/profile/**`, `app/profile/page.tsx` (initial mock)
- Phase 04 → `app/profile/page.tsx` (rewrite), `.env.local.example`

## Completion Summary

**Testing & Review:**
- Vitest configured (`vitest.config.ts`)
- 24/24 tests pass (`lib/profile/*.test.ts`)
- Reviewer score: 7/10, 0 critical, 2 majors fixed (avatar plumbing, test lint)
- Review report: `plans/reports/reviewer-260714-1421-profile-page.md`

**Caveats & Deferred Work:**
- `supabase start` / `db reset` verification deferred (Docker not installed on this machine)
- Visual parity check with seeded data deferred pending Docker
- Test files exceed 200-line guideline (tech debt noted for later refactor)
- Secret box icon asset files missing; SVG placeholders rendering in place

## Unresolved Questions

- Exact collectible-icon count/artwork on the screen (locked vs unlocked) — Track A extracts from Figma; phase 01 seeds a representative catalog to match.
