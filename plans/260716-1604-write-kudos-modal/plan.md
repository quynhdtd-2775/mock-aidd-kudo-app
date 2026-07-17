---
title: "Write Kudos Modal — Backend + Integration"
description: "Track B backend/logic + integration for the Viết Kudo modal on /kudos-live-board"
status: pending
priority: P2
effort: ~10h
branch: feat.home-page
tags: [kudos, supabase, server-actions, tiptap, integration]
created: 2026-07-16
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
| 01 | [UI stub (Viết Kudo screen)](phase-01-track-a-ui-stub.md) | A | pending | — |
| 02 | [DB migration + storage bucket](phase-02-db-migration-storage.md) | B | pending | — |
| 03 | [Server actions + data queries](phase-03-server-actions-queries.md) | B | pending | 02 |
| 04 | [Integration (wire modal, i18n, deps)](phase-04-integration.md) | A+B | pending | 01, 02, 03 |
| 05 | [Tests](phase-05-tests.md) | B | pending | 03 |

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
