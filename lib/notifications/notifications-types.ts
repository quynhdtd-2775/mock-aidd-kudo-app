// Typed shape returned by lib/notifications/notifications-queries.ts and
// consumed by components/home/notifications-bell.tsx.

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

/** True when at least one notification is unread (`readAt` is null). */
export function hasUnread(items: Notification[]): boolean {
  return items.some((n) => n.readAt == null);
}
