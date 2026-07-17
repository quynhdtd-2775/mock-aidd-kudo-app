// Mocks MUST be defined before imports that depend on them (vitest hoists vi.mock)
const resolveCurrentUserIdMock = vi.fn();
vi.mock("@/lib/profile/current-user", () => ({
  resolveCurrentUserId: (...args: unknown[]) => resolveCurrentUserIdMock(...args),
}));

const isMockAuthEnabledMock = vi.fn();
vi.mock("@/lib/auth/mock-session", () => ({
  isMockAuthEnabled: (...args: unknown[]) => isMockAuthEnabledMock(...args),
}));

const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

const createServiceRoleClientMock = vi.fn();
vi.mock("@/lib/kudos/kudos-service-client", () => ({
  createServiceRoleClient: (...args: unknown[]) => createServiceRoleClientMock(...args),
}));

const searchProfilesMock = vi.fn();
const getHashtagSuggestionsMock = vi.fn();
vi.mock("@/lib/kudos/kudos-queries", () => ({
  searchProfiles: (...args: unknown[]) => searchProfilesMock(...args),
  getHashtagSuggestions: (...args: unknown[]) => getHashtagSuggestionsMock(...args),
}));

class NextRedirectSignal extends Error {
  constructor(public readonly url: string) {
    super("NEXT_REDIRECT");
  }
}
const redirectMock = vi.fn((url: string) => {
  throw new NextRedirectSignal(url);
});
vi.mock("next/navigation", () => ({
  redirect: (...args: [string]) => redirectMock(...args),
}));

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createKudo, getHashtagSuggestionsAction, searchProfilesAction } from "./actions";
import type { CreateKudoInput } from "@/lib/kudos/kudos-types";

const SENDER_ID = "sender-1";
const RECEIVER_ID = "receiver-1";

// Real magic-byte prefixes so files pass uploadKudoImages' server-side
// content sniffing (see lib/kudos/upload-kudo-images.ts) — a payload of
// plain zero bytes would now be rejected as invalid_image_type.
const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function makeFile(name: string, type: string, sizeBytes = 1024): File {
  const bytes = new Uint8Array(sizeBytes);
  const magic = type === "image/jpeg" ? JPEG_MAGIC : type === "image/png" ? PNG_MAGIC : [];
  magic.forEach((byte, index) => {
    bytes[index] = byte;
  });
  return new File([bytes], name, { type });
}

const AWARD_TITLE = "Người truyền động lực";

function baseInput(overrides: Partial<CreateKudoInput> = {}): CreateKudoInput {
  return {
    receiverId: RECEIVER_ID,
    awardTitle: AWARD_TITLE,
    message: "<p>great job!</p>",
    hashtags: ["teamwork"],
    isAnonymous: false,
    images: [],
    ...overrides,
  };
}

/**
 * Builds a fake Supabase client dispatching `.from(table)` to per-table
 * chainable query builders, plus a storage stub. Defaults: receiver lookup
 * succeeds, insert succeeds.
 */
function buildSupabaseClient(
  opts: {
    receiverFound?: boolean;
    receiverLookupError?: unknown;
    insertError?: unknown;
  } = {},
) {
  const { receiverFound = true, receiverLookupError = null, insertError = null } = opts;

  const maybeSingle = vi.fn().mockResolvedValue({
    data: receiverFound ? { id: RECEIVER_ID } : null,
    error: receiverLookupError,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const profilesSelect = vi.fn().mockReturnValue({ eq });

  const insert = vi.fn().mockResolvedValue({ error: insertError });

  const from = vi.fn((table: string) => {
    if (table === "profiles") return { select: profilesSelect };
    if (table === "kudos") return { insert };
    throw new Error(`unexpected table: ${table}`);
  });

  const upload = vi.fn().mockResolvedValue({ error: null });
  const getPublicUrl = vi.fn((path: string) => ({
    data: { publicUrl: `https://cdn.example.com/${path}` },
  }));
  const remove = vi.fn().mockResolvedValue({ error: null });
  const storageFrom = vi.fn().mockReturnValue({ upload, getPublicUrl, remove });

  const client = { from, storage: { from: storageFrom } };
  return { client, from, profilesSelect, eq, maybeSingle, insert, storageFrom, upload, remove };
}

describe("createKudo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMockAuthEnabledMock.mockReturnValue(false);
  });

  it("redirects to /login when there is no current user", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(null);

    await expect(createKudo(baseInput())).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/login");
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("returns a receiver_required field error when receiverId is empty/whitespace", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);

    const result = await createKudo(baseInput({ receiverId: "   " }));

    expect(result).toEqual({
      ok: false,
      error: "receiver_required",
      fieldErrors: { receiverId: "receiver_required" },
    });
  });

  it("returns an award_title_required field error when awardTitle is empty/whitespace", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);

    const result = await createKudo(baseInput({ awardTitle: "   " }));

    expect(result).toEqual({
      ok: false,
      error: "award_title_required",
      fieldErrors: { awardTitle: "award_title_required" },
    });
  });

  it("returns a message_required field error when message is empty after sanitizing/stripping tags", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);

    const result = await createKudo(baseInput({ message: "<p></p><br/>" }));

    expect(result).toEqual({
      ok: false,
      error: "message_required",
      fieldErrors: { message: "message_required" },
    });
  });

  it("returns a message_required field error for whitespace-only message text", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);

    const result = await createKudo(baseInput({ message: "<p>   </p>" }));

    expect(result).toEqual({
      ok: false,
      error: "message_required",
      fieldErrors: { message: "message_required" },
    });
  });

  it("returns a hashtags_count field error when hashtags is empty", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);

    const result = await createKudo(baseInput({ hashtags: [] }));

    expect(result).toEqual({
      ok: false,
      error: "hashtags_count",
      fieldErrors: { hashtags: "hashtags_count" },
    });
  });

  it("returns a hashtags_count field error when hashtags exceeds 5", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);

    const result = await createKudo(
      baseInput({ hashtags: ["a", "b", "c", "d", "e", "f"] }),
    );

    expect(result).toEqual({
      ok: false,
      error: "hashtags_count",
      fieldErrors: { hashtags: "hashtags_count" },
    });
  });

  it("returns an invalid_hashtag field error when a hashtag contains a comma", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);

    const result = await createKudo(baseInput({ hashtags: ["a,b"] }));

    expect(result).toEqual({
      ok: false,
      error: "invalid_hashtag",
      fieldErrors: { hashtags: "invalid_hashtag" },
    });
  });

  it("rejects a comma-containing hashtag even when only one array entry is submitted", async () => {
    // Regression guard for MINOR-4: hashtags is stored comma-joined, so a
    // single string like "a,b,c,d,e,f" must not be allowed to smuggle 6
    // stored tags past the <=5 count check by counting as 1 array entry.
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);

    const result = await createKudo(baseInput({ hashtags: ["a,b,c,d,e,f"] }));

    expect(result).toEqual({
      ok: false,
      error: "invalid_hashtag",
      fieldErrors: { hashtags: "invalid_hashtag" },
    });
  });

  it("filters out blank hashtag entries before counting", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client, insert } = buildSupabaseClient();
    createClientMock.mockResolvedValue(client);

    const result = await createKudo(baseInput({ hashtags: ["teamwork", "  ", ""] }));

    expect(result).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ hashtags: "teamwork", hashtag_title: AWARD_TITLE }),
    );
  });

  it("returns an images field error when image validation fails (too many)", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const images = Array.from({ length: 6 }, (_, i) => makeFile(`p${i}.jpg`, "image/jpeg"));

    const result = await createKudo(baseInput({ images }));

    expect(result).toEqual({
      ok: false,
      error: "too_many_images",
      fieldErrors: { images: "too_many_images" },
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("returns receiver_not_found when the receiver profile lookup misses", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client } = buildSupabaseClient({ receiverFound: false });
    createClientMock.mockResolvedValue(client);

    const result = await createKudo(baseInput());

    expect(result).toEqual({
      ok: false,
      error: "receiver_not_found",
      fieldErrors: { receiverId: "receiver_not_found" },
    });
  });

  it("returns receiver_not_found when the receiver lookup errors", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client } = buildSupabaseClient({ receiverLookupError: new Error("db down") });
    createClientMock.mockResolvedValue(client);

    const result = await createKudo(baseInput());

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("receiver_not_found");
  });

  it("inserts sanitized message + joined hashtags on the happy path and returns ok", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client, insert, from } = buildSupabaseClient();
    createClientMock.mockResolvedValue(client);

    const result = await createKudo(
      baseInput({
        message: '<p onclick="x()">great job!</p><script>alert(1)</script>',
        hashtags: ["teamwork", "leadership"],
      }),
    );

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("kudos");
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith({
      sender_id: SENDER_ID,
      receiver_id: RECEIVER_ID,
      hashtag_title: AWARD_TITLE,
      message: "<p>great job!</p>",
      hashtags: "teamwork,leadership",
      image_urls: [],
      attachment_count: 0,
      is_anonymous: false,
      anonymous_name: null,
    });
  });

  it("stores anonymous_name only when isAnonymous is true and a name is given", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client, insert } = buildSupabaseClient();
    createClientMock.mockResolvedValue(client);

    await createKudo(
      baseInput({ isAnonymous: true, anonymousName: "  Secret Admirer  " }),
    );

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ is_anonymous: true, anonymous_name: "Secret Admirer" }),
    );
  });

  it("stores anonymous_name as null when isAnonymous is true but no name given", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client, insert } = buildSupabaseClient();
    createClientMock.mockResolvedValue(client);

    await createKudo(baseInput({ isAnonymous: true }));

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ is_anonymous: true, anonymous_name: null }),
    );
  });

  it("returns insert_failed and cleans up uploaded images when the DB insert errors", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client, remove } = buildSupabaseClient({ insertError: new Error("insert failed") });
    createClientMock.mockResolvedValue(client);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const images = [makeFile("a.jpg", "image/jpeg")];
    const result = await createKudo(baseInput({ images }));

    expect(result).toEqual({ ok: false, error: "insert_failed" });
    expect(remove).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });

  it("uses the service-role client when mock auth is enabled", async () => {
    isMockAuthEnabledMock.mockReturnValue(true);
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client } = buildSupabaseClient();
    createServiceRoleClientMock.mockReturnValue(client);

    const result = await createKudo(baseInput());

    expect(result).toEqual({ ok: true });
    expect(createServiceRoleClientMock).toHaveBeenCalledTimes(1);
    expect(createClientMock).not.toHaveBeenCalled();
  });
});

describe("searchProfilesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns [] without querying when there is no current user (defense-in-depth)", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(null);

    const result = await searchProfilesAction("john");

    expect(result).toEqual([]);
    expect(searchProfilesMock).not.toHaveBeenCalled();
  });

  it("delegates to searchProfiles when a current user is resolved", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    searchProfilesMock.mockResolvedValue([{ id: "p1", displayName: "John", avatarUrl: null }]);

    const result = await searchProfilesAction("john");

    expect(searchProfilesMock).toHaveBeenCalledWith("john");
    expect(result).toEqual([{ id: "p1", displayName: "John", avatarUrl: null }]);
  });
});

describe("getHashtagSuggestionsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns [] without querying when there is no current user (defense-in-depth)", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(null);

    const result = await getHashtagSuggestionsAction();

    expect(result).toEqual([]);
    expect(getHashtagSuggestionsMock).not.toHaveBeenCalled();
  });

  it("delegates to getHashtagSuggestions when a current user is resolved", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    getHashtagSuggestionsMock.mockResolvedValue(["teamwork"]);

    const result = await getHashtagSuggestionsAction();

    expect(getHashtagSuggestionsMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(["teamwork"]);
  });
});
