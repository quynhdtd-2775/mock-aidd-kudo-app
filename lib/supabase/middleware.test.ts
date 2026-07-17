// Mocks MUST be defined before imports that depend on them (vitest hoists vi.mock)
vi.mock("@/lib/countdown/launch-at-cache", () => ({
  getCachedLaunchAt: vi.fn(),
  _resetLaunchAtCacheForTests: vi.fn(),
}));

vi.mock("@/lib/auth/mock-session", () => ({
  isMockAuthEnabled: vi.fn(),
  hasMockSessionCookie: vi.fn(),
  MOCK_SESSION_COOKIE: "mock_session",
  MOCK_USER: {
    id: "00000000-0000-4000-8000-000000000001",
    email: "demo@example.com",
    name: "Demo User",
  },
}));

// Mock Supabase client to avoid needing real credentials in tests
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  })),
}));

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./middleware";
import { COUNTDOWN_PATH } from "@/lib/countdown/nav-lock";
import { getCachedLaunchAt, _resetLaunchAtCacheForTests } from "@/lib/countdown/launch-at-cache";
import { isMockAuthEnabled, hasMockSessionCookie, MOCK_SESSION_COOKIE } from "@/lib/auth/mock-session";

describe("middleware — updateSession integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: mock auth enabled, countdown before launch
    vi.mocked(isMockAuthEnabled).mockReturnValue(true);
    vi.mocked(hasMockSessionCookie).mockReturnValue(false);
    const launchTime = new Date(Date.now() + 86400000); // 1 day from now
    vi.mocked(getCachedLaunchAt).mockResolvedValue(launchTime);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Helper to construct NextRequest
  function createRequest(pathname: string, options?: { cookie?: string }): NextRequest {
    const url = new URL(`http://localhost:3000${pathname}`);
    const request = new NextRequest(url);
    if (options?.cookie) {
      request.cookies.set(options.cookie, "1");
    }
    return request;
  }

  describe("Scenario 1: Anonymous to /count-down-prelaunch BEFORE launch (mock-auth)", () => {
    it("passes through without redirect to /login (countdown is public)", async () => {
      const request = createRequest(COUNTDOWN_PATH);
      const response = await updateSession(request);

      // Should NOT redirect to /login
      expect(response.status).not.toBe(307); // 307 = redirect
      // OR: should be a pass-through (status 200 or next())
      expect(response).toBeDefined();

      // Verify nav-lock was called but allowed (countdown path on allowlist before launch)
      expect(vi.mocked(getCachedLaunchAt)).toHaveBeenCalled();

      // Should NOT be a redirect response
      if (response instanceof Response && response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        expect(location).not.toBe("/login");
      }
    });

    it("allows mock session cookie to persist without redirecting to /home-page-saa", async () => {
      // If we have a mock session and we're on countdown (not /login), should stay on countdown
      const request = createRequest(COUNTDOWN_PATH, { cookie: MOCK_SESSION_COOKIE });
      const response = await updateSession(request);

      // Should be pass-through (status not a redirect)
      expect(response.status).not.toBe(307);
    });
  });

  describe("Scenario 2: Anonymous to /home-page-saa BEFORE launch → nav-lock redirect", () => {
    it("redirects to /count-down-prelaunch (nav-lock wins, not auth gate)", async () => {
      const request = createRequest("/home-page-saa");
      const response = await updateSession(request);

      // Nav-lock should redirect to countdown BEFORE auth gate runs
      expect(response.status).toBe(307); // Redirect
      const location = response.headers.get("location");
      expect(location).toContain(COUNTDOWN_PATH);

      // getCachedLaunchAt was called to check nav-lock
      expect(vi.mocked(getCachedLaunchAt)).toHaveBeenCalled();
    });

    it("redirects to /count-down-prelaunch even without mock-auth", async () => {
      vi.mocked(isMockAuthEnabled).mockReturnValue(false);
      const request = createRequest("/home-page-saa");
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain(COUNTDOWN_PATH);
    });

    it("redirects to /count-down-prelaunch for various non-public paths before launch", async () => {
      const paths = ["/", "/home", "/profile", "/dashboard"];

      for (const path of paths) {
        vi.clearAllMocks();
        vi.mocked(isMockAuthEnabled).mockReturnValue(true);
        const launchTime = new Date(Date.now() + 86400000);
        vi.mocked(getCachedLaunchAt).mockResolvedValue(launchTime);

        const request = createRequest(path);
        const response = await updateSession(request);

        expect(response.status).toBe(307);
        const location = response.headers.get("location");
        expect(location).toContain(COUNTDOWN_PATH);
      }
    });
  });

  describe("Scenario 3: launch_at null → auth gate controls access, no countdown lock", () => {
    beforeEach(() => {
      // Simulate DB down: getCachedLaunchAt returns null
      vi.mocked(getCachedLaunchAt).mockResolvedValue(null);
      vi.mocked(isMockAuthEnabled).mockReturnValue(true);
    });

    it("anonymous /home-page-saa goes to /login (auth gate), not countdown", async () => {
      const request = createRequest("/home-page-saa");
      const response = await updateSession(request);

      // With null launch_at, nav-lock allows everything (fail-open)
      // Then auth gate redirects anonymous to /login
      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/login");
    });

    it("anonymous /count-down-prelaunch is allowed (no countdown lock, and is public path)", async () => {
      const request = createRequest(COUNTDOWN_PATH);
      const response = await updateSession(request);

      // Nav-lock: null launch_at → no lock (fail-open)
      // Auth gate: /count-down-prelaunch is in PUBLIC_PATHS → allow
      expect(response.status).not.toBe(307);
    });

    it("allows access to /login without countdown lock (public path)", async () => {
      const request = createRequest("/login");
      const response = await updateSession(request);

      // /login is PUBLIC_PATHS → no auth redirect needed
      expect(response.status).not.toBe(307);
    });

    it("allows access to /auth paths without countdown lock (public paths)", async () => {
      const request = createRequest("/auth/callback");
      const response = await updateSession(request);

      // /auth/* is in PUBLIC_PATHS → no redirect
      expect(response.status).not.toBe(307);
    });
  });

  describe("Scenario 4: After launch: /count-down-prelaunch → redirect to /", () => {
    beforeEach(() => {
      // Simulate launch has happened: launchAt is in the past
      vi.mocked(getCachedLaunchAt).mockResolvedValue(new Date(Date.now() - 1000));
      vi.mocked(isMockAuthEnabled).mockReturnValue(true);
    });

    it("redirects /count-down-prelaunch to / after launch", async () => {
      const request = createRequest(COUNTDOWN_PATH);
      const response = await updateSession(request);

      // Nav-lock should redirect to /
      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/");
    });

    it("allows /home-page-saa after launch (no nav-lock, has mock session)", async () => {
      // After launch, nav-lock doesn't lock non-countdown paths
      // Mock session required to not redirect to /login
      vi.mocked(hasMockSessionCookie).mockReturnValue(true);
      const request = createRequest("/home-page-saa", { cookie: MOCK_SESSION_COOKIE });
      const response = await updateSession(request);

      // Should be pass-through (not redirect from nav-lock)
      // Nav-lock only redirects to countdown before launch
      expect(response.status).not.toBe(307);
    });

    it("redirects /count-down-prelaunch/nested to / after launch", async () => {
      const request = createRequest(`${COUNTDOWN_PATH}/nested`);
      const response = await updateSession(request);

      // Nav-lock prefix-matches countdown path after launch
      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/");
    });

    it("allows authenticated users everywhere after launch", async () => {
      // With mock session after launch
      vi.mocked(hasMockSessionCookie).mockReturnValue(true);
      const request = createRequest("/home-page-saa", { cookie: MOCK_SESSION_COOKIE });
      const response = await updateSession(request);

      // Should be pass-through (nav-lock allows, mock session allows)
      expect(response.status).not.toBe(307);
    });
  });

  describe("Critical regression: /count-down-prelaunch in PUBLIC_PATHS", () => {
    it("anonymous visitor can reach countdown page before launch via mock-auth (not redirected to /login)", async () => {
      // This is the bug that was found and fixed:
      // Without COUNTDOWN_PATH in PUBLIC_PATHS, anonymous users would be redirected to /login
      // even though nav-lock allowed them through
      vi.mocked(isMockAuthEnabled).mockReturnValue(true);
      vi.mocked(hasMockSessionCookie).mockReturnValue(false); // Anonymous
      const launchTime = new Date(Date.now() + 86400000);
      vi.mocked(getCachedLaunchAt).mockResolvedValue(launchTime);

      const request = createRequest(COUNTDOWN_PATH);
      const response = await updateSession(request);

      // Mock-auth should NOT redirect to /login because /count-down-prelaunch is in PUBLIC_PATHS
      // It should pass through (status 200, not 307 redirect to /login)
      expect(vi.mocked(getCachedLaunchAt)).toHaveBeenCalled();

      // Check that we don't get redirected to /login
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        expect(location).not.toContain("/login");
      }
    });
  });

  describe("Edge cases and combined scenarios", () => {
    it("mock-auth enabled, before launch: authenticated user on /login → redirects to /home-page-saa", async () => {
      vi.mocked(isMockAuthEnabled).mockReturnValue(true);
      vi.mocked(hasMockSessionCookie).mockReturnValue(true);
      const launchTime = new Date(Date.now() + 86400000);
      vi.mocked(getCachedLaunchAt).mockResolvedValue(launchTime);

      const request = createRequest("/login", { cookie: MOCK_SESSION_COOKIE });
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/home-page-saa");
    });

    it("mock-auth enabled, after launch: authenticated user on /login → redirects to /home-page-saa", async () => {
      vi.mocked(isMockAuthEnabled).mockReturnValue(true);
      vi.mocked(hasMockSessionCookie).mockReturnValue(true);
      const launchTime = new Date(Date.now() - 1000); // Past
      vi.mocked(getCachedLaunchAt).mockResolvedValue(launchTime);

      const request = createRequest("/login", { cookie: MOCK_SESSION_COOKIE });
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/home-page-saa");
    });

    it("mock-auth disabled, before launch: anonymous /home-page-saa → nav-lock redirects to countdown", async () => {
      vi.mocked(isMockAuthEnabled).mockReturnValue(false);
      const launchTime = new Date(Date.now() + 86400000);
      vi.mocked(getCachedLaunchAt).mockResolvedValue(launchTime);

      const request = createRequest("/home-page-saa");
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain(COUNTDOWN_PATH);
    });

    it("race condition protection: nav-lock checked before auth gate", async () => {
      // Even if auth gate would redirect to /login, nav-lock should win first
      vi.mocked(isMockAuthEnabled).mockReturnValue(true);
      vi.mocked(hasMockSessionCookie).mockReturnValue(false); // Anonymous
      const launchTime = new Date(Date.now() + 86400000); // Before launch
      vi.mocked(getCachedLaunchAt).mockResolvedValue(launchTime);

      const request = createRequest("/profile");
      const response = await updateSession(request);

      // Nav-lock should redirect to /count-down-prelaunch (not to /login from auth gate)
      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain(COUNTDOWN_PATH);
      expect(location).not.toContain("/login");
    });
  });

  describe("Countdown path variations", () => {
    it("exact /count-down-prelaunch before launch → allowed (public, countdown allowlist)", async () => {
      vi.mocked(getCachedLaunchAt).mockResolvedValue(new Date(Date.now() + 86400000));
      vi.mocked(isMockAuthEnabled).mockReturnValue(true);
      vi.mocked(hasMockSessionCookie).mockReturnValue(false);

      const request = createRequest("/count-down-prelaunch");
      const response = await updateSession(request);

      // Should not redirect (allowed by nav-lock and public)
      expect(response.status).not.toBe(307);
    });

    it("/count-down-prelaunch/ after launch → redirected to /", async () => {
      vi.mocked(getCachedLaunchAt).mockResolvedValue(new Date(Date.now() - 1000));
      vi.mocked(isMockAuthEnabled).mockReturnValue(true);

      const request = createRequest("/count-down-prelaunch/");
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/");
    });
  });
});
