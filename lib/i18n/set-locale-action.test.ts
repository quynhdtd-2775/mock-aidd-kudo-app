// Mocks MUST be defined before imports that depend on them (vitest hoists vi.mock).
const cookieSetMock = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ set: cookieSetMock })),
}));

vi.mock("@/lib/auth/mock-session", () => ({
  isMockAuthEnabled: vi.fn(),
}));

vi.mock("@/lib/profile/current-user", () => ({
  resolveCurrentUserId: vi.fn(),
}));

const updateEqMock = vi.fn();
const updateMock = vi.fn(() => ({ eq: updateEqMock }));
const fromMock = vi.fn(() => ({ update: updateMock }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

import { describe, it, expect, beforeEach, vi } from "vitest";
import { setLocale } from "./set-locale-action";
import { isMockAuthEnabled } from "@/lib/auth/mock-session";
import { resolveCurrentUserId } from "@/lib/profile/current-user";

describe("setLocale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateEqMock.mockResolvedValue({ error: null });
  });

  it("throws on an unsupported locale and does not touch the cookie or DB", async () => {
    await expect(setLocale("fr")).rejects.toThrow(/unsupported locale/i);
    expect(cookieSetMock).not.toHaveBeenCalled();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("always sets the cookie for a valid locale", async () => {
    vi.mocked(isMockAuthEnabled).mockReturnValue(true);

    await setLocale("en");

    expect(cookieSetMock).toHaveBeenCalledWith(
      "NEXT_LOCALE",
      "en",
      expect.objectContaining({ path: "/" }),
    );
  });

  it("mock mode: sets cookie only, skips the DB write", async () => {
    vi.mocked(isMockAuthEnabled).mockReturnValue(true);

    await setLocale("en");

    expect(cookieSetMock).toHaveBeenCalled();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("guest (no user id), non-mock: sets cookie only, skips the DB write", async () => {
    vi.mocked(isMockAuthEnabled).mockReturnValue(false);
    vi.mocked(resolveCurrentUserId).mockResolvedValue(null);

    await setLocale("en");

    expect(cookieSetMock).toHaveBeenCalled();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("authenticated, non-mock: sets cookie and persists language to profiles", async () => {
    vi.mocked(isMockAuthEnabled).mockReturnValue(false);
    vi.mocked(resolveCurrentUserId).mockResolvedValue("user-123");

    await setLocale("en");

    expect(cookieSetMock).toHaveBeenCalledWith(
      "NEXT_LOCALE",
      "en",
      expect.objectContaining({ path: "/" }),
    );
    expect(fromMock).toHaveBeenCalledWith("profiles");
    expect(updateMock).toHaveBeenCalledWith({ language: "en" });
    expect(updateEqMock).toHaveBeenCalledWith("id", "user-123");
  });

  it("logs but does not throw when the DB update fails", async () => {
    vi.mocked(isMockAuthEnabled).mockReturnValue(false);
    vi.mocked(resolveCurrentUserId).mockResolvedValue("user-123");
    updateEqMock.mockResolvedValue({ error: new Error("db down") });
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(setLocale("vi")).resolves.toBeUndefined();

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
