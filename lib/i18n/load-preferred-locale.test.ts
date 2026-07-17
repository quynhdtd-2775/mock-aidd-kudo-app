// Mocks MUST be defined before imports that depend on them (vitest hoists vi.mock).
const cookieGetMock = vi.fn();
const cookieSetMock = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: cookieGetMock, set: cookieSetMock })),
}));

vi.mock("@/lib/auth/mock-session", () => ({
  isMockAuthEnabled: vi.fn(),
}));

vi.mock("@/lib/profile/current-user", () => ({
  resolveCurrentUserId: vi.fn(),
}));

const maybeSingleMock = vi.fn();
const eqMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadPreferredLocale } from "./load-preferred-locale";
import { isMockAuthEnabled } from "@/lib/auth/mock-session";
import { resolveCurrentUserId } from "@/lib/profile/current-user";

describe("loadPreferredLocale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieGetMock.mockReturnValue(undefined);
  });

  it("returns the cookie value when present, without querying the DB", async () => {
    cookieGetMock.mockReturnValue({ value: "en" });

    const locale = await loadPreferredLocale();

    expect(locale).toBe("en");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("ignores an invalid cookie value and falls through to the default in mock mode", async () => {
    cookieGetMock.mockReturnValue({ value: "fr" });
    vi.mocked(isMockAuthEnabled).mockReturnValue(true);

    const locale = await loadPreferredLocale();

    expect(locale).toBe("vi");
  });

  it("mock mode with no cookie: returns the default locale", async () => {
    vi.mocked(isMockAuthEnabled).mockReturnValue(true);

    const locale = await loadPreferredLocale();

    expect(locale).toBe("vi");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("guest (no user id), non-mock, no cookie: returns the default locale", async () => {
    vi.mocked(isMockAuthEnabled).mockReturnValue(false);
    vi.mocked(resolveCurrentUserId).mockResolvedValue(null);

    const locale = await loadPreferredLocale();

    expect(locale).toBe("vi");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("logged-in user with a stored language and no cookie: seeds the cookie and returns it", async () => {
    vi.mocked(isMockAuthEnabled).mockReturnValue(false);
    vi.mocked(resolveCurrentUserId).mockResolvedValue("user-123");
    maybeSingleMock.mockResolvedValue({ data: { language: "en" }, error: null });

    const locale = await loadPreferredLocale();

    expect(locale).toBe("en");
    expect(fromMock).toHaveBeenCalledWith("profiles");
    expect(eqMock).toHaveBeenCalledWith("id", "user-123");
    expect(cookieSetMock).toHaveBeenCalledWith(
      "NEXT_LOCALE",
      "en",
      expect.objectContaining({ path: "/" }),
    );
  });

  it("logged-in user with no stored language: returns the default without setting a cookie", async () => {
    vi.mocked(isMockAuthEnabled).mockReturnValue(false);
    vi.mocked(resolveCurrentUserId).mockResolvedValue("user-123");
    maybeSingleMock.mockResolvedValue({ data: { language: null }, error: null });

    const locale = await loadPreferredLocale();

    expect(locale).toBe("vi");
    expect(cookieSetMock).not.toHaveBeenCalled();
  });

  it("DB error: falls back to the default locale", async () => {
    vi.mocked(isMockAuthEnabled).mockReturnValue(false);
    vi.mocked(resolveCurrentUserId).mockResolvedValue("user-123");
    maybeSingleMock.mockResolvedValue({ data: null, error: new Error("db down") });

    const locale = await loadPreferredLocale();

    expect(locale).toBe("vi");
    expect(cookieSetMock).not.toHaveBeenCalled();
  });

  it("does not throw when cookieStore.set is unavailable (RSC render context)", async () => {
    vi.mocked(isMockAuthEnabled).mockReturnValue(false);
    vi.mocked(resolveCurrentUserId).mockResolvedValue("user-123");
    maybeSingleMock.mockResolvedValue({ data: { language: "en" }, error: null });
    cookieSetMock.mockImplementation(() => {
      throw new Error("cannot set cookie in RSC render");
    });

    await expect(loadPreferredLocale()).resolves.toBe("en");
  });
});
