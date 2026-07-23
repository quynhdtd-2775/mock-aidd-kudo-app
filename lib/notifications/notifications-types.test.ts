import { describe, it, expect } from "vitest";
import { hasUnread, type Notification } from "./notifications-types";

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: "n-1",
    userId: "u-1",
    title: "Title",
    body: "Body",
    readAt: null,
    createdAt: "2026-07-23T00:00:00.000Z",
    ...overrides,
  };
}

describe("hasUnread", () => {
  it("returns false for an empty array", () => {
    expect(hasUnread([])).toBe(false);
  });

  it("returns false when every notification has been read", () => {
    const items = [
      makeNotification({ id: "n-1", readAt: "2026-07-23T00:00:00.000Z" }),
      makeNotification({ id: "n-2", readAt: "2026-07-22T00:00:00.000Z" }),
    ];

    expect(hasUnread(items)).toBe(false);
  });

  it("returns true when at least one notification is unread (readAt null)", () => {
    const items = [
      makeNotification({ id: "n-1", readAt: "2026-07-23T00:00:00.000Z" }),
      makeNotification({ id: "n-2", readAt: null }),
    ];

    expect(hasUnread(items)).toBe(true);
  });
});
