# Phase 02 — Profile Data-Access Layer

**Track:** B (backend) · **Priority:** P1 · **Status:** completed · **Depends on:** phase 01

## Context Links
- Plan: `./plan.md` · Schema: `./phase-01-supabase-schema-seed.md`
- Clients: `lib/supabase/server.ts` (server), `lib/supabase/middleware.ts` (DISABLE_AUTH bypass)

## Overview
Server-side query layer that resolves the current user (demo fallback) and returns the four
data groups the profile screen consumes. Pure data — no JSX.

## Key Insights
- Middleware already short-circuits auth when `DISABLE_AUTH=true`; the data layer must mirror that: when the flag is on, return the seeded demo UUID instead of calling `getUser()`.
- Use the existing server client (`createClient()` from `lib/supabase/server.ts`) — do not add a new client.
- Keep each module < 200 lines; split query fns from types.

## Requirements
Functional:
- `resolveCurrentUserId()` → demo UUID if `DISABLE_AUTH==="true"` (dev), else `supabase.auth.getUser()` id; null if unauthenticated.
- `getProfile(userId)` → display_name, hero_code, avatar_url, hero_badge, box counts.
- `getReceivedKudos(userId)` → kudos where receiver_id = userId, joined to sender profile (name, hero_code, hero_badge), ordered by created_at desc.
- `getProfileStats(userId)` → { kudosReceived, kudosSent, heartsReceived, boxesOpened, boxesUnopened }.
- `getIconCollection(userId)` → catalog list, each with `unlocked: boolean` (left join user_icon_unlocks).

Non-functional: typed return shapes exported for phase 04; graceful null/empty handling; wrap queries in try/catch, return safe empties on error.

## Architecture — Data Flow
`page (server component)` → `resolveCurrentUserId()` → parallel `getProfile / getReceivedKudos / getProfileStats / getIconCollection` → typed objects → props for Track A components.

## Related Code Files
Create:
- `lib/profile/current-user.ts` — `resolveCurrentUserId()` + demo UUID constant (shared with seed).
- `lib/profile/profile-queries.ts` — the four query functions.
- `lib/profile/profile-types.ts` — `ProfileData`, `ReceivedKudo`, `ProfileStats`, `IconCollectionItem`.

Read for context: `lib/supabase/server.ts`, phase 01 schema.
Modify/Delete: none.

## Implementation Steps
1. Define types in `profile-types.ts` (align field names with Track A integration contract in phase 03).
2. `current-user.ts`: export `DEMO_USER_ID` (same UUID as seed) + `resolveCurrentUserId()`.
3. `profile-queries.ts`: implement four fns using server client; use `count: 'exact', head: true` for stat counts, `sum` via RPC or fetch+reduce for hearts (small dataset → fetch hearts_count of received kudos and reduce).
4. Ensure hero_badge string maps to Track A's `HeroBadgeVariant` union (`new|rising|legend|super`).

## Todo List
- [x] profile-types.ts → `lib/profile/profile-types.ts`
- [x] current-user.ts (demo fallback) → `lib/profile/current-user.ts`
- [x] profile-queries.ts (4 fns) → `lib/profile/profile-queries.ts`
- [x] hero_badge type alignment
- [x] senderAvatarUrl added post-review

## Success Criteria
Called from a scratch server route, functions return the seeded demo user's data with correct received-kudos list and stat counts; DISABLE_AUTH toggle switches user source.

## Risk Assessment
- **Demo UUID drift (Med):** seed and `current-user.ts` must share one constant — document the value in both; single source of truth is the seed file, mirrored in a comment.
- **Sum-of-hearts query (Low):** Supabase JS has no direct SUM; fetch received kudos hearts_count and reduce in JS (dataset tiny). Acceptable.

## Security Considerations
Demo fallback guarded by `NODE_ENV !== "production"` like the middleware bypass. Never expose service-role key; use anon client only.

## Next Steps
Unblocks phase 04 integration.
