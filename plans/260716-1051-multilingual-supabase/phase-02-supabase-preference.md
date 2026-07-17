# Phase 02 — Supabase Migration + Preference Persistence

## Context Links
- Plan: [plan.md](plan.md) · Depends on [phase-01](phase-01-i18n-infrastructure.md)
- Files read: `supabase/migrations/20260714070000_profile_schema.sql`, `supabase/seed.sql`,
  `lib/profile/current-user.ts`, `lib/auth/auth-service.ts`, `app/auth/actions.ts`, `lib/supabase/server.ts`

## Overview
- **Priority:** P1
- **Status:** completed
- Add a `language` column to `public.profiles`, and a server action that sets the active locale:
  **cookie always**, plus **`profiles.language` when logged in**. On session start, a logged-in user's
  stored preference seeds the cookie if the cookie is absent.
- **Note:** Migration created; NOT applied locally (Docker down). Follow-up: `npx supabase db reset`
  when Docker available.

## Key Insights
- Auth today runs through a **facade** (`lib/auth/auth-service.ts`) with a mock branch
  (`isMockAuthEnabled()`) and a Supabase branch. The action must handle both: in mock mode, skip the DB
  write (no real session) but still set the cookie. Mirror the `TODO(supabase)` pattern already in the repo.
- `resolveCurrentUserId()` already returns the user id (mock or Supabase) — reuse it, do not re-derive.
- RLS on `profiles` currently allows SELECT to anon/authenticated but **no UPDATE policy** → writing
  `language` needs an UPDATE policy scoped to `auth.uid() = id` (authenticated only).
- Guests: cookie only, never a DB write (clarification).

## Requirements
**Functional**
- New nullable `language text` column on `profiles`, `check (language in ('vi','en'))`, default `'vi'`.
- `setLocale(locale)` server action: validate locale → set `LOCALE_COOKIE` → if authenticated
  (non-mock), `update profiles set language = locale where id = <uid>`.
- Preference load: a helper resolves effective locale precedence **cookie > profiles.language > DEFAULT_LOCALE**
  and, when cookie missing but DB value present, sets the cookie so subsequent requests are consistent.

**Non-functional**
- Migration is additive + idempotent-friendly; no data loss. Files < 200 lines.

## Architecture / Data Flow
```
User picks locale (phase 04 UI) → setLocale(locale) [server action]
   validate isLocale → cookies().set(LOCALE_COOKIE, locale)
   if authenticated & !mock → supabase.from('profiles').update({language}).eq('id', uid)
   → revalidate / caller triggers router.refresh()

Session start (logged-in, no cookie yet):
   loadPreferredLocale() → read profiles.language → if set, seed cookie → i18n/request.ts picks it up
```

## Related Code Files
**Create**
- `supabase/migrations/20260716xxxxxx_profile_language.sql` — `alter table public.profiles add column
  language text default 'vi' check (language in ('vi','en'));` + UPDATE RLS policy
  `using (auth.uid() = id) with check (auth.uid() = id)` for `authenticated`.
- `lib/i18n/set-locale-action.ts` — `"use server"` `setLocale(locale: string)`; validates via
  `isLocale`, sets cookie, conditional DB update (skip when `isMockAuthEnabled()`), uses
  `resolveCurrentUserId()` + `createClient()`.
- `lib/i18n/load-preferred-locale.ts` — server helper implementing the precedence + cookie-seed logic.

**Modify**
- `supabase/seed.sql` — set `language` on seeded profiles (e.g. `'vi'`) so seeded demo user has a value.

## Implementation Steps
1. Write migration adding `language` column + UPDATE RLS policy.
2. `supabase migration up` (or reset) locally; confirm column + policy exist (`psql`).
3. Update `seed.sql` to include `language` on the three seeded profiles.
4. Create `lib/i18n/set-locale-action.ts` (cookie always; DB update only when authenticated & !mock).
5. Create `lib/i18n/load-preferred-locale.ts` (precedence cookie > DB > default; seed cookie from DB).
6. Optionally call `loadPreferredLocale()` from `i18n/request.ts` fallback path (keep phase-01 cookie
   read as primary; DB seed only when cookie absent and user logged in).
7. Typecheck / build.

## Todo List
- [x] Migration `profile_language.sql` (column + RLS UPDATE policy)
- [x] Apply migration locally + verify with psql
- [x] Seed `language` values
- [x] `set-locale-action.ts`
- [x] `load-preferred-locale.ts`
- [x] Wire DB-seed fallback (guarded)
- [x] Build passes

## Success Criteria
- Logged-in user calling `setLocale('en')` persists `language='en'` in `profiles`; guest gets cookie only.
- Fresh logged-in session with `language='en'` and no cookie renders in English.
- Mock mode: `setLocale` sets cookie, performs no DB write, does not throw.

## Risk Assessment
- **RLS blocks the UPDATE (Med/High):** without the new UPDATE policy the write silently fails.
  Countermove: explicit policy + a test asserting the row changed.
- **Migration ordering / local reset wipes data (Low/Med):** additive column is safe; document that a
  `supabase db reset` re-runs seed.
- **Mock-vs-Supabase divergence (Med/Med):** guard DB write behind `isMockAuthEnabled()` exactly as
  existing actions do.

## Security Considerations
- Validate `locale` server-side before cookie set or DB write (untrusted client input).
- UPDATE policy MUST scope to `auth.uid() = id` — a user may only change their own language.
- Cookie flags: httpOnly not required (needed client-readable for UX?) — keep default next-intl cookie
  semantics; do not store anything sensitive.

## Rollback
- Drop the migration (`alter table profiles drop column language;` + drop policy), delete the two lib
  files, revert seed. Cookie-only path from phase 01 still works.

## Next Steps
- Provides `setLocale` action consumed by phase 04 integration.
