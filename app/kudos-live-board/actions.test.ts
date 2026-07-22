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
import {
  createKudo,
  getHashtagSuggestionsAction,
  searchProfilesAction,
  toggleKudoHeart,
} from "./actions";
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

const KUDO_ID = "kudo-1";
const OTHER_SENDER_ID = "other-sender-1";

/**
 * Builds a fake Supabase client for toggleKudoHeart: dispatches
 * `.from("kudos")` on the select column ("sender_id" for the ownership
 * check vs "hearts_count" for the post-toggle re-read) and
 * `.from("kudo_hearts")` for the existing-like lookup + insert/delete.
 * Defaults: kudo found (sender = OTHER_SENDER_ID), no existing like (like
 * path), insert/delete succeed, refreshed hearts_count = 1001.
 */
function buildHeartToggleClient(
  opts: {
    kudoFound?: boolean;
    kudoSenderId?: string;
    kudoLookupError?: unknown;
    existingHeart?: { kudo_id: string } | null;
    existingLookupError?: unknown;
    insertError?: unknown;
    deleteError?: unknown;
    refreshFound?: boolean;
    heartsCountAfter?: number;
    refreshError?: unknown;
  } = {},
) {
  const {
    kudoFound = true,
    kudoSenderId = OTHER_SENDER_ID,
    kudoLookupError = null,
    existingHeart = null,
    existingLookupError = null,
    insertError = null,
    deleteError = null,
    refreshFound = true,
    heartsCountAfter = 1001,
    refreshError = null,
  } = opts;

  const senderMaybeSingle = vi.fn().mockResolvedValue({
    data: kudoFound ? { sender_id: kudoSenderId } : null,
    error: kudoLookupError,
  });
  const senderEq = vi.fn().mockReturnValue({ maybeSingle: senderMaybeSingle });

  const countMaybeSingle = vi.fn().mockResolvedValue({
    data: refreshFound ? { hearts_count: heartsCountAfter } : null,
    error: refreshError,
  });
  const countEq = vi.fn().mockReturnValue({ maybeSingle: countMaybeSingle });

  const kudosSelect = vi.fn((cols: string) => {
    if (cols === "sender_id") return { eq: senderEq };
    if (cols === "hearts_count") return { eq: countEq };
    throw new Error(`unexpected kudos select: ${cols}`);
  });

  const existingMaybeSingle = vi.fn().mockResolvedValue({
    data: existingHeart,
    error: existingLookupError,
  });
  const existingEq2 = vi.fn().mockReturnValue({ maybeSingle: existingMaybeSingle });
  const existingEq1 = vi.fn().mockReturnValue({ eq: existingEq2 });
  const heartsSelect = vi.fn().mockReturnValue({ eq: existingEq1 });

  const heartsInsert = vi.fn().mockResolvedValue({ error: insertError });

  const deleteEq2 = vi.fn().mockResolvedValue({ error: deleteError });
  const deleteEq1 = vi.fn().mockReturnValue({ eq: deleteEq2 });
  const heartsDelete = vi.fn().mockReturnValue({ eq: deleteEq1 });

  const from = vi.fn((table: string) => {
    if (table === "kudos") return { select: kudosSelect };
    if (table === "kudo_hearts") {
      return { select: heartsSelect, insert: heartsInsert, delete: heartsDelete };
    }
    throw new Error(`unexpected table: ${table}`);
  });

  const client = { from };
  return { client, from, kudosSelect, heartsInsert, heartsDelete, deleteEq1, existingEq1, heartsSelect };
}

describe("toggleKudoHeart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMockAuthEnabledMock.mockReturnValue(false);
  });

  it("redirects to /login when there is no current user", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(null);

    await expect(toggleKudoHeart(KUDO_ID)).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/login");
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("returns kudo_not_found when the kudo lookup misses", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client } = buildHeartToggleClient({ kudoFound: false });
    createClientMock.mockResolvedValue(client);

    const result = await toggleKudoHeart(KUDO_ID);

    expect(result).toEqual({ ok: false, error: "kudo_not_found" });
  });

  it("returns kudo_not_found when the kudo lookup errors", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client } = buildHeartToggleClient({ kudoLookupError: new Error("db down") });
    createClientMock.mockResolvedValue(client);

    const result = await toggleKudoHeart(KUDO_ID);

    expect(result).toEqual({ ok: false, error: "kudo_not_found" });
  });

  it("returns self_like when the current user is the kudo's sender", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client } = buildHeartToggleClient({ kudoSenderId: SENDER_ID });
    createClientMock.mockResolvedValue(client);

    const result = await toggleKudoHeart(KUDO_ID);

    expect(result).toEqual({ ok: false, error: "self_like" });
  });

  it("inserts a like (hearts_value 1) and returns liked:true when no existing row", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client, heartsInsert } = buildHeartToggleClient({
      existingHeart: null,
      heartsCountAfter: 1001,
    });
    createClientMock.mockResolvedValue(client);

    const result = await toggleKudoHeart(KUDO_ID);

    expect(heartsInsert).toHaveBeenCalledWith({
      kudo_id: KUDO_ID,
      user_id: SENDER_ID,
      hearts_value: 1,
    });
    expect(result).toEqual({ ok: true, liked: true, heartsCount: 1001 });
  });

  it("deletes the like and returns liked:false when a row already exists", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client, heartsDelete, deleteEq1 } = buildHeartToggleClient({
      existingHeart: { kudo_id: KUDO_ID },
      heartsCountAfter: 999,
    });
    createClientMock.mockResolvedValue(client);

    const result = await toggleKudoHeart(KUDO_ID);

    expect(heartsDelete).toHaveBeenCalledTimes(1);
    expect(deleteEq1).toHaveBeenCalledWith("kudo_id", KUDO_ID);
    expect(result).toEqual({ ok: true, liked: false, heartsCount: 999 });
  });

  it("returns toggle_failed when the insert fails", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client } = buildHeartToggleClient({ insertError: new Error("insert failed") });
    createClientMock.mockResolvedValue(client);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await toggleKudoHeart(KUDO_ID);

    expect(result).toEqual({ ok: false, error: "toggle_failed" });
    consoleErrorSpy.mockRestore();
  });

  it("treats a 23505 duplicate-key insert error as already-liked (MAJOR-2 race fix)", async () => {
    // Regression guard: two concurrent toggles for the same user can both
    // read existing=null, then race the insert. The loser gets a Postgres
    // unique-violation (23505) on the (kudo_id, user_id) PK, which must be
    // treated as success (liked:true) rather than reverting the optimistic
    // UI to "not liked" while the DB actually holds the like row.
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client } = buildHeartToggleClient({
      insertError: { code: "23505", message: "duplicate key value violates unique constraint" },
      heartsCountAfter: 1001,
    });
    createClientMock.mockResolvedValue(client);

    const result = await toggleKudoHeart(KUDO_ID);

    expect(result).toEqual({ ok: true, liked: true, heartsCount: 1001 });
  });

  it("returns toggle_failed (not liked:true) for a non-23505 insert error", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client } = buildHeartToggleClient({
      insertError: { code: "23503", message: "foreign key violation" },
    });
    createClientMock.mockResolvedValue(client);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await toggleKudoHeart(KUDO_ID);

    expect(result).toEqual({ ok: false, error: "toggle_failed" });
    consoleErrorSpy.mockRestore();
  });

  it("returns toggle_failed when the delete fails", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client } = buildHeartToggleClient({
      existingHeart: { kudo_id: KUDO_ID },
      deleteError: new Error("delete failed"),
    });
    createClientMock.mockResolvedValue(client);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await toggleKudoHeart(KUDO_ID);

    expect(result).toEqual({ ok: false, error: "toggle_failed" });
    consoleErrorSpy.mockRestore();
  });

  it("returns toggle_failed when the post-toggle hearts_count re-read misses", async () => {
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client } = buildHeartToggleClient({ refreshFound: false });
    createClientMock.mockResolvedValue(client);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await toggleKudoHeart(KUDO_ID);

    expect(result).toEqual({ ok: false, error: "toggle_failed" });
    consoleErrorSpy.mockRestore();
  });

  it("uses the service-role client when mock auth is enabled", async () => {
    isMockAuthEnabledMock.mockReturnValue(true);
    resolveCurrentUserIdMock.mockResolvedValue(SENDER_ID);
    const { client } = buildHeartToggleClient();
    createServiceRoleClientMock.mockReturnValue(client);

    const result = await toggleKudoHeart(KUDO_ID);

    expect(result.ok).toBe(true);
    expect(createServiceRoleClientMock).toHaveBeenCalledTimes(1);
    expect(createClientMock).not.toHaveBeenCalled();
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
