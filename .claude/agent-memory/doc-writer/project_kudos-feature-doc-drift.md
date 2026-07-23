---
name: project_kudos-feature-doc-drift
description: write-kudos-modal migration shipped undocumented for one release cycle — check all migrations touching a table, not just current-session diff, during docs review
metadata:
  type: project
---

During the 2026-07-22 docs review for the ALL KUDOS feed (`/kudos-live-board` going live-data),
found `supabase/migrations/20260716100000_write_kudos.sql` (shipped in commit `4dd7dd4`, an
earlier session) had never been reflected in `docs/system-architecture.md`: the `kudos` table row
was missing `is_anonymous`/`anonymous_name`/`image_urls`, the doc's RLS paragraph said
"no...insert/update/delete policies exist yet" when `kudos` already had a sender-scoped `INSERT`
policy, and the `kudos-images` Storage bucket wasn't mentioned at all.

**Why:** the doc-writer pass for that earlier feature likely scoped narrowly to the visible UI
change and missed the schema/RLS delta bundled in the same migration — the kind of gap that only
surfaces when a *later* feature (this session's feed reads) starts exercising those columns/RLS.

**How to apply:** when doing a "docs impact" review for feature X, don't just diff the files
listed in the task's "shipped this session" bullets — also `ls supabase/migrations/` and check
whether every migration touching a table mentioned in `docs/system-architecture.md` is actually
reflected there. Migrations are easy to ship silently since they don't show up in a component
diff. See [[project_docs-bootstrap]] for the single-file doc convention this repo uses.

**Recurred 2026-07-22 (later same day):** during the kudo-hearts (heart/like) docs review, the
task's "shipped" bullets only mentioned `20260722100000_kudo_hearts.sql`, but
`ls supabase/migrations/` also turned up `20260722090000_create_profile_on_signup.sql` (a
`handle_new_user()` trigger auto-creating `profiles` rows on signup + backfill) that had shipped
undocumented. Folded it into system-architecture.md's Database Schema + Auth Flow sections in the
same pass. Confirms the check-all-migrations habit is worth doing every time, not just once.
