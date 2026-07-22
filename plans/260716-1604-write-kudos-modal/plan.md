---
title: "Write Kudos Modal — Backend + Integration"
description: "Track B backend/logic + integration for the Viết Kudo modal on /kudos-live-board"
status: completed
priority: P2
effort: ~14h
branch: feat.home-page
tags: [kudos, supabase, server-actions, tiptap, integration]
created: 2026-07-16
completed: 2026-07-22
---

# Write Kudos Modal (Viết Kudo)

MoMorph screen `ihQ26W78P2`. Track A (UI) is built by a parallel background agent under
`components/kudos/write-kudo/**` with mock data + typed props. This plan owns **Track B**
(DB, server actions, queries, sanitization, image upload) and the **integration** phase.
Decisions in `clarifications.md` are authoritative.

## Two-Track Rule
Track A and Track B run in parallel — NO `blocks`/`blockedBy` between them. Integration
(phase-04) is the single merge point and owns the shared files (`function-buttons.tsx`,
`messages/*.json`, `package.json`).

## Phases

| # | Phase | Track | Status | Depends on |
|---|-------|-------|--------|------------|
| 01 | [UI stub (Viết Kudo screen)](phase-01-track-a-ui-stub.md) | A | completed | — |
| 02 | [DB migration + storage bucket](phase-02-db-migration-storage.md) | B | completed | — |
| 03 | [Server actions + data queries](phase-03-server-actions-queries.md) | B | completed | 02 |
| 04 | [Integration (wire modal, i18n, deps)](phase-04-integration.md) | A+B | completed | 01, 02, 03 |
| 05 | [Tests](phase-05-tests.md) | B | completed | 03 |
| 06 | [Seed + wire ALL KUDOS feed to real data](phase-06-seed-and-feed-display.md) | B | completed | 02–05 |
| 07 | [Live end-to-end verification](phase-07-live-verification.md) | verify | completed | 06 + docker |

## Session 2026-07-22 Delta Scope
Modal + backend + tests (01–05) DONE and committed. This session adds: (06) seed sample kudos +
wire the ALL KUDOS feed on `/kudos-live-board` to real Supabase data (highlight/spotlight/stats
stay mock); (07) live end-to-end verification once local Supabase (colima) is up. See
`clarifications.md` → Session 2026-07-22.

## Data Flow (Track B)
Modal form (client) → `createKudo(FormData)` server action → resolve current user
(`resolveCurrentUserId`) + auth guard → validate (recipient, HTML message, 1–5 hashtags,
≤5 jpg/png) → sanitize HTML → upload images to `kudos-images` bucket → insert `kudos` row →
return result → client closes modal + `router.refresh()`.
Autocomplete: `searchProfiles(q)` over `profiles.display_name`. Hashtags:
`getHashtagSuggestions()` distinct from `kudos`.

## Key Dependencies
- New migration adds `is_anonymous`, `anonymous_name`, `image_urls text[]` + insert RLS + storage bucket/RLS.
- New deps: `@tiptap/*` (Track A, installed at phase-04) + `sanitize-html` (Track B, installed at phase-04).

## Blocked / Constraints
- **No Docker runtime** → `supabase db reset`/migration apply is BLOCKED until user provides Docker.
  Migration SQL is authored + reviewed now; live verification deferred. Unit tests MUST NOT need a live Supabase.
- Mock-auth mode (`AUTH_MODE=mock`) uses the anon key → strict `sender_id = auth.uid()` insert RLS
  will reject inserts. See phase-02/03 risk notes.

## Success Criteria
Modal opens from the "ghi nhận" pill; a valid submission inserts one `kudos` row (sanitized HTML,
hashtags, image URLs, anonymity), closes the modal, refreshes the board; unauthenticated users
are redirected to login; all new strings localized; unit tests green without a live DB.

## Follow-ups
1. **Anonymous sender_id exposure**: current app-layer anonymization is sufficient for the live board
   display, but the `sender_id` remains fetchable via direct PostgREST anon calls to the `kudos` table
   (no row-level security on sender_id column). Before production, adopt a security_invoker view that
   masks sender_id for anonymous rows (returns null/default).
2. **RLS grants posture**: phase-07 discovered that RLS policies alone are insufficient; explicit
   table GRANTs are required. Local-dev config (`supabase/config.toml` disables analytics/vector)
   works correctly after adding grant migration. Production deployment must review RLS + grant
   strategy to match security model (e.g., principle of least privilege per role).
