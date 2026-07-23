# Phase B3 — Notifications bell panel + unread badge

## Context Links
- Depends on: [phase-B1](phase-B1-db-migrations-seed.md) (notifications table + seed)
- Current: `components/home/site-header.tsx` (static bell SVG + always-on decorative red badge dot)
- Pattern refs: `components/home/user-menu.tsx` (client dropdown: outside-click + Escape close),
  `lib/countdown/event-settings-queries.ts` (safe server query, returns fallback on error)

## Overview
- **Priority:** P2 · **Status:** pending · **Blocked by:** B1
- Turn the decorative bell into a real dropdown: list the user's notifications; show the red badge
  only when unread rows exist.

## Key Insights
- Badge in current header is unconditional — replace with unread-driven conditional.
- Query must resolve the current user id via `resolveCurrentUserId()` (lib/profile/current-user.ts)
  and read notifications for that user. Match the client shape used by profile-queries so RLS
  self-scoping (B1) is satisfied; return `[]` on error (never crash the header).
- Panel is a client dropdown → reuse UserMenu's outside-click/Escape pattern (DRY).
- New i18n strings needed → **integration contract** (Track A owns messages files).

## Data Flow
`SiteHeader` (server) → `getNotifications(userId)` → `Notification[]` → `<NotificationsBell items>` (client)
→ `hasUnread(items)` derives badge visibility → dropdown lists title/body, newest first.

## Requirements
- **Functional:** bell opens/closes a dropdown panel listing notifications (title + body, newest first);
  red badge visible **iff** ≥1 unread (`read_at null`); empty state when none (ID-11, ID-27..29).
- **Non-functional:** keyboard accessible (focusable trigger, Escape closes, outside-click closes),
  matches UserMenu a11y. Query safe-fails to `[]`.

## Related Code Files
- **Create:** `lib/notifications/notifications-queries.ts` (`getNotifications(userId): Promise<Notification[]>`, safe),
  `lib/notifications/notifications-types.ts` (`Notification`, `hasUnread(items): boolean` pure helper),
  `components/home/notifications-bell.tsx` (`"use client"` dropdown)
- **Modify:** `components/home/site-header.tsx` (fetch notifications, replace static bell + badge with `<NotificationsBell>`)

## Implementation Steps
1. `notifications-types.ts`: `Notification` type + pure `hasUnread(items)` (`items.some(n => n.readAt == null)`).
2. `notifications-queries.ts`: read notifications for `userId` ordered `created_at desc`; map to camelCase; try/catch → `[]`.
3. `notifications-bell.tsx`: client dropdown (reuse UserMenu outside-click/Escape), badge from `hasUnread`, render list + empty state; use `useTranslations("Notifications")`.
4. `site-header.tsx`: `const userId = await resolveCurrentUserId()`; `const items = userId ? await getNotifications(userId) : []`; swap the static bell block for `<NotificationsBell items={items} />`.

## Todo List
- [ ] Notification type + `hasUnread` pure helper
- [ ] safe `getNotifications` query (self-scoped, `[]` on error)
- [ ] NotificationsBell client dropdown (list + empty + a11y)
- [ ] badge only when unread present
- [ ] site-header wired to real data

## Success Criteria
- Seeded …0001 sees a badge (has unread) + populated panel; marking-read semantics available via read_at.
- No unread → no badge. Satisfies ID-11, ID-27..29.

## Risk Assessment
- **RLS blocks read** (Med/Med): confirm query client matches an authenticated/service path; fall back `[]` keeps header alive. Verify against B1 policies.
- **Shared file with B4** (Med/High): both edit `site-header.tsx` → B4 is blockedBy B3 (serialized). No parallel edit.

## Integration
- **i18n contract (add to Track A `messages/{vi,en}.json` at merge):** `Notifications.panelTitle`, `Notifications.empty`, `Notifications.bellAriaLabel`.

## Security Considerations
- Self-scoped RLS (B1) + server-side user resolution — no cross-user leakage.

## Next Steps
- B4 continues header edits (account menu). B7 tests `hasUnread`.
