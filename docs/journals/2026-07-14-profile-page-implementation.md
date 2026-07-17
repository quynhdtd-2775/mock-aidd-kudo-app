# Profile Page Implementation — Two-Track Parallel Build

**Date**: 2026-07-14 13:36
**Severity**: Low (friction, not blockers)
**Component**: /profile page, Supabase schema, data layer, 10 presentational components
**Status**: Resolved (feature complete, deferred Docker verification)

## What Happened

Built the `/profile` page from MoMorph screen "Profile bản thân" using the takumi two-track parallel protocol: Track A (background UI agents building 10 presentational components in parallel) ‖ Track B (main thread clarify→plan→backend). Resolved 4 clarifications upfront (Supabase init in-repo, demo-user fallback under DISABLE_AUTH, static placeholders for unbuilt targets, received-only kudos list). Shipped supabase/ directory with Google OAuth config, migrations for profiles/kudos/hearts/secret_boxes/secret_box_icons, and seed data mirroring Figma content. Built lib/profile/ data layer (types, current-user resolver, 4 query functions, view mappers). Plumbed 10 component files from parallel UI agents into app/profile/page.tsx server component with safe empty state. Introduced vitest to repo and hit 24/24 unit tests green. Code review: 7/10 baseline, 2 majors fixed same session (sender avatar query bug + hardcoded card avatars).

## The Brutal Truth

This stung in places it shouldn't have. Docker Desktop wasn't running — the team assumed it would be — so live-DB verification is deferred and asset image paths (`secret_box_icons.image_url`) have nowhere to point yet. Track A parent agent stalled **twice** waiting on its own background children to respond, required explicit nudges, then got killed by the user mid visual-validation loop. The orchestrator had to finish page composition verification inline instead of handing cleanly to the UI agents. Repo linting surfaced 839 pre-existing problems and 31 new ones (mostly a test file); the profile feature itself is clean, but the lint noise makes it hard to spot signal. Visual parity with seeded data still unproven without Docker.

## Technical Details

**Artifacts:**
- **Supabase schema**: config `supabase/config.toml` (Google OAuth provider + anon/service_role keys), migrations in `supabase/migrations/` (4 tables + RLS read policies), seed in `supabase/seed.sql` (demo user + sample kudos/hearts/secret boxes per Figma)
- **Data layer**: `lib/profile/types.ts` (User, Kudos, Heart, SecretBox types), `lib/profile/queries.ts` (getCurrentUser, getProfileKudos, getProfileHearts, getSecretBoxes), `lib/profile/current-user.ts` (demo fallback under DISABLE_AUTH), view mappers for API→UI shape
- **UI components**: `components/profile/` (10 files: header, stats-card, post-item, hearts-grid, secret-box, award-item, filter-button, etc.)
- **Server component**: `app/profile/page.tsx` (server-side, safe empty state, integrates data layer + UI)
- **Testing**: `vitest.config.ts` + test files, 24/24 passing (unit coverage for data layer + component props)
- **Review**: 7/10 score; 2 majors fixed: (1) sender avatar not selected in kudos query (missing SELECT sender:users(id, avatar_url)), (2) hardcoded avatars in card component replaced with props from query

**Hard gaps:**
- Docker not running → cannot seed live DB or verify visual parity with Figma
- `secret_box_icons.image_url` has file paths with no asset files in `public/profile/`
- Repo lint: 839 pre-existing + 31 new problems (7 in profile test file)

## What We Tried

1. **Track A orchestration**: spawned 3 background UI agents in parallel. Parent agent stalled waiting for children — tried explicit nudge, got a response, then agent was killed by user before visual-validation loop closed. Orchestrator finished verification inline (reading component files + mapping props to data layer contracts).
2. **Docker verification**: deferred. Team to start Docker Desktop separately before testing live-DB seeding.
3. **Asset files**: deferred. Placeholder paths documented; assets can be added to `public/profile/` once final art is ready.
4. **Lint noise**: 31 new errors mostly in one test file; fixed 2 majors in review loop same session. Pre-existing 839 errors are repo-wide and out of scope for this feature.

## Root Cause Analysis

1. **Docker not running**: assumption that it would be already spun up. Docker Desktop must be started **before** feature branches begin; CI will catch it, but local dev needs the precheck. Not a mistake — just a missing handoff step in the dev setup narrative.
2. **Track A stalls**: parent agent waiting on background children created unnecessary latency. The background agents completed their work (10 files shipped), but the parent's orchestration loop expected acknowledgment. Two lessons here: (a) fire-and-forget background work needs explicit completion signals or timeout handling, (b) when a parent's only job is to wait, the orchestrator (main thread) should step in and verify work directly instead of blocking.
3. **Asset paths**: Figma design has image_url fields; no asset files exist yet. This is a design→assets bridge gap — specs should name the asset folder and whether files ship separately or are embedded. Accepted as clarification debt (acceptable risk per plan).

## Lessons Learned

1. **Docker is a precondition, not a detail.** Check it explicitly in the pre-feature checklist. If it's missing, pause and set it up before branches diverge.
2. **Track A parent orchestration can become a bottleneck.** When spawning background UI agents, either (a) give the parent explicit completion signals from each agent, or (b) let the orchestrator verify the work directly from file reads. Don't let the parent loop wait on children if it has nothing else to do.
3. **Asset paths in design need a data→files mapping.** Figma design has image_url fields; clarify upfront: are assets embedded, in a public/ folder, or delivered separately? Name the folder and the asset source (local, CDN, Figma export). Prevents downstream "where do these files live?" questions.
4. **Repo lint noise is its own kind of debt.** The feature code is clean, but 31 new errors buried in 839 pre-existing problems make it hard to audit quality. Future: either run `eslint --fix` repo-wide before feature branches, or silence pre-existing issues with a baseline config so only **new** problems surface in review.

## Next Steps

1. **Docker setup**: Team starts Docker Desktop and runs `supabase start` to seed live DB. Verify data loads correctly and RLS policies work as intended. Target: before visual testing.
2. **Visual parity**: Compare rendered /profile page with Figma design using seeded data. Adjust spacing, colors, typography if needed. Confirm empty state + loading state work.
3. **Asset files**: Identify final image URLs for `secret_box_icons` and add files to `public/profile/`. Or update queries to use placeholder images if assets are not ready yet.
4. **Lint cleanup**: post-feature, run `eslint --fix` on the profile test file (31 errors) to keep new code signal clean. Consider repo-wide lint baseline for future branches.
5. **Merge to main**: once Docker verification and visual parity are confirmed, merge feat.home-page → main via PR.

---

**Files created/modified:**
- `/supabase/config.toml`, `/supabase/migrations/`, `/supabase/seed.sql`
- `/lib/profile/` (types, queries, current-user)
- `/components/profile/` (10 presentational files)
- `/app/profile/page.tsx`
- `/vitest.config.ts`

**Evidence directory**: `/plans/260714-1336-profile-page/evidence/` (screenshots, test output, review notes)
