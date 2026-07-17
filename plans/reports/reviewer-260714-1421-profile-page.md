# Review: /profile page (backend + data layer + UI wiring)

## Scope
- `supabase/migrations/20260714070000_profile_schema.sql`, `supabase/seed.sql`, `supabase/config.toml`
- `lib/profile/{profile-types,current-user,profile-queries,profile-view-mappers}.ts` + tests
- `app/profile/page.tsx`
- `components/profile/*.tsx`

## Verification run
- `pnpm exec tsc --noEmit` → clean, no errors.
- `pnpm test` → 24/24 passed (2 files: current-user.test.ts, profile-view-mappers.test.ts).
- `pnpm exec eslint lib/profile components/profile app/profile` (scoped to this feature, since repo-wide lint has ~637 pre-existing errors unrelated to this change) → **31 errors**, all `@typescript-eslint/no-explicit-any` in `lib/profile/current-user.test.ts`.

## Findings

### Major
1. **Lint fails within scope** — `lib/profile/current-user.test.ts` has 31 `any`-cast errors (lines 23,24,35,36,53,55,56,73,75,76,93,95,96,111,113,114,129,131,132,148,150,151,168,170,171,187,189,190,212,217,218), e.g. `(process.env as any).DISABLE_AUTH = ...` and `mockCreateClient.mockResolvedValue({...} as any)`. Per dev rules ("Lint before you commit") this blocks the pre-commit/push gate as written. Fix: type the mocked Supabase client return shape and use `Object.defineProperty`/a typed env helper instead of `as any` on `process.env`.

2. **Sender/receiver avatars are not wired to real data** — `components/profile/profile-kudo-post-card.tsx:35,47` hardcodes `avatarSrc="/profile/avatar-sample-1.png"` / `avatar-sample-2.png` for every card regardless of who actually sent/received. Root cause: `getReceivedKudos()` in `lib/profile/profile-queries.ts:44-46` never selects `avatar_url` on the joined sender profile, and `ProfileData`/`ReceivedKudo` (`lib/profile/profile-types.ts`) have no field for it, so the mapper (`profile-view-mappers.ts:69-89`) can't pass it through even for the receiver (who *is* known). This is a leftover Track-A mock artifact that phase 04 integration did not fully replace — every post card in production shows the same two demo images, not the seeded users' actual avatars. Not a crash risk, but it's a real data-completeness gap against the "no invented data" / "reflects seeded DB" success criteria in phase 04.

### Minor
3. **Dead/unused query fields** — `getIconCollection()` returns `imageUrl`/`name` per icon (`profile-queries.ts:131-137`), but `toProfileHeroProps()` only forwards `{id, unlocked}` (`profile-view-mappers.ts:55`) since `ProfileBadgesRow` renders a shared inline SVG placeholder, not `imageUrl`. Consistent with the accepted "icon placeholders, no artwork" constraint, but the seeded `image_url` values (`/profile/icons/icon-1.png`...`icon-6.png`) point at files that don't exist under `public/profile/icons/` — harmless today only because nothing renders them. If a future change wires `imageUrl` through, this becomes a broken-image bug. Consider a code comment noting these are placeholder paths, or drop the column/seed values (YAGNI) until real art exists.

4. **Test file size** — `lib/profile/profile-view-mappers.test.ts` is 462 lines, well over the project's <200-line file-size guideline. `current-user.test.ts` at 225 lines is borderline. Consider splitting by function under test if this file grows further.

5. **`profile-view-mappers.test.ts`** — no lint issues found there (checked separately); good.

## Positive observations
- Demo-fallback guard is correctly duplicated and consistent between `lib/supabase/middleware.ts` and `lib/profile/current-user.ts`: both gate on `DISABLE_AUTH === "true" && NODE_ENV !== "production"`, so the bypass structurally cannot activate in a production build (verified by reading both files, no divergence).
- `profiles!kudos_sender_id_fkey` embed hint in `profile-queries.ts:46` is correct and necessary: `kudos` has two FKs to `profiles` (`sender_id`, `receiver_id`), and the migration doesn't override default constraint names, so Postgres's auto-generated name (`kudos_sender_id_fkey`) matches the hint exactly — this would otherwise be a common PostgREST ambiguous-embed failure.
- Seed correctly inserts into `auth.users` before `public.profiles` (FK ordering respected) — reviewed statically only, per accepted Docker-down constraint.
- Every query function in `profile-queries.ts` wraps in try/catch and returns safe empty defaults (`null`/`[]`), matching the phase-02 non-functional requirement and preventing a downed local Supabase stack from crashing the page — confirmed in `app/profile/page.tsx:52-70` empty-state branch.
- RLS enabled on all 4 new tables with policies present (not just `enable row level security` without policies, which would silently deny everything or, if forgotten, was flagged) — permissive-read-for-local-dev is documented in migration comments per the accepted constraint.
- No SQL string concatenation anywhere; all filtering goes through the Supabase query builder (`.eq(...)`), so no injection surface.
- `app/profile/page.tsx` stays at 77 lines, well under the file-size budget, by delegating to `profile-view-mappers.ts`.

## Unresolved questions
- None blocking. Confirm with Track A / design whether sender avatars are meant to be real per-user images before shipping past this local-dev milestone (finding #2).

**Status:** DONE_WITH_CONCERNS
**Score:** 7/10, critical count 0
**Summary:** No critical/security issues; TS compiles and tests pass, but scoped lint fails (31 `any` errors in a test file) and post-card sender/receiver avatars are still hardcoded mock images rather than wired to seeded data.
