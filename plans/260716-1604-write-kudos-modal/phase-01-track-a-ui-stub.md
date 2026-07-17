# Phase 01 — Track A: Viết Kudo UI (stub)

Track: A (UI) · Runs parallel with Track B · Depends on: none · Owner: background `implementer`

## MoMorph refs
- Viết Kudo: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2
- Clarifications: plans/260716-1604-write-kudos-modal/clarifications.md

## Goal
Code the Viết Kudo modal UI from Figma with mock data + typed props. `momorph-implement-design`
skill handles layout. Files under `components/kudos/write-kudo/**` (Track A owns these only).

## Out of scope (Track B / integration handles)
- Real submit logic, Supabase inserts, image upload, profile/hashtag queries
- Wiring the trigger pill, i18n string extraction, dependency install (done at phase-04)

## Integration contract (props Track B will fill at phase-04)
- Recipient autocomplete: `onSearchRecipient(q) => Profile[]`, selected `Profile`
- Message: Tiptap editor emitting HTML string; `@mention` source = profiles
- Hashtags: `suggestions: string[]`, value `string[]` (1–5, required)
- Images: `File[]` (≤5, jpg/png)
- `isAnonymous: boolean`, `anonymousName?: string`
- `onSubmit(payload) => Promise<{ error?: string }>`, `isSubmitting`, per-field errors
- `onCancel()` discards; success closes modal
