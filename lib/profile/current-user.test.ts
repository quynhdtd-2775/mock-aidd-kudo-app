/* eslint-disable @typescript-eslint/no-explicit-any --
   test-only casts for process.env stubbing and partial supabase mocks */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { resolveCurrentUserId, DEMO_USER_ID } from "./current-user";
import { MOCK_USER } from "@/lib/auth/mock-session";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Cookie-backed half of the mock session: stub the cookie read so tests
// control whether a mock session "exists" without a request scope.
vi.mock("@/lib/auth/mock-session-server", () => ({
  getMockUser: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { getMockUser } from "@/lib/auth/mock-session-server";

function stubSupabaseUser(user: { id: string } | null) {
  vi.mocked(createClient).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
  } as any);
}

describe("current-user", () => {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    vi.clearAllMocks();
    originalEnv = {
      AUTH_MODE: process.env.AUTH_MODE,
      NODE_ENV: process.env.NODE_ENV,
    };
  });

  afterEach(() => {
    (process.env as any).AUTH_MODE = originalEnv.AUTH_MODE;
    (process.env as any).NODE_ENV = originalEnv.NODE_ENV;
  });

  describe("DEMO_USER_ID constant", () => {
    it("exports the seeded demo user id", () => {
      expect(DEMO_USER_ID).toBe("00000000-0000-4000-8000-000000000001");
    });

    it("matches MOCK_USER.id so the mock session resolves the seeded profile", () => {
      expect(MOCK_USER.id).toBe(DEMO_USER_ID);
    });
  });

  describe("resolveCurrentUserId — mock auth enabled", () => {
    beforeEach(() => {
      (process.env as any).AUTH_MODE = "mock";
      (process.env as any).NODE_ENV = "development";
    });

    it("returns the mock user's id when a mock session exists", async () => {
      vi.mocked(getMockUser).mockResolvedValue(MOCK_USER);
      await expect(resolveCurrentUserId()).resolves.toBe(DEMO_USER_ID);
      expect(createClient).not.toHaveBeenCalled();
    });

    it("returns null when no mock session cookie is set", async () => {
      vi.mocked(getMockUser).mockResolvedValue(null);
      await expect(resolveCurrentUserId()).resolves.toBeNull();
      expect(createClient).not.toHaveBeenCalled();
    });

    it("never activates in production even with AUTH_MODE=mock", async () => {
      (process.env as any).NODE_ENV = "production";
      stubSupabaseUser({ id: "real-user-id" });
      await expect(resolveCurrentUserId()).resolves.toBe("real-user-id");
      expect(getMockUser).not.toHaveBeenCalled();
    });
  });

  describe("resolveCurrentUserId — supabase path", () => {
    beforeEach(() => {
      delete (process.env as any).AUTH_MODE;
      (process.env as any).NODE_ENV = "development";
    });

    it("returns the supabase session user's id", async () => {
      stubSupabaseUser({ id: "real-user-id" });
      await expect(resolveCurrentUserId()).resolves.toBe("real-user-id");
      expect(getMockUser).not.toHaveBeenCalled();
    });

    it("returns null when unauthenticated", async () => {
      stubSupabaseUser(null);
      await expect(resolveCurrentUserId()).resolves.toBeNull();
    });

    it("ignores AUTH_MODE values other than 'mock'", async () => {
      (process.env as any).AUTH_MODE = "supabase";
      stubSupabaseUser({ id: "real-user-id" });
      await expect(resolveCurrentUserId()).resolves.toBe("real-user-id");
      expect(getMockUser).not.toHaveBeenCalled();
    });
  });
});
