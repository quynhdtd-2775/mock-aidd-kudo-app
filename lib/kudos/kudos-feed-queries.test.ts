// Mocks MUST be defined before imports that depend on them (vitest hoists vi.mock)
const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

const resolveCurrentUserIdMock = vi.fn();
vi.mock("@/lib/profile/current-user", () => ({
  resolveCurrentUserId: (...args: unknown[]) => resolveCurrentUserIdMock(...args),
}));

import { describe, it, expect, beforeEach, vi } from "vitest";
import { getAllKudos } from "./kudos-feed-queries";

const KUDO_ROW_1 = {
  id: "kudo-1",
  sender_id: "sender-1",
  hashtag_title: "Team Player",
  message: "great job!",
  attachment_count: 0,
  hashtags: "teamwork",
  hearts_count: 5,
  image_urls: [],
  is_anonymous: false,
  anonymous_name: null,
  created_at: "2026-07-22T00:00:00.000Z",
  sender: { display_name: "Alice", hero_code: "A1", hero_badge: "new", avatar_url: null },
  receiver: { display_name: "Bob", hero_code: "B1", hero_badge: "new", avatar_url: null },
};

const KUDO_ROW_2 = {
  ...KUDO_ROW_1,
  id: "kudo-2",
  sender_id: "sender-2",
};

/**
 * Builds a fake Supabase client dispatching `.from("kudos")` (feed query,
 * chain: select -> order -> limit) and `.from("kudo_hearts")` (liked-ids
 * query, chain: select -> eq -> in).
 */
function buildFeedClient(opts: {
  kudosResult?: { data: unknown; error: unknown };
  likedResult?: { data: unknown; error: unknown };
} = {}) {
  const {
    kudosResult = { data: [KUDO_ROW_1, KUDO_ROW_2], error: null },
    likedResult = { data: [], error: null },
  } = opts;

  const limit = vi.fn().mockResolvedValue(kudosResult);
  const order = vi.fn().mockReturnValue({ limit });
  const kudosSelect = vi.fn().mockReturnValue({ order });

  const inFn = vi.fn().mockResolvedValue(likedResult);
  const heartsEq = vi.fn().mockReturnValue({ in: inFn });
  const heartsSelect = vi.fn().mockReturnValue({ eq: heartsEq });

  const from = vi.fn((table: string) => {
    if (table === "kudos") return { select: kudosSelect };
    if (table === "kudo_hearts") return { select: heartsSelect };
    throw new Error(`unexpected table: ${table}`);
  });

  const client = { from };
  return { client, from, kudosSelect, order, limit, heartsSelect, heartsEq, inFn };
}

describe("getAllKudos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns [] when the feed query errors", async () => {
    const { client } = buildFeedClient({
      kudosResult: { data: null, error: new Error("db down") },
    });
    createClientMock.mockResolvedValue(client);
    resolveCurrentUserIdMock.mockResolvedValue("sender-1");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await getAllKudos();

    expect(result).toEqual([]);
    consoleErrorSpy.mockRestore();
  });

  it("returns [] when createClient throws (local Supabase stack down)", async () => {
    createClientMock.mockRejectedValue(new Error("connection refused"));
    resolveCurrentUserIdMock.mockResolvedValue("sender-1");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await getAllKudos();

    expect(result).toEqual([]);
    consoleErrorSpy.mockRestore();
  });

  it("does not query kudo_hearts when there is no current user", async () => {
    const { client, heartsSelect } = buildFeedClient();
    createClientMock.mockResolvedValue(client);
    resolveCurrentUserIdMock.mockResolvedValue(null);

    const result = await getAllKudos();

    expect(heartsSelect).not.toHaveBeenCalled();
    expect(result.every((item) => item.likedByMe === false)).toBe(true);
    expect(result.every((item) => item.isOwnKudo === false)).toBe(true);
  });

  it("does not query kudo_hearts when the feed page is empty", async () => {
    const { client, heartsSelect } = buildFeedClient({ kudosResult: { data: [], error: null } });
    createClientMock.mockResolvedValue(client);
    resolveCurrentUserIdMock.mockResolvedValue("sender-1");

    const result = await getAllKudos();

    expect(heartsSelect).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it(
    "scopes the liked-ids query to the fetched page's kudo ids (MAJOR-3 fix)",
    async () => {
      // Regression guard: the liked-ids query must be bounded by .in() to the
      // ids just fetched (data.map(r => r.id)), not just .eq("user_id", uid)
      // alone — otherwise it pulls back a user's entire like history on
      // every page load regardless of the FEED_LIMIT-bounded feed size.
      const { client, heartsSelect, heartsEq, inFn } = buildFeedClient({
        likedResult: { data: [{ kudo_id: "kudo-1" }], error: null },
      });
      createClientMock.mockResolvedValue(client);
      resolveCurrentUserIdMock.mockResolvedValue("viewer-1");

      const result = await getAllKudos();

      expect(heartsSelect).toHaveBeenCalledWith("kudo_id");
      expect(heartsEq).toHaveBeenCalledWith("user_id", "viewer-1");
      expect(inFn).toHaveBeenCalledWith("kudo_id", ["kudo-1", "kudo-2"]);

      const kudo1 = result.find((item) => item.id === "kudo-1");
      const kudo2 = result.find((item) => item.id === "kudo-2");
      expect(kudo1?.likedByMe).toBe(true);
      expect(kudo2?.likedByMe).toBe(false);
    },
  );

  it("logs and treats liked-ids as empty (not a feed-load failure) when that query errors", async () => {
    const { client } = buildFeedClient({
      likedResult: { data: null, error: new Error("liked-ids query error") },
    });
    createClientMock.mockResolvedValue(client);
    resolveCurrentUserIdMock.mockResolvedValue("viewer-1");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await getAllKudos();

    expect(result).toHaveLength(2);
    expect(result.every((item) => item.likedByMe === false)).toBe(true);
    consoleErrorSpy.mockRestore();
  });

  it("marks isOwnKudo true only for the row whose sender_id matches the current user", async () => {
    const { client } = buildFeedClient();
    createClientMock.mockResolvedValue(client);
    resolveCurrentUserIdMock.mockResolvedValue("sender-2");

    const result = await getAllKudos();

    const kudo1 = result.find((item) => item.id === "kudo-1");
    const kudo2 = result.find((item) => item.id === "kudo-2");
    expect(kudo1?.isOwnKudo).toBe(false);
    expect(kudo2?.isOwnKudo).toBe(true);
  });
});
