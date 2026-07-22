---
title: "Kudo Hearts / Like on /kudos-live-board"
description: "Heart button on ALL KUDOS cards — toggle like, sync count, credit sender, one-per-user."
status: completed
priority: P2
effort: 4h
branch: feat.some-page
tags: [kudos, hearts, supabase, live-board, feature]
created: 2026-07-22
completed: 2026-07-22
---

# Kudo Hearts / Like — /kudos-live-board

Functional heart/like on the ALL KUDOS feed (real data). Click toggles like +
count and color (gray↔red). One heart per user per kudo; sender cannot heart own
kudo. Each heart credits the kudo SENDER via `kudos.hearts_count` (kept in sync by
a DB trigger, so the profile "Hearts received" stat stays correct for free).

Spec: MoMorph C.4.1 — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
Decisions: [clarifications.md](./clarifications.md) (authoritative).

## Scope
- IN: kudo_hearts table + RLS/grants/sync trigger; `toggleKudoHeart` action; feed
  enrichment (likedByMe / isOwnKudo); `heart-button.tsx` client component; tests + live verify.
- OUT (this run): special-day +2 (schema-ready via `hearts_value`, always 1 now);
  detail nav, hashtag/department filters; highlight carousel (stays mock).

## Phases
| # | Phase | Status | Depends on |
|---|-------|--------|-----------|
| 01 | [Migration: kudo_hearts + RLS + grants + sync trigger](./phase-01-migration.md) | ✓ completed | — |
| 02 | [Server action + feed data enrichment](./phase-02-action-and-feed-data.md) | ✓ completed | 01 |
| 03 | [UI heart button + card wiring + i18n](./phase-03-ui-heart-button.md) | ✓ completed | 02 |
| 04 | [Tests + live verify](./phase-04-tests-and-verify.md) | ✓ completed | 01, 02, 03 |

Phases are sequential (each leans on the prior). Small feature — 01–03 can run as a
single `implementer` pass (one file owner). 04 is a separate tester/verify pass.

## Key risks
- **Service-role bypasses RLS in mock mode** → action MUST enforce not-sender +
  one-per-user in code, not rely on RLS. (High → covered by tests, phase 02/04)
- **Missing GRANT insert/delete for `authenticated`** → 42501 in prod. Default
  privileges auto-grant SELECT only; insert/delete granted explicitly. (Med, phase 01)
- **hearts_count drift** → trigger is the SOLE writer of hearts_count; action only
  inserts/deletes kudo_hearts. (Med, phase 01/02)

## Follow-ups (deferred, schema/logic ready)
- **Code size:** `app/kudos-live-board/actions.ts` at 225 lines (exceeds 200-line convention). Extract hearts logic to dedicated `lib/kudos/hearts-actions.ts` module in later refactor.
- **TOCTOU window:** Structurally possible (23505 race on insert) but symptom-fixed via optimistic revert + reconcile. Consider adding conflict detection if race becomes frequent; not urgent (edge case only).
- **RLS self-like:** No distinct error code for self-like rejection in RLS insert policy. Current: caught in action code. Add `42P01` / new error enum in next iteration if fine-grained diagnostics needed.
- **Special-day +2 hearts:** Schema ready (`hearts_value` column + check constraint allowing 1..2). Logic not implemented. Backlog for future release (awaits business rule finalization).
- **Cross-viewer count freshness:** Count refreshes on page reload only; live sync via triggers isolated to that user's session. Real-time broadcast requires WebSocket/Supabase Realtime subscription—added to backlog, low priority.

## Definition of done
✓ `pnpm test` green (330/330, +20 this feature) · ✓ `pnpm lint` + `tsc` clean · ✓ migration applied + verified in psql
✓ browser: gray↔red toggle with ±1 count, persists on reload, own-kudo disabled
✓ `kudos.hearts_count` matches likes in psql; profile "Hearts received" reflects change
✓ review: 8/10, 0 critical, all MAJOR issues resolved
