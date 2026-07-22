# Phase 07 — Live End-to-End Verification (local Supabase)

Track: verification · Depends on: 06 + container runtime (colima/docker) ready · No app code changes

## Goal
With local Supabase running, confirm the seeded ALL KUDOS feed renders and a full write-a-kudo
flow (modal → server action → insert → `router.refresh()`) lands a new row that appears in the feed.

## Preconditions
- colima + docker installed and running: `colima status` shows Running; `docker ps` succeeds.
- `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `AUTH_MODE=mock`,
  `MOCK_DATA` unset/`false` (feed must hit real DB, not mock branch).
- Migrations present: 4 files in `supabase/migrations/` (incl. `20260716100000_write_kudos.sql`).

## Steps
1. Start the stack: `pnpm dlx supabase start` → capture the API URL, anon key, service_role key.
2. `pnpm dlx supabase status` — copy `service_role key`; add
   `SUPABASE_SERVICE_ROLE_KEY=<key>` to `.env.local` (mock-auth insert path in
   `lib/kudos/kudos-service-client.ts` needs it to bypass `sender_id = auth.uid()` insert RLS).
   Confirm URL + anon key in `.env.local` match `supabase status`.
3. `pnpm dlx supabase db reset` — applies the 4 migrations + `supabase/seed.sql`.
4. Verify provisioning:
   - `select count(*) from public.kudos;` (psql or Studio) → seeded rows present incl. the anonymous one.
   - Storage bucket exists: `select id from storage.buckets where id='kudos-images';` returns a row.
5. `pnpm dev`.
6. Browser flow via Playwright MCP (fall back to manual browser if MCP unavailable):
   a. Open `/kudos-live-board` → ALL KUDOS shows seeded kudos, newest first; anonymous row shows
      "Ẩn danh" (no hero code, `new` badge); message bodies render as formatted text (no raw tags).
   b. Click the "ghi nhận" pill (`components/kudos-live-board/function-buttons.tsx`) → modal opens.
   c. Fill: recipient (autocomplete resolves a seeded profile), danh hiệu, message (rich text),
      1–5 hashtags; optionally attach a jpg/png.
   d. Submit → modal closes, board refreshes, the new kudo appears at the TOP with sender = demo user,
      correct receiver, formatted timestamp, hearts "0".
   e. (Optional) submit with the anonymous checkbox on → new row shows "Ẩn danh".
7. Confirm persistence: `select sender_id, receiver_id, hashtag_title, is_anonymous, created_at
   from public.kudos order by created_at desc limit 1;` → matches the submitted kudo.

## Fallbacks / Troubleshooting
- **Port conflicts** (54321 API / 54322 db / 54323 studio): `pnpm dlx supabase stop` then retry,
  or stop the conflicting container; custom ports live in `supabase/config.toml`.
- **Mock-auth insert rejected by RLS**: verify `kudos-service-client.ts` uses the service_role key
  and that `SUPABASE_SERVICE_ROLE_KEY` is set (step 2). Prod path stays anon + strict RLS.
- **Storage bucket missing / upload fails**: re-run `db reset` (migration provisions the bucket),
  or create `kudos-images` (public) in Studio. Mock sender folder prefix = `DEMO_USER_ID`; the
  service client bypasses the `{auth.uid()}/` insert policy.
- **Feed empty after reset**: confirm `seed.sql` ran (`select count(*) from public.kudos`) and
  `MOCK_DATA` is not forcing a different branch.
- **Playwright MCP unavailable**: perform steps 6a–6e manually in a browser; still run step 7 SQL.

## Success Criteria (observable)
- `supabase start` + `db reset` succeed; 4 migrations + seed applied without error.
- `/kudos-live-board` renders the seeded feed (incl. anonymous row) from real Supabase.
- End-to-end modal submission inserts exactly one `kudos` row and it appears at the top of the feed
  after refresh, with correct sender/receiver/time/hearts.
- No server-log or browser-console errors during the flow.

## Risk Assessment
| Risk | L | I | Mitigation |
|------|---|---|-----------|
| colima/docker not ready | Med | High | Blocks phase; verify `colima status` first, retry after install completes |
| Port conflicts on start | Med | Med | `supabase stop`/free ports; custom ports in config.toml |
| Mock-auth RLS blocks insert | Med | High | Ensure service_role key set + used by kudos-service-client (step 2 / fallback) |
| Playwright MCP unavailable | Low | Low | Manual browser fallback + SQL persistence check |
| Seed HTML/anonymous row renders wrong | Low | Med | Fix in phase-06 seed/mapper, re-run `db reset` |

## Completion Notes (2026-07-22)
Full end-to-end verification completed and all flows validated:
- **Infrastructure setup**: colima + docker installed, Supabase local stack started successfully; vector and analytics disabled in config.toml (colima docker.sock mount constraint).
- **Environment config**: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY wired correctly to .env.local after refresh (old demo JWT was rejected by new stack with PGRST301 error).
- **Critical discovery**: initial full-round testing hit 42501 (permission denied) on every anon read and 42501 on service_role writes. Root cause: new migration added RLS policies on tables but ZERO table GRANTs were present. Fix applied: new migration supabase/migrations/20260722070000_grant_table_privileges.sql grants SELECT/INSERT/UPDATE/DELETE to anon and authenticated roles per table. All 5 migrations applied cleanly; seed.sql ran with 7 kudos rows (incl. 1 anonymous).
- **Playwright round-trip**: seeded feed renders (newest first), all 7 rows visible incl. anonymous "Ẩn danh" row. Modal submission with valid data (recipient, message, 3 hashtags, optional jpg) closed modal, triggered refresh, new kudo appeared at top with sender = demo user, correct receiver, formatted timestamp, hearts = 0. Persistence verified via psql: row in kudos table with correct sender_id, receiver_id, hashtag_title, is_anonymous flag, created_at. Optional anon submit also verified.
- **Code quality**: tsc clean, eslint clean, tests 310/310 passing.

## Rollback
`pnpm dlx supabase stop`; remove `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`. No application
code changes in this phase, so nothing else to revert.
