// Mocks MUST be defined before imports that depend on them (vitest hoists vi.mock)
const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

import { describe, it, expect, beforeEach, vi } from "vitest";
import { getHashtagSuggestions, searchProfiles } from "./kudos-queries";

function buildProfilesClient(result: { data: unknown; error: unknown }) {
  const limit = vi.fn().mockResolvedValue(result);
  const ilike = vi.fn().mockReturnValue({ limit });
  const select = vi.fn().mockReturnValue({ ilike });
  const from = vi.fn().mockReturnValue({ select });
  return { client: { from }, from, select, ilike, limit };
}

function buildKudosClient(result: { data: unknown; error: unknown }) {
  const select = vi.fn().mockResolvedValue(result);
  const from = vi.fn().mockReturnValue({ select });
  return { client: { from }, from, select };
}

describe("searchProfiles", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("returns [] for an empty query without calling the Supabase client", async () => {
    const result = await searchProfiles("");
    expect(result).toEqual([]);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("returns [] for a whitespace-only query without calling the Supabase client", async () => {
    const result = await searchProfiles("   ");
    expect(result).toEqual([]);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("trims the query before running the ilike search", async () => {
    const { client, from, select, ilike, limit } = buildProfilesClient({
      data: [{ id: "1", display_name: "John", avatar_url: null }],
      error: null,
    });
    createClientMock.mockResolvedValue(client);

    const result = await searchProfiles("  John  ");

    expect(from).toHaveBeenCalledWith("profiles");
    expect(select).toHaveBeenCalledWith("id, display_name, avatar_url");
    expect(ilike).toHaveBeenCalledWith("display_name", "%John%");
    expect(limit).toHaveBeenCalledWith(8);
    expect(result).toEqual([{ id: "1", displayName: "John", avatarUrl: null }]);
  });

  it("accepts a 1-character query (min length is 1, not 2)", async () => {
    const { client, ilike } = buildProfilesClient({ data: [], error: null });
    createClientMock.mockResolvedValue(client);

    await searchProfiles("a");

    expect(ilike).toHaveBeenCalledWith("display_name", "%a%");
  });

  it("returns [] when the query errors", async () => {
    const { client } = buildProfilesClient({ data: null, error: new Error("db down") });
    createClientMock.mockResolvedValue(client);

    const result = await searchProfiles("john");
    expect(result).toEqual([]);
  });

  it("returns [] and swallows the error when createClient throws", async () => {
    createClientMock.mockRejectedValue(new Error("connection refused"));
    const result = await searchProfiles("john");
    expect(result).toEqual([]);
  });
});

describe("getHashtagSuggestions", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("dedupes hashtags across rows and returns them sorted", async () => {
    const { client } = buildKudosClient({
      data: [{ hashtags: "teamwork,leadership" }, { hashtags: "leadership,creativity" }],
      error: null,
    });
    createClientMock.mockResolvedValue(client);

    const result = await getHashtagSuggestions();
    expect(result).toEqual(["creativity", "leadership", "teamwork"]);
  });

  it("drops empty/whitespace-only hashtag entries", async () => {
    const { client } = buildKudosClient({
      data: [{ hashtags: "teamwork, ,  ,creativity" }, { hashtags: "" }, { hashtags: null }],
      error: null,
    });
    createClientMock.mockResolvedValue(client);

    const result = await getHashtagSuggestions();
    expect(result).toEqual(["creativity", "teamwork"]);
  });

  it("returns [] when the query errors", async () => {
    const { client } = buildKudosClient({ data: null, error: new Error("db down") });
    createClientMock.mockResolvedValue(client);

    const result = await getHashtagSuggestions();
    expect(result).toEqual([]);
  });

  it("returns [] and swallows the error when createClient throws", async () => {
    createClientMock.mockRejectedValue(new Error("connection refused"));
    const result = await getHashtagSuggestions();
    expect(result).toEqual([]);
  });
});
