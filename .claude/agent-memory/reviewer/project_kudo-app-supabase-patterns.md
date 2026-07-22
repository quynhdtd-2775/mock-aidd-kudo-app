---
name: kudo-app-supabase-patterns
description: Recurring Supabase/auth architecture patterns in mock-aidd-kudo-app relevant to security review
metadata:
  type: project
---

This repo (mock-aidd-kudo-app) has a temporary mock-auth system that recurs across features:

- `lib/auth/mock-session.ts` gates `isMockAuthEnabled()` on BOTH `AUTH_MODE=mock` AND
  `NODE_ENV !== "production"` — this is the correct double-gate pattern. Any future service-role
  client (bypasses RLS) should be checked against this same gate; flag if a new one only checks
  one of the two conditions.
- `proxy.ts` (Next 16 renamed middleware → proxy.ts) is the sole auth gate for most routes —
  server actions have no explicit in-function auth checks and rely on the proxy matcher
  (`config.matcher` in `proxy.ts`) redirecting unauthenticated requests before the action fires.
  This is fragile defense-in-depth; worth flagging (Minor) whenever reviewing new server actions
  that read/write anything beyond fully-public data.
- `public.profiles.display_name` has **no uniqueness constraint** (see
  `supabase/migrations/20260714070000_profile_schema.sql`). Any UI that resolves a "selected
  entity" by matching free-text against `display_name` (rather than an explicit id-carrying
  selection event) is a wrong-recipient/wrong-entity risk. Found this in the write-kudos modal's
  recipient picker (`components/kudos/write-kudo/use-recipient-search.ts` using a native
  `<datalist>` + string match) — see `plans/reports/reviewer-260716-1711-write-kudos.md`. Check
  for the same anti-pattern in any future autocomplete-style picker in this codebase.
- `kudos.hashtags` is a single comma-joined `text` column (not a normalized/array column) — any
  free-text tag creation needs to reject commas or it silently corrupts on split/join round-trip.
- **RLS policies alone don't make a table readable — GRANTs are a separate, easy-to-forget layer.**
  All public tables had `for select ... using (true)` RLS since `20260714070000_profile_schema.sql`,
  but nobody ran `grant select on all tables in schema public to anon, authenticated` until
  `supabase/migrations/20260722070000_grant_table_privileges.sql` — every read 42501'd for ~a week
  until live verification caught it. When reviewing a new migration that adds an RLS policy, check
  there's a matching GRANT (or that a prior migration already covers it) — RLS filters rows, GRANT
  gates the table entirely; missing either one breaks reads/writes in a way `tsc`/unit tests never
  catch (only a live Supabase instance surfaces it).
- **RLS is row-level, not column-level** — `kudos readable by all` (`using (true)`) means
  `sender_id` is fetchable via PostgREST for every row including anonymous ones; the anonymous-post
  feature's anonymization in `lib/kudos/kudo-feed-mapper.ts` is app-layer-only (the mapper just
  never reads `sender` into the card when `is_anonymous`). Anyone with the anon key can still query
  `sender_id` directly. This was latent (nothing was readable at all pre-GRANT) and became live once
  the grants migration landed. Real fix needs a view that nulls the column conditionally
  (`case when is_anonymous then null else sender_id end`) with the base table's select revoked for
  anon/authenticated — flagged but not implemented as of 2026-07-22, see
  `plans/reports/reviewer-260716-1711-write-kudos.md` § Session 260722 delta review.

**Why this matters:** these are structural patterns intentional to the project's current
"no real Supabase auth yet" phase (see TODO(supabase) comments throughout), so don't flag the
mock-auth existence itself as a defect — only flag when a *new* piece of code fails to follow the
established double-gate/service-role-isolation pattern, or introduces a new id-vs-string-match
risk against an unconstrained text column.

**How to apply:** when reviewing new kudos/profile-related features, grep for
`display_name`-based matching and comma-joined text columns as the two recurring soft spots.

- **RLS `WITH CHECK` validates identity/ownership but not value columns — and trigger-driven
  counters often only clamp on one branch.** Found in `kudo_hearts`
  (`supabase/migrations/20260722100000_kudo_hearts.sql`): the insert policy checks
  `user_id = auth.uid()` and "not your own kudo" but never bounds `hearts_value`, so any
  authenticated user can hit the raw PostgREST endpoint directly (bypassing the server action
  that always hardcodes the value) and insert an arbitrary/negative `hearts_value`, corrupting the
  public `hearts_count` display counter. Compounding: the `sync_kudo_hearts_count()` trigger's
  INSERT branch does `hearts_count + NEW.hearts_value` with no floor, while the DELETE branch has
  `greatest(hearts_count - OLD.hearts_value, 0)` — the floor was only added on the branch the
  author was thinking about (unlike), not the one that can also go negative (a malicious insert
  with a large negative value). See `plans/reports/reviewer-260722-1620-kudo-hearts.md` Critical
  #1. **How to apply:** whenever a new table has a per-row value column feeding a trigger-synced
  aggregate/counter on another table, check (a) RLS `WITH CHECK` bounds that value column
  explicitly (not just identity/ownership), and (b) *every* trigger branch that can move the
  counter has the same floor/ceiling clamp, not just the one branch that inspired the clamp.
- **A per-user "have I liked/starred/etc this?" side query needs a bound.** Same feature: the
  `likedByMe` query in `getAllKudos()` (`lib/kudos/kudos-feed-queries.ts`) does
  `.eq("user_id", uid)` with no `.in("kudo_id", <current page's ids>)`, so it fetches the user's
  *entire* like history every page load instead of scoping to the feed page just fetched
  (`FEED_LIMIT`). Not N+1, but unbounded growth — check for this shape (one extra query per
  page load for "current viewer's relationship to these rows") whenever reviewing a new feed
  annotation query.
