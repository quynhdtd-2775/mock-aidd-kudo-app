# Phase 04 — Integration: Wire Real Data into Profile UI

**Track:** B (merge point) · **Priority:** P1 · **Status:** completed · **Depends on:** 01, 02, 03

## Context Links
- Plan: `./plan.md` · Data layer: `./phase-02-data-access-layer.md` · UI contract: `./phase-03-track-a-ui.md`

## Overview
Replace Track A's mock data with real Supabase-backed data by rewriting `app/profile/page.tsx`
into a server component that fetches via the phase-02 layer and passes typed props to Track A
components. Merge point only — runs after both tracks land.

## Key Insights
- Track A components are presentational and already accept the integration-contract props — integration is prop wiring, not restructuring.
- Field-name alignment between phase-02 types and Track A props was fixed in the contract; verify at wire-up.

## Requirements
Functional:
- `/profile` renders real demo-user data under `DISABLE_AUTH=true`.
- Received-kudos list, stats, icon grid (locked/unlocked), user header all reflect seeded DB.
- Empty/error states: no profile → render safe empty; query error → empties, no crash.
Non-functional: server component (no client fetch); page < 200 lines (extract a small mapper if needed).

## Architecture — Data Flow
`app/profile/page.tsx` (server) → `resolveCurrentUserId()` → `Promise.all([getProfile, getReceivedKudos, getProfileStats, getIconCollection])` → map to props → render Track A components.

## Related Code Files
Modify: `app/profile/page.tsx` (rewrite mock → server fetch), `.env.local.example` (add Supabase vars if missing).
Read: `lib/profile/*`, `components/profile/*`.
Delete: any mock-data module Track A created solely for the page (only if fully replaced).

## Implementation Steps
1. Rewrite `page.tsx` as async server component; resolve user id.
2. Fetch four groups in parallel; handle null user (empty state).
3. Map query results → Track A component props; render.
4. Verify against seed with `DISABLE_AUTH=true`; toggle off to confirm session path (needs auth configured).

## Todo List
- [x] server-component page.tsx fetching real data → `app/profile/page.tsx`
- [x] prop mapping matches Track A contract → `lib/profile/profile-view-mappers.ts`
- [x] empty/error handling (safe empty state when DB unreachable)
- [x] avatar plumbing fixed per review (senderAvatarUrl aligned)

## Success Criteria
`/profile` shows seeded demo data end-to-end; no console/runtime errors; removing mock import leaves no dead code.

## Test Matrix
- Unit: phase-02 query fns (mapping, empty results) — hand to `tester`.
- Integration: page renders with seeded DB (DISABLE_AUTH=true).
- E2E/manual: visual parity with MoMorph screen; locked icons gray; received-only kudos list.

## Risk Assessment
- **Prop-shape mismatch (Med):** contract in phase 03 is the guard; reconcile field names at wire-up, adjust the mapper (not Track A components).
- **File-ownership clash on page.tsx (Low):** integration runs after Track A completes, so no concurrent edit.

## Rollback
Revert `page.tsx` to Track A's mock version — data layer and schema are additive, no destructive migration to undo.

## Next Steps
After green: update `docs/system-architecture.md` (add `/profile` route + Supabase schema note) via `doc-writer`.
