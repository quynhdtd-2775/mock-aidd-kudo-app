# Phase B1 — DB: notifications table + profiles.role + seed

## Context Links
- Clarifications: `../260723-1508-home-page-saa-implementation/clarifications.md` (notifications + role decisions)
- Pattern refs: `supabase/migrations/20260722100000_kudo_hearts.sql` (RLS + self-scoped policies),
  `supabase/migrations/20260722070000_grant_table_privileges.sql` (grants + default privileges),
  `supabase/seed.sql` (3 demo users …0001/0002/0003)

## Overview
- **Priority:** P2 · **Status:** pending · **Blocked by:** none
- Adds the persistence backing notifications (B3) and the admin menu (B4). DB-only; no UI here.

## Key Insights
- Default privileges (grant migration) already SELECT-grant new tables to anon/authenticated and
  ALL to service_role → notifications only needs an explicit UPDATE grant for read-marking.
- `profiles` has NO role column today; add `role text default 'user'` with a CHECK. Migration
  order: new files with timestamps AFTER `20260722100000`.
- Mock-auth write path runs on service_role (bypasses RLS) — RLS is defense-in-depth, mirror kudo_hearts.

## Requirements
- **Functional:** `notifications(id uuid pk, user_id uuid fk profiles, title text, body text, read_at timestamptz null, created_at timestamptz default now())`. `profiles.role text not null default 'user' check (role in ('user','admin'))`. Seed: promote user …0001 to `admin`; insert ~3 notification rows for …0001 (≥1 unread = `read_at null`, ≥1 read).
- **Non-functional:** RLS enabled; reads self-scoped (`user_id = auth.uid()`); update self-scoped (mark-read). No insert/delete policy (seed-only writes). Reset-safe (`if not exists` / idempotent guards like kudo_hearts).

## Related Code Files
- **Create:** `supabase/migrations/20260723090000_notifications.sql`, `supabase/migrations/20260723091000_profiles_role.sql`
- **Modify:** `supabase/seed.sql` (add role update + notification rows — appended, existing rows untouched)

## Implementation Steps
1. `20260723091000_profiles_role.sql`: `alter table public.profiles add column role text not null default 'user' check (role in ('user','admin'));`
2. `20260723090000_notifications.sql`: create table; `enable row level security`; policies `for select to authenticated using (user_id = auth.uid())` and `for update to authenticated using (user_id = auth.uid())`; `grant update on public.notifications to authenticated` (SELECT covered by default privileges). Index `(user_id, created_at desc)`.
3. `seed.sql`: `update public.profiles set role = 'admin' where id = '00000000-0000-4000-8000-000000000001';` then insert notification rows (mix of null / non-null `read_at`) for that user.
4. `supabase db reset` locally to verify migrations + seed apply cleanly.

## Todo List
- [ ] profiles.role migration + CHECK
- [ ] notifications migration (table, RLS select/update, grant, index)
- [ ] seed: admin promotion + notification rows (unread + read)
- [ ] `supabase db reset` applies clean

## Success Criteria
- `select role from profiles where id=…0001` → `admin`; others `user`.
- `notifications` has ≥1 unread + ≥1 read row for …0001.
- Existing tables/policies unaffected; db reset green. Satisfies data half of ID-11/27..29, ID-5/36..38.

## Risk Assessment
- **Migration order clash** (Med/Med): timestamp after latest existing (`20260722100000`) → mitigated by chosen names.
- **RLS blocks mock-auth reads** (Low/Med): B3 query runs server-side; if on service_role it bypasses RLS, if on anon client it needs an authenticated session — confirm B3 uses the same client shape as profile-queries. Documented for B3.

## Security Considerations
- Self-scoped RLS prevents cross-user notification reads. Role CHECK constrains values at DB layer.

## Next Steps
- Unblocks B3 (bell) and B4 (role menu).
