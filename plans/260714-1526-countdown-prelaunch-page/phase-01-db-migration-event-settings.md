# Phase 01 — DB Migration + Seed (`event_settings`)

**Track:** B · **Priority:** P1 · **Status:** done · **Depends on:** none

## Context Links
- Existing migration (conventions to mirror): `supabase/migrations/20260714070000_profile_schema.sql`
- Clarifications: `plans/260714-1526-countdown-prelaunch-page/clarifications.md`

## Overview
Create the `event_settings` table holding the single launch instant, seed one row, and expose
it with permissive public read RLS (page is public). Self-contained in one new migration file.

## Key Insights
- Profile migration uses `timestamptz`, `enable row level security`, and `for select to anon,
  authenticated using (true)` for public-read tables — mirror exactly.
- Single-row config table: enforce a singleton with a fixed primary key rather than a sequence.
- Seed the launch instant **inside the migration** (task requirement), not `seed.sql`.

## Requirements
- Functional: `event_settings(id, launch_at timestamptz not null, updated_at timestamptz)`;
  exactly one seeded row; `launch_at` readable by `anon` + `authenticated`.
- Non-functional: no writes exposed via RLS (no insert/update/delete policies).

## Architecture
- Data in: none (DDL + seed). Data out: one `event_settings` row read by Phase 02.
- Singleton pattern: `id integer primary key default 1 check (id = 1)`.
- Timezone: choose the launch instant as a UTC timestamp equal to the intended Asia/Ho_Chi_Minh
  (UTC+7) wall-clock time. Store as `timestamptz` (e.g. `'2026-07-21 09:00:00+07'`).

## Related Code Files
- Create: `supabase/migrations/<UTC-timestamp>_event_settings.sql` (timestamp > existing migration)
- Modify: none · Delete: none

## Implementation Steps
1. New migration file, timestamp after `20260714070000`.
2. `create table public.event_settings (id integer primary key default 1 check (id = 1),
   launch_at timestamptz not null, updated_at timestamptz not null default now());`
3. `alter table public.event_settings enable row level security;`
4. `create policy "event_settings readable by all" on public.event_settings for select to anon,
   authenticated using (true);`
5. Seed: `insert into public.event_settings (id, launch_at) values (1, '<+07 instant>');`
   Pick a value a few days out so the countdown demo is non-zero.
6. Add a header comment (purpose + singleton + timezone rationale), matching profile-migration style.

## Todo List
- [x] Migration file created with correct timestamp ordering
- [x] Singleton constraint + RLS public-read policy
- [x] Seeded launch_at row (+07 instant, future-dated)
- [ ] `supabase db reset` (or migrate) applies clean — **PENDING-EXTERNAL**: local Docker unavailable in this environment; migration follows profile_schema.sql conventions exactly (verified by inspection)

## Success Criteria
- `select launch_at from public.event_settings` as anon returns exactly one future row.
- Insert/update as anon is rejected (no write policy).

## Risk Assessment
- **Migration ordering (Med/Low):** wrong timestamp → out-of-order apply. Mitigate: timestamp strictly greater.
- **Seeded date passes before demo (Low):** pick a comfortably future instant; re-seedable by editing + reset.

## Security Considerations
- Read-only RLS; no write policies. Public read is intentional (public page). No PII in table.

## Next Steps
- Unblocks Phase 02 (data access reads this table).
