import { describe, it, expect } from "vitest";
import {
  resolveNavLock,
  COUNTDOWN_PATH,
  type NavLockResult,
} from "./nav-lock";

describe("nav-lock", () => {
  const baseDate = new Date("2026-01-01T00:00:00Z");

  describe("fail-open: launchAt === null", () => {
    it("returns null when launchAt is null (DB down)", () => {
      const result = resolveNavLock("/", null, baseDate);
      expect(result).toBeNull();
    });

    it("never locks any path when launchAt is null", () => {
      const paths = [
        "/",
        "/home",
        "/count-down-prelaunch",
        "/dashboard",
        "/random-path",
      ];

      paths.forEach((path) => {
        const result = resolveNavLock(path, null, baseDate);
        expect(result).toBeNull();
      });
    });
  });

  describe("before launch (now < launchAt)", () => {
    const launchAt = new Date(baseDate.getTime() + 7 * 86400000); // 7 days from now

    describe("allowlist: /count-down-prelaunch", () => {
      it("allows /count-down-prelaunch path exactly", () => {
        const result = resolveNavLock(COUNTDOWN_PATH, launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /count-down-prelaunch/ with trailing slash", () => {
        const result = resolveNavLock("/count-down-prelaunch/", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /count-down-prelaunch/sub-path", () => {
        const result = resolveNavLock("/count-down-prelaunch/nested", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /count-down-prelaunch/deep/nested/path", () => {
        const result = resolveNavLock(
          "/count-down-prelaunch/deep/nested/path",
          launchAt,
          baseDate
        );
        expect(result).toBeNull();
      });
    });

    describe("allowlist: /login", () => {
      it("allows /login path exactly", () => {
        const result = resolveNavLock("/login", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /login/ with trailing slash", () => {
        const result = resolveNavLock("/login/", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /login/callback and sub-paths", () => {
        const result = resolveNavLock("/login/callback", launchAt, baseDate);
        expect(result).toBeNull();
      });
    });

    describe("allowlist: /auth (prefix)", () => {
      it("allows /auth path exactly", () => {
        const result = resolveNavLock("/auth", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /auth/ with trailing slash", () => {
        const result = resolveNavLock("/auth/", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /auth/callback", () => {
        const result = resolveNavLock("/auth/callback", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /auth/github/callback", () => {
        const result = resolveNavLock("/auth/github/callback", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /auth/deeply/nested/path", () => {
        const result = resolveNavLock("/auth/deeply/nested/path", launchAt, baseDate);
        expect(result).toBeNull();
      });
    });

    describe("before launch: non-allowlisted paths redirect", () => {
      it("redirects / to countdown page", () => {
        const result = resolveNavLock("/", launchAt, baseDate);
        expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
      });

      it("redirects /home to countdown page", () => {
        const result = resolveNavLock("/home", launchAt, baseDate);
        expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
      });

      it("redirects /profile to countdown page", () => {
        const result = resolveNavLock("/profile", launchAt, baseDate);
        expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
      });

      it("redirects /dashboard to countdown page", () => {
        const result = resolveNavLock("/dashboard", launchAt, baseDate);
        expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
      });

      it("redirects /admin/settings to countdown page", () => {
        const result = resolveNavLock("/admin/settings", launchAt, baseDate);
        expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
      });

      it("redirects similar but different paths (/login-admin)", () => {
        // /login-admin does not match /login (no prefix match)
        const result = resolveNavLock("/login-admin", launchAt, baseDate);
        expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
      });

      it("redirects /auth-custom (does not match /auth prefix)", () => {
        // /auth-custom is not /auth or /auth/...
        const result = resolveNavLock("/auth-custom", launchAt, baseDate);
        expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
      });

      it("redirects /count-down (does not match /count-down-prelaunch)", () => {
        const result = resolveNavLock("/count-down", launchAt, baseDate);
        expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
      });
    });

    describe("before launch: case sensitivity", () => {
      it("is case-sensitive: redirects /LOGIN", () => {
        const result = resolveNavLock("/LOGIN", launchAt, baseDate);
        expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
      });

      it("is case-sensitive: redirects /Auth", () => {
        const result = resolveNavLock("/Auth", launchAt, baseDate);
        expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
      });

      it("is case-sensitive: redirects /COUNTDOWN", () => {
        const result = resolveNavLock("/COUNTDOWN", launchAt, baseDate);
        expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
      });
    });
  });

  describe("after launch (now >= launchAt)", () => {
    const launchAt = new Date(baseDate.getTime() - 1000); // launched 1 second ago

    describe("after launch: /count-down-prelaunch redirects to /", () => {
      it("redirects /count-down-prelaunch exactly to /", () => {
        const result = resolveNavLock(COUNTDOWN_PATH, launchAt, baseDate);
        expect(result).toEqual({ redirectTo: "/" });
      });

      it("redirects /count-down-prelaunch/ (with trailing slash) home after launch", () => {
        // Prefix match mirrors the before-launch allowlist behavior.
        const result = resolveNavLock("/count-down-prelaunch/", launchAt, baseDate);
        expect(result).toEqual({ redirectTo: "/" });
      });

      it("redirects /count-down-prelaunch/something home after launch", () => {
        const result = resolveNavLock(
          "/count-down-prelaunch/something",
          launchAt,
          baseDate
        );
        expect(result).toEqual({ redirectTo: "/" });
      });
    });

    describe("after launch: other paths are allowed", () => {
      it("allows / after launch", () => {
        const result = resolveNavLock("/", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /home after launch", () => {
        const result = resolveNavLock("/home", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /profile after launch", () => {
        const result = resolveNavLock("/profile", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /login after launch", () => {
        const result = resolveNavLock("/login", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /auth after launch", () => {
        const result = resolveNavLock("/auth", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /auth/callback after launch", () => {
        const result = resolveNavLock("/auth/callback", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /dashboard after launch", () => {
        const result = resolveNavLock("/dashboard", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("allows /admin/settings after launch", () => {
        const result = resolveNavLock("/admin/settings", launchAt, baseDate);
        expect(result).toBeNull();
      });
    });

    describe("after launch: only countdown path special-cases", () => {
      it("does not redirect /count-down after launch (different path)", () => {
        const result = resolveNavLock("/count-down", launchAt, baseDate);
        expect(result).toBeNull();
      });

      it("does not redirect /count-down-prelaunch-other after launch", () => {
        const result = resolveNavLock(
          "/count-down-prelaunch-other",
          launchAt,
          baseDate
        );
        expect(result).toBeNull();
      });
    });
  });

  describe("launch boundary: now === launchAt (exactly at launch instant)", () => {
    const launchAt = new Date(baseDate.getTime());

    it("treats equality as launch-complete (now >= launchAt)", () => {
      const result = resolveNavLock(COUNTDOWN_PATH, launchAt, baseDate);
      expect(result).toEqual({ redirectTo: "/" });
    });

    it("allows non-countdown paths at exact launch instant", () => {
      const result = resolveNavLock("/", launchAt, baseDate);
      expect(result).toBeNull();
    });
  });

  describe("mixed scenarios (loop safety)", () => {
    it("handles rapid consecutive checks before launch", () => {
      const launchAt = new Date(baseDate.getTime() + 86400000);
      const now = baseDate;

      // First check redirects
      const result1 = resolveNavLock("/home", launchAt, now);
      expect(result1).toEqual({ redirectTo: COUNTDOWN_PATH });

      // Second identical check should return same result (safe loop)
      const result2 = resolveNavLock("/home", launchAt, now);
      expect(result2).toEqual({ redirectTo: COUNTDOWN_PATH });

      // Allowlisted path should pass through
      const result3 = resolveNavLock(COUNTDOWN_PATH, launchAt, now);
      expect(result3).toBeNull();
    });

    it("handles rapid consecutive checks after launch", () => {
      const launchAt = new Date(baseDate.getTime() - 1000);
      const now = baseDate;

      const result1 = resolveNavLock(COUNTDOWN_PATH, launchAt, now);
      expect(result1).toEqual({ redirectTo: "/" });

      const result2 = resolveNavLock(COUNTDOWN_PATH, launchAt, now);
      expect(result2).toEqual({ redirectTo: "/" });

      const result3 = resolveNavLock("/", launchAt, now);
      expect(result3).toBeNull();
    });

    it("handles path changes without state", () => {
      const launchAt = new Date(baseDate.getTime() + 86400000);
      const now = baseDate;

      // Check different paths - none should retain state
      expect(resolveNavLock("/", launchAt, now)).toEqual({
        redirectTo: COUNTDOWN_PATH,
      });
      expect(resolveNavLock("/home", launchAt, now)).toEqual({
        redirectTo: COUNTDOWN_PATH,
      });
      expect(resolveNavLock(COUNTDOWN_PATH, launchAt, now)).toBeNull();
      expect(resolveNavLock("/login", launchAt, now)).toBeNull();
    });
  });

  describe("return value shape", () => {
    it("returns null (not undefined) when no lock needed", () => {
      const launchAt = new Date(baseDate.getTime() + 86400000); // Future date
      const result = resolveNavLock(COUNTDOWN_PATH, launchAt, baseDate);
      expect(result).toBeNull();
    });

    it("returns object with redirectTo property when lock needed", () => {
      const launchAt = new Date(Date.now() + 86400000);
      const result = resolveNavLock("/", launchAt, new Date());

      expect(result).not.toBeNull();
      expect(result).toHaveProperty("redirectTo");
      expect(result?.redirectTo).toBe(COUNTDOWN_PATH);
    });

    it("redirectTo always contains valid path string", () => {
      const launchAt = new Date(Date.now() + 86400000);
      const result = resolveNavLock("/", launchAt, new Date());

      if (result) {
        expect(typeof result.redirectTo).toBe("string");
        expect(result.redirectTo.length).toBeGreaterThan(0);
        expect(result.redirectTo.startsWith("/")).toBe(true);
      }
    });
  });

  describe("edge case paths", () => {
    const launchAt = new Date(Date.now() + 86400000); // before launch
    const now = new Date();

    it("handles empty path string", () => {
      const result = resolveNavLock("", launchAt, now);
      expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
    });

    it("handles root path /", () => {
      const result = resolveNavLock("/", launchAt, now);
      expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
    });

    it("handles path with query string-like syntax", () => {
      const result = resolveNavLock("/home?foo=bar", launchAt, now);
      expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
    });

    it("handles path with hash-like syntax", () => {
      const result = resolveNavLock("/home#section", launchAt, now);
      expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
    });

    it("handles very long path", () => {
      const longPath = "/" + "a".repeat(1000);
      const result = resolveNavLock(longPath, launchAt, now);
      expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
    });

    it("handles path with multiple slashes", () => {
      const result = resolveNavLock("/home//page", launchAt, now);
      expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
    });
  });

  describe("date edge cases", () => {
    describe("far future launch", () => {
      it("handles 1-year countdown", () => {
        const now = new Date("2026-01-01T00:00:00Z");
        const launchAt = new Date("2027-01-01T00:00:00Z");

        const result = resolveNavLock("/", launchAt, now);
        expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
      });

      it("handles 100-year countdown", () => {
        const now = new Date("2026-01-01T00:00:00Z");
        const launchAt = new Date("2126-01-01T00:00:00Z");

        const result = resolveNavLock("/", launchAt, now);
        expect(result).toEqual({ redirectTo: COUNTDOWN_PATH });
      });
    });

    describe("far past launch", () => {
      it("handles 1-year-old launch", () => {
        const now = new Date("2026-01-01T00:00:00Z");
        const launchAt = new Date("2025-01-01T00:00:00Z");

        const result = resolveNavLock(COUNTDOWN_PATH, launchAt, now);
        expect(result).toEqual({ redirectTo: "/" });
      });

      it("handles 100-year-old launch", () => {
        const now = new Date("2026-01-01T00:00:00Z");
        const launchAt = new Date("1926-01-01T00:00:00Z");

        const result = resolveNavLock(COUNTDOWN_PATH, launchAt, now);
        expect(result).toEqual({ redirectTo: "/" });
      });
    });

    describe("millisecond precision", () => {
      it("handles 1 millisecond before launch", () => {
        const launchAt = new Date("2026-01-02T00:00:00.000Z");
        const now = new Date("2026-01-02T00:00:00.000Z"); // exactly at launch time
        // Subtract 1ms from launchAt to test "1ms before"
        const justBefore = new Date(launchAt.getTime() - 1);

        const result = resolveNavLock(COUNTDOWN_PATH, launchAt, justBefore);
        expect(result).toBeNull(); // Still in allowlist before launch
      });

      it("handles 1 millisecond after launch", () => {
        const launchAt = new Date("2026-01-02T00:00:00.000Z");
        const justAfter = new Date(launchAt.getTime() + 1);

        const result = resolveNavLock(COUNTDOWN_PATH, launchAt, justAfter);
        expect(result).toEqual({ redirectTo: "/" });
      });
    });
  });
});
