---
title: "Homepage SAA (/home-page-saa) — MoMorph spec completion"
description: "Wire countdown, notifications, admin menu, widget modal, and awards hash-scroll on the existing homepage."
status: pending
priority: P2
effort: 11h
branch: feat.some-page
work_type: feature
spec_waived: "SDD mode disabled (takumi.sddMode: off)"
tags: [homepage, countdown, notifications, supabase, i18n]
created: 2026-07-23
---

# Homepage SAA — Spec Completion

The `/home-page-saa` route already renders and is auth/i18n/logout-wired. This plan finishes the
remaining MoMorph-spec behaviors (screen i87tDx10uM). Data source: local Supabase. Reuse existing
patterns (countdown display, kudos launcher, RLS migrations). Authoritative decisions in
`clarifications.md` — do not revisit.

## Tracks

- **Track A** (parallel UI, ALREADY RUNNING) — homepage copy + visual fixes. Files off-limits to Track B.
- **Track B** (backend/logic, this plan) — DB, countdown wiring, notifications, menu, modal, scroll, tests.

## Phases

| # | Phase | Status | Blocked by |
|---|-------|--------|-----------|
| A1 | [Homepage UI copy & visual fixes](phase-A1-homepage-ui.md) | in-progress | — |
| B1 | [DB: notifications table + profiles.role + seed](phase-B1-db-migrations-seed.md) | pending | — |
| B2 | [Countdown wiring (non-redirecting variant)](phase-B2-countdown-wiring.md) | pending | — |
| B3 | [Notifications bell panel + unread badge](phase-B3-notifications-bell.md) | pending | B1 |
| B4 | [Account menu admin item + Profile + /admin route](phase-B4-account-menu-admin.md) | pending | B1, B3 |
| B5 | [Widget button → WriteKudoModal](phase-B5-widget-button-modal.md) | pending | — |
| B6 | [Awards page hash-scroll-on-load](phase-B6-awards-hash-scroll.md) | pending | — |
| B7 | [Unit tests for new logic](phase-B7-tests.md) | pending | B2, B3, B6 |

## Key dependencies & ordering

- B1 unblocks the two data-backed UI phases (B3 notifications, B4 role menu).
- B3 and B4 both edit `components/home/site-header.tsx` → **serialized** (B4 blockedBy B3) to avoid a file clash.
- B2, B5, B6 are independent Track-B phases (no cross-blocks) — run in any order.
- B7 runs last against the final code (tests the pure helpers extracted in B2/B3/B6).
- **Track A ↔ Track B are never mutually blocked.** Cross-track touchpoints handled as integration
  contracts inside the relevant phase (message keys for B3/B4/B5; award-card hash links for B6).

## Cross-track integration contracts (resolved at merge, NOT by editing Track A files)

- New i18n keys required by B3/B4/B5 (Header/UserMenu/Notifications namespaces) are listed in those
  phases and must be added to `messages/vi.json` + `messages/en.json` (Track A files) during integration.
- Homepage award cards (Track A, `components/home/award-card.tsx`) emit `/home-awards-page#<slug>`
  links that B6's hash-scroll-on-load consumes. Slugs = `CARD_ANCHORS` (shared contract).

## Global success criteria

`pnpm lint`, `pnpm test` (Vitest, node env), and `pnpm build` all pass. Existing i18n switch, auth
gating, prelaunch countdown redirect, and logout unaffected.
