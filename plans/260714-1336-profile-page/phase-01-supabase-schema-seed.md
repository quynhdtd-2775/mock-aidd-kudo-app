# Phase 01 — Supabase Init + Schema Migrations + Seed

**Track:** B (backend) · **Priority:** P1 · **Status:** completed · **Depends on:** none

## Context Links
- Plan: `./plan.md` · Clarifications: `./clarifications.md`
- MoMorph: Profile bản thân — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/3FoIx6ALVb
- Existing clients: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/middleware.ts`
- Mock content to mirror in seed: `components/kudos-live-board/kudo-posts-data.ts`, `kudo-hero-badge.tsx`

## Overview
Initialize Supabase in the repo and define the minimal schema + seed the profile screen needs.
No schema exists today; `supabase/` dir absent; Supabase CLI not installed; Docker not running.

**Caveat:** `supabase start` / `db reset` verification deferred. Docker not installed on this machine; all SQL files created and reviewable.

## Key Insights
- Run CLI via `pnpm dlx supabase` (no global install). `supabase start` needs Docker Desktop running — prerequisite before any local verification.
- Hero badge next to name is an enum variant (`new|rising|legend|super`) — reuse as a text column, not a table.
- Collectible-icon grid = catalog + per-user unlock join (gray when no unlock row).
- Hearts shown only as counts → `hearts_count` column on `kudos`, no `hearts` table (YAGNI).

## Requirements
Functional: seed one demo user (matches design mock — name "Huỳnh Dương Xuân", hero_code CEVC10, legend badge, avatar), a few sender users, ~4 kudos **received** by demo user, an icon catalog with a mix of unlocked/locked for the demo user, and box counts.
Non-functional: migrations idempotent & ordered; seed re-runnable via `supabase db reset`.

## Architecture — Data Model
Tables (public schema; RLS enabled, permissive read policy for authenticated + anon during local dev):

- **profiles** — `id uuid pk` (refs `auth.users`), `display_name text`, `hero_code text`, `avatar_url text`, `hero_badge text` (enum-like: new|rising|legend|super), `boxes_opened int default 0`, `boxes_unopened int default 0`, `created_at timestamptz default now()`.
- **kudos** — `id uuid pk default gen_random_uuid()`, `sender_id uuid` (refs profiles), `receiver_id uuid` (refs profiles), `hashtag_title text`, `message text`, `attachment_count int default 0`, `hashtags text`, `hearts_count int default 0`, `created_at timestamptz`.
- **secret_box_icons** (catalog) — `id uuid pk`, `name text`, `image_url text`, `sort_order int`.
- **user_icon_unlocks** (join) — `user_id uuid` refs profiles, `icon_id uuid` refs secret_box_icons, `unlocked_at timestamptz default now()`, pk (`user_id`,`icon_id`).

Relationships: kudos.sender_id / receiver_id → profiles.id. user_icon_unlocks → profiles + secret_box_icons.
Stats derivation (used in phase 02): kudos received = count(receiver_id=me); kudos sent = count(sender_id=me); hearts received = sum(hearts_count where receiver_id=me); boxes = profile columns.

## Seed Strategy
- Insert demo profile with a **fixed UUID constant** (reused by the demo-fallback in phase 02).
- 2–3 sender profiles (names/hero codes from mock data).
- 4 kudos rows received by demo user, text/hashtags/attachment/hearts mirrored from `kudo-posts-data.ts` (heartsCount "1.000" → `hearts_count = 1000`).
- Icon catalog ~6–8 entries; unlock ~half for demo user (rest render gray).
- Box counts on demo profile (small non-zero placeholders).

## Related Code Files
Create: `supabase/config.toml` (via init), `supabase/migrations/<ts>_profile_schema.sql`, `supabase/seed.sql`.
Modify: none. Delete: none.

## Implementation Steps
1. `pnpm dlx supabase init` (generates `supabase/config.toml`).
2. Add `additional_redirect_urls`/Google block per `docs/system-architecture.md` if not already present (keep auth setup intact).
3. Write migration SQL: 4 tables above + RLS enable + permissive read policies.
4. Write `seed.sql` per Seed Strategy, demo UUID as a documented constant.
5. Verify (requires Docker): `pnpm dlx supabase start` → `pnpm dlx supabase db reset` → confirm tables + rows.

## Todo List
- [x] `supabase init`
- [x] schema migration (4 tables + RLS) → `supabase/migrations/20260714070000_profile_schema.sql`
- [x] seed.sql with demo user + kudos + icons → `supabase/seed.sql`
- [ ] `db reset` verifies clean apply (Docker up) — **DEFERRED:** Docker not installed on this machine; SQL is reviewable without running DB

## Success Criteria
`supabase db reset` applies migration + seed with no error; `select` shows demo profile, 4 received kudos, icon catalog with partial unlocks.

## Risk Assessment
- **Docker not running (High likelihood / blocks verification):** note prerequisite; author SQL first, verify once Docker is up. Countermove: SQL is reviewable without a running DB.
- **auth.users FK for demo user (Med):** seed must insert into `auth.users` first (or make profiles.id a plain uuid without hard FK for local seed). Countermove: insert a matching `auth.users` row in seed, or drop the FK constraint for the demo seed path.

## Security Considerations
Local-dev RLS permissive read is acceptable; do NOT ship permissive policies to prod. No secrets in migrations/seed.

## Next Steps
Unblocks phase 02 (data-access layer) and phase 04 (integration).
