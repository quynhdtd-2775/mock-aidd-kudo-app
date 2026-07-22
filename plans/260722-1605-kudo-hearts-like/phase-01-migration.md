# Phase 01 — Migration: kudo_hearts + RLS + grants + sync trigger

## Context
- Plan: [plan.md](./plan.md) · Decisions: [clarifications.md](./clarifications.md)
- Patterns to mirror: `supabase/migrations/20260722070000_grant_table_privileges.sql`
  (grants + default privileges), `20260716100000_write_kudos.sql` (RLS insert policy),
  `20260722090000_create_profile_on_signup.sql` (plpgsql trigger, security definer).
- Base schema: `20260714070000_profile_schema.sql` — `kudos.hearts_count int not null default 0`.

## Overview
Priority P2 · Status pending. New table `kudo_hearts` (one row per user×kudo like),
its RLS/grants, and a trigger that keeps `kudos.hearts_count` in sync so the display
counter AND the profile "Hearts received" stat stay correct even for direct API writes.

## Key insights
- Default privileges (from the grant migration) auto-grant SELECT (anon/authenticated)
  + ALL (service_role) on NEW tables → only `insert, delete` for `authenticated` need
  explicit grants here. Composite PK (no sequence) → no sequence grant needed.
- Trigger is the SINGLE writer of `hearts_count` → action never touches it (no drift).
- `hearts_value` stored per row (default 1) so special-day ×2 lands later w/o remigration.

## Related code files
- CREATE: `supabase/migrations/20260722100000_kudo_hearts.sql`

## Implementation steps
1. `create table public.kudo_hearts` — `kudo_id uuid not null references public.kudos(id) on delete cascade`,
   `user_id uuid not null references public.profiles(id) on delete cascade`,
   `hearts_value int not null default 1`, `created_at timestamptz not null default now()`,
   `primary key (kudo_id, user_id)`.
2. `alter table public.kudo_hearts enable row level security;`
3. Policies:
   - select: `for select to anon, authenticated using (true)`
   - insert: `for insert to authenticated with check (user_id = auth.uid() and auth.uid() <> (select sender_id from public.kudos where id = kudo_id))`
   - delete: `for delete to authenticated using (user_id = auth.uid())`
4. `grant insert, delete on public.kudo_hearts to authenticated;` (SELECT + service_role ALL already via default privileges).
5. Trigger fn `public.sync_kudo_hearts_count()` (plpgsql, security definer, `set search_path = public`):
   - AFTER INSERT: `update public.kudos set hearts_count = hearts_count + NEW.hearts_value where id = NEW.kudo_id;`
   - AFTER DELETE: `update public.kudos set hearts_count = greatest(hearts_count - OLD.hearts_value, 0) where id = OLD.kudo_id;`
   - one fn, branch on `TG_OP`; return NEW/OLD accordingly.
6. `drop trigger if exists` + `create trigger on_kudo_hearts_change after insert or delete on public.kudo_hearts for each row execute function public.sync_kudo_hearts_count();`

## Todo
- [x] Table + composite PK + cascades — Migration 20260722100000_kudo_hearts.sql created, applied live
- [x] RLS enable + 3 policies (self-like blocked in insert check) — All 3 policies deployed + RLS verified in psql
- [x] Explicit grant insert, delete to authenticated — Grants applied, confirmed with `\dp` in psql
- [x] Sync trigger fn + trigger (insert/delete deltas) — Trigger fires on insert/delete, hearts_count updates +/-1 verified

## Success criteria
- `supabase db reset` applies clean; `kudo_hearts` present with RLS + grants + trigger.
- Manual psql: inserting a kudo_hearts row bumps `kudos.hearts_count` by 1; deleting it drops by 1 (never below 0).

## Risk assessment
- Missing insert/delete grant → 42501 in prod (Med). Mitigate: explicit grant (step 4).
- Trigger + action both editing hearts_count → drift (Med). Mitigate: trigger is sole writer.
- Self-like via direct API → RLS insert check blocks it (subquery on kudos.sender_id).

## Security
- RLS insert scoped to `user_id = auth.uid()` and not the kudo's sender; delete scoped to own row.
- Trigger `security definer` + fixed `search_path` (matches existing trigger convention).

## Rollback
Down = `drop trigger`, `drop function`, `drop table public.kudo_hearts cascade`.
No data backfill; existing `hearts_count` seed values are the starting display and are untouched.

## Next
Unblocks phase 02 (action reads/writes this table; feed reads likedByMe).
