# Kudos Live Feed Permissions Breakthrough

**Date**: 2026-07-22 14:22
**Severity**: High (silent failures across the stack)
**Component**: /kudos-live-board, Supabase RLS + grants, PostgREST API, anon JWT auth
**Status**: Resolved (feature complete, grants posture noted as local-dev only)

## What Happened

Wired the "write kudo → display in page" flow end-to-end on /kudos-live-board. Two-track parallel: Track A (background UI subagent building form + feed components) ran while Track B (main thread) bootstrapped the Supabase environment, discovered a critical permissions gap that had silently broken **every read** on the public schema, applied a fix, and drove live e2e verification via Playwright. Final delivery: 310/310 vitest passing, eslint + tsc clean, live form submission persists to DB and renders top of seeded feed, error paths preserve form state.

## The Brutal Truth

This stings because it was hiding in plain sight for two sessions. Every prior "live" page (profile, hearts, etc.) rendered empty or fallback because **all five public tables had RLS read policies but zero table GRANTs**. Every API read failed with 42501 (permission denied). Service role was equally blocked — it bypasses RLS but not grants, causing receiver_not_found on submit. The fix took 90 minutes to root: Supabase logs showed the 42501, but the code swallowed the error silently in getAllKudos, leaving no signal. What should have screamed failed silently, and we built on top of broken ground.

On infra setup: colima+docker's first image pull failed with connection-reset; retry worked but cost 30 minutes. Supabase start then failed on vector container mount — docker.sock cannot be passed to colima VMs. Disabled analytics in config.toml and moved on. At delivery, the stale demo anon JWT in .env.local rejected the fresh stack (PGRST301) — credentials must come from `supabase status`, not seeded from a prior session.

## Technical Details

**Root Cause — Permissions Cascade:**
- Migration 20260722070000_grant_table_privileges.sql added the missing GRANT statements. Every public table (kudo_posts, kudo_comments, etc.) now has `GRANT SELECT ON ... TO anon, authenticated`.
- Service role equally fixed: functions now wrap with `security_invoker=true` where needed to actually execute and return data (not just bypass RLS).
- RLS policies themselves were correct; the policies never fire without the grants in place.

**Artifacts:**
- **Migration**: `supabase/migrations/20260722070000_grant_table_privileges.sql` (GRANT cascade for all public tables)
- **Bug fixes**: getAllKudos now surfaces errors instead of silent return [] on 42501. Dead KUDO_POSTS mock removed (was in-memory fallback, now unnecessary). Hashtag display normalized (trimmed leading # in seed, display adds it back).
- **Live verification**: Playwright e2e (form submit persists, renders top of feed, error path preserves form state). psql verified 7 seeded kudos + 1 from form submit visible in table.
- **Code review**: 8/10, 0 critical. Minor: adjusted error handling and removed dead code same session.
- **Test coverage**: 310/310 vitest, tsc/eslint zero errors.

**Environment bootstrap issues:**
- colima image pull: connection-reset on first attempt, retry succeeded (30 min loss).
- Supabase vector container: docker.sock mount unsupported under colima → disabled analytics in config.toml.
- Stale JWT: .env.local carried old anon keys → fresh `supabase status` provided correct keys, PGRST301 resolved.

## What We Tried

1. **Permission debugging**: Supabase logs showed 42501 consistently. Traced to RLS policies first (correct). Then checked grants — found zero. Applied GRANT SELECT across all public tables. Verified via psql that queries now succeed under anon role.
2. **Error visibility**: getAllKudos was catching and silently returning []. Changed to throw on non-200, so errors surface in e2e and logs instead of pretending success.
3. **Environment stability**: Disabled analytics to avoid vector container mount error. Re-sourced JWT from `supabase status` to match fresh stack.

## Root Cause Analysis

1. **Silent error handling in data layer**: getAllKudos caught all errors and returned [] instead of throwing. This masked the 42501 permission error, making every prior page that queried kudos appear to have no data. The bug was in the error boundary, not the SQL. Lesson: always let permission errors surface — silence is the enemy of visibility.

2. **Schema incomplete at migration time**: The profile/schema migrations created tables + RLS policies but **did not include GRANT statements**. This is a schema completeness gap — migrations should be atomic: tables exist, are queryable, and have the right permissions in one go. The split caused a 2-session delay in discovering the issue.

3. **Stale credentials not caught**: The .env.local carried old anon keys from a prior Supabase instance. The fresh stack generated new keys. PGRST301 (invalid token) should have been checked earlier in the bootstrap narrative. Keys should always come from `supabase status` in the current session — never from prior snapshots.

## Lessons Learned

1. **Grants are not optional — they are part of schema definition.** RLS policies without grants are like locks on a door with no hinges. Every migration that creates a table should include its GRANT statements in the same file. Audit existing migrations for this pattern.

2. **Silent error swallowing is worse than loud failures.** A thrown error bubbles to logs and e2e failures. A silent catch + empty return looks like "no data" and buries the real problem for sessions. Review all error handlers in data-layer queries — let permission/connection errors throw, catch only retryable/transient errors.

3. **Live e2e testing catches what unit tests miss.** 310 green vitest tests could not catch the permissions issue because mocking shields from real DB. Playwright against live stack caught it in minutes. The lesson: drive at least one full flow end-to-end against real DB before claiming a feature is done.

4. **Environment credentials must be fresh for every session.** Stale .env.local keys from prior runs are subtle poison. Always run `supabase status` and copy keys directly into .env.local at session start. Automate this or add it to the pre-feature checklist.

5. **Git orchestration under pressure can sweep too broad.** The git-manager agent added the user's unrelated login work + a dependency bump into the feature commit and signed it with AI references against repo rules. Lesson: before accepting orchestrator rewrites, audit the commits. The orchestrator later fixed it (rewrote into 4 scoped commits), but the initial sweep was a warning sign. Scope git operations tightly or review every commit that gets created on your behalf.

## Next Steps

1. **Audit existing migrations**: Review all migrations for missing GRANT statements. Apply them in a follow-up migration if any public tables are ungranted. This is now a blocker check for any feature touching schema.
2. **Error handling audit**: Search for catch/return-empty patterns in `lib/*/queries.ts` files. Change to throw on permission/connection errors. Keep catch only for genuinely retryable scenarios.
3. **Environment bootstrap checklist**: Add "run `supabase status` and paste keys into .env.local" and "verify grants with `psql <flags> -c \"SELECT grantee, privilege_type FROM role_table_grants WHERE table_name = 'kudo_posts';\"`" to the pre-feature setup script.
4. **Live e2e gate**: Add a Playwright e2e run against live DB to the evidence gate for any feature that touches data queries or state persistence. Unit tests alone are insufficient.
5. **Grants posture note**: Current migration uses role grants suitable for local dev. For production, evaluate whether anon should have SELECT on all tables or if table-level + row-level filtering is more appropriate. Document the security model.

---

**Files created/modified:**
- `supabase/migrations/20260722070000_grant_table_privileges.sql` (new, GRANT cascade)
- `lib/kudos/queries.ts` (error handling, removed dead mock)
- `app/kudos-live-board/page.tsx` (form + feed integration)
- `tests/kudos-live-board.e2e.ts` (Playwright live verification)
- `.env.local` (fresh JWT from `supabase status`)

**Evidence directory**: git commits d2f608b (fix grants), 56b5f5a (feat kudos feed), 423eba7 (docs), bb4a49f (chore); Playwright e2e report with seeded + submitted kudo rendering; psql verification of 8 rows in kudo_posts table.
