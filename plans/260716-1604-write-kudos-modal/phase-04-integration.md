# Phase 04 — Integration (single merge point)

Track: A+B · Depends on: phase-01, phase-02, phase-03

## Goal
Wire Track A's `components/kudos/write-kudo/**` UI to Track B's actions/queries, open the modal
from the "ghi nhận" pill, replace mock data with real calls, localize new strings, install deps.

## Context
- Trigger: `components/kudos-live-board/function-buttons.tsx` (server component) renders
  `PillActionButton` (from `secondary-buttons.tsx`) with `label={t("askPrompt")}`.
  `PillActionButton` has no `onClick` today → needs a client wrapper for modal open state.
- Rendered via `live-board-hero.tsx` → `FunctionButtons`.
- i18n: next-intl cookie mode, `messages/vi.json` + `messages/en.json`. New strings go under a
  `WriteKudo` namespace; keep `messages/message-keys.test.ts` passing (key parity across locales).

## Steps
1. **Deps**: `pnpm add` Track A's `@tiptap/*` set + `sanitize-html` (+ `@types/sanitize-html`).
   Single owner installs both here → avoids concurrent lockfile writes during parallel tracks.
2. **Client trigger**: add `components/kudos-live-board/write-kudo-launcher.tsx` (client) — holds
   `open` state, renders the "ghi nhận" pill as trigger + mounts the Track A modal. Update
   `function-buttons.tsx` to render the launcher for the first pill (pass `askPrompt` label down).
3. **Wire props**: connect modal to `createKudo`, `searchProfilesAction`, `getHashtagSuggestionsAction`;
   pass Tiptap mention source from profile search. On success → close + `router.refresh()`.
4. **i18n**: extract all Track A hardcoded strings into `WriteKudo` namespace in `vi.json` + `en.json`
   (validation messages, labels, placeholders, "Ẩn danh" fallback, buttons Gửi/Hủy).
5. **Unauthenticated**: rely on `createKudo` auth guard (redirect `/login`); proxy/middleware already gates the route.

## File Ownership (integration owns shared files)
- Create: `components/kudos-live-board/write-kudo-launcher.tsx`
- Edit: `components/kudos-live-board/function-buttons.tsx`, `messages/vi.json`, `messages/en.json`, `package.json`
- Read: `components/kudos/write-kudo/**`, `lib/kudos/**`, `app/kudos-live-board/actions.ts`

## Todo
- [x] Install tiptap + sanitize-html deps
- [x] write-kudo-launcher client wrapper (modal open state)
- [x] Wire function-buttons pill → launcher
- [x] Connect modal props to actions/queries; success → router.refresh()
- [x] Localize WriteKudo strings (vi + en), keep message-keys.test green

## Success Criteria
Pill opens the modal; valid submit closes it + refreshes board; Hủy discards; no hardcoded strings;
locale key parity holds; app builds (`pnpm build`) and lints.

## Risk Assessment
| Risk | L | I | Mitigation |
|------|---|---|-----------|
| Track A prop shape ≠ phase-01 contract | Med | Med | Reconcile against phase-01 integration contract; adapt at wrapper boundary. |
| Server component pill can't hold state | High | Low | Introduce the client launcher wrapper (planned). |
| Locale key drift breaks message-keys.test | Med | Low | Add keys to both `vi.json` and `en.json` together. |

## Rollback
Revert `function-buttons.tsx`, remove launcher + new i18n keys, revert `package.json`/lockfile.
The board returns to a non-interactive pill (pre-feature state).
