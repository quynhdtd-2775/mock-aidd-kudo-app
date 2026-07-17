import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getCachedLaunchAt,
  _resetLaunchAtCacheForTests,
} from "./launch-at-cache";

// Mock getLaunchAt so we can control what it returns and spy on calls
vi.mock("./event-settings-queries", () => ({
  getLaunchAt: vi.fn(),
}));

import { getLaunchAt } from "./event-settings-queries";

describe("launch-at-cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetLaunchAtCacheForTests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    _resetLaunchAtCacheForTests();
  });

  describe("getCachedLaunchAt", () => {
    const testDate = new Date("2026-02-01T12:00:00Z");

    describe("first call: fetch from DB", () => {
      it("calls getLaunchAt on first access", async () => {
        vi.mocked(getLaunchAt).mockResolvedValue(testDate);

        const result = await getCachedLaunchAt();

        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);
        expect(result).toBe(testDate);
      });

      it("returns the date from getLaunchAt", async () => {
        const expectedDate = new Date("2026-03-15T08:30:00Z");
        vi.mocked(getLaunchAt).mockResolvedValue(expectedDate);

        const result = await getCachedLaunchAt();

        expect(result).toBe(expectedDate);
      });

      it("returns null when getLaunchAt returns null", async () => {
        vi.mocked(getLaunchAt).mockResolvedValue(null);

        const result = await getCachedLaunchAt();

        expect(result).toBeNull();
      });
    });

    describe("cache hit within TTL (60s)", () => {
      it("does not refetch within 60 seconds", async () => {
        vi.mocked(getLaunchAt).mockResolvedValue(testDate);

        // First call fetches
        const result1 = await getCachedLaunchAt();
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);

        // Advance time by 30 seconds (within TTL)
        vi.advanceTimersByTime(30000);

        // Second call should hit cache
        const result2 = await getCachedLaunchAt();
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1); // Still 1 call

        expect(result1).toBe(result2);
        expect(result2).toBe(testDate);
      });

      it("returns cached value at 59 seconds (just before TTL expires)", async () => {
        vi.mocked(getLaunchAt).mockResolvedValue(testDate);

        // First call
        await getCachedLaunchAt();
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);

        // Advance 59 seconds
        vi.advanceTimersByTime(59000);

        // Should still hit cache
        const result = await getCachedLaunchAt();
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);
        expect(result).toBe(testDate);
      });

      it("returns same cached instance on multiple calls within TTL", async () => {
        const date1 = new Date("2026-02-01T00:00:00Z");
        vi.mocked(getLaunchAt).mockResolvedValue(date1);

        const result1 = await getCachedLaunchAt();
        const result2 = await getCachedLaunchAt();
        const result3 = await getCachedLaunchAt();

        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);
      });

      it("returns cached null value within TTL", async () => {
        vi.mocked(getLaunchAt).mockResolvedValue(null);

        const result1 = await getCachedLaunchAt();
        vi.advanceTimersByTime(30000);
        const result2 = await getCachedLaunchAt();

        expect(result1).toBeNull();
        expect(result2).toBeNull();
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);
      });
    });

    describe("cache expiration at 60s TTL", () => {
      it("refetches at exactly 60 seconds (TTL boundary)", async () => {
        const date1 = new Date("2026-02-01T00:00:00Z");
        const date2 = new Date("2026-02-02T00:00:00Z");

        vi.mocked(getLaunchAt)
          .mockResolvedValueOnce(date1)
          .mockResolvedValueOnce(date2);

        // First call
        const result1 = await getCachedLaunchAt();
        expect(result1).toBe(date1);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);

        // Advance exactly 60 seconds (TTL expires)
        vi.advanceTimersByTime(60000);

        // Should refetch
        const result2 = await getCachedLaunchAt();
        expect(result2).toBe(date2);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(2);
      });

      it("refetches after 60 seconds", async () => {
        const date1 = new Date("2026-02-01T00:00:00Z");
        const date2 = new Date("2026-02-02T00:00:00Z");

        vi.mocked(getLaunchAt)
          .mockResolvedValueOnce(date1)
          .mockResolvedValueOnce(date2);

        await getCachedLaunchAt();
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);

        // Advance beyond TTL
        vi.advanceTimersByTime(61000);

        const result = await getCachedLaunchAt();
        expect(result).toBe(date2);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(2);
      });

      it("refetches after 60+ seconds with multiple intervals", async () => {
        const dates = [
          new Date("2026-02-01T00:00:00Z"),
          new Date("2026-02-02T00:00:00Z"),
          new Date("2026-02-03T00:00:00Z"),
        ];

        vi.mocked(getLaunchAt)
          .mockResolvedValueOnce(dates[0])
          .mockResolvedValueOnce(dates[1])
          .mockResolvedValueOnce(dates[2]);

        // First fetch
        let result = await getCachedLaunchAt();
        expect(result).toBe(dates[0]);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);

        // Still within TTL
        vi.advanceTimersByTime(30000);
        result = await getCachedLaunchAt();
        expect(result).toBe(dates[0]);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);

        // Expire cache and refetch
        vi.advanceTimersByTime(31000); // Total 61s
        result = await getCachedLaunchAt();
        expect(result).toBe(dates[1]);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(2);

        // Cache again
        vi.advanceTimersByTime(30000);
        result = await getCachedLaunchAt();
        expect(result).toBe(dates[1]);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(2);

        // Expire and refetch again
        vi.advanceTimersByTime(31000); // Total 122s from start
        result = await getCachedLaunchAt();
        expect(result).toBe(dates[2]);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(3);
      });
    });

    describe("error handling and null-safety", () => {
      it("handles getLaunchAt throwing an error (but it should not)", async () => {
        // Note: getLaunchAt is supposed to never throw, returning null on error instead
        // But if it does, the cache should not catch it (error bubbles up)
        vi.mocked(getLaunchAt).mockRejectedValue(new Error("DB error"));

        await expect(getCachedLaunchAt()).rejects.toThrow("DB error");
      });

      it("caches null value from getLaunchAt", async () => {
        vi.mocked(getLaunchAt).mockResolvedValue(null);

        const result1 = await getCachedLaunchAt();
        vi.advanceTimersByTime(30000);
        const result2 = await getCachedLaunchAt();

        expect(result1).toBeNull();
        expect(result2).toBeNull();
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);
      });

      it("refetches when previous fetch returned null and TTL expired", async () => {
        const date = new Date("2026-02-01T00:00:00Z");

        vi.mocked(getLaunchAt)
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(date);

        // First call returns null
        let result = await getCachedLaunchAt();
        expect(result).toBeNull();
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);

        // Within TTL, still returns null
        vi.advanceTimersByTime(30000);
        result = await getCachedLaunchAt();
        expect(result).toBeNull();
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);

        // TTL expires, refetches and gets real date
        vi.advanceTimersByTime(31000);
        result = await getCachedLaunchAt();
        expect(result).toBe(date);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(2);
      });

      it("handles alternating null and non-null returns", async () => {
        const date = new Date("2026-02-01T00:00:00Z");

        vi.mocked(getLaunchAt)
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(date)
          .mockResolvedValueOnce(null);

        // First: null
        let result = await getCachedLaunchAt();
        expect(result).toBeNull();

        // Expire, refetch: date
        vi.advanceTimersByTime(60001);
        result = await getCachedLaunchAt();
        expect(result).toBe(date);

        // Expire, refetch: null again
        vi.advanceTimersByTime(60001);
        result = await getCachedLaunchAt();
        expect(result).toBeNull();

        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(3);
      });
    });

    describe("concurrent calls (within same TTL window)", () => {
      it("handles multiple concurrent calls (all hit cache)", async () => {
        vi.mocked(getLaunchAt).mockResolvedValue(testDate);

        // Start multiple parallel calls (all will enter the cache check simultaneously)
        const promises = [
          getCachedLaunchAt(),
          getCachedLaunchAt(),
          getCachedLaunchAt(),
        ];

        // With fake timers and the synchronous cache logic,
        // all three should execute sequentially and the first one
        // will populate the cache, others will use it
        const results = await Promise.all(promises);

        // All should get the same value
        expect(results[0]).toBe(testDate);
        expect(results[1]).toBe(testDate);
        expect(results[2]).toBe(testDate);

        // Should have called getLaunchAt at least once
        expect(vi.mocked(getLaunchAt).mock.calls.length).toBeGreaterThanOrEqual(1);
      });

      it("handles calls with TTL expiration between them", async () => {
        const date1 = new Date("2026-02-01T00:00:00Z");
        const date2 = new Date("2026-02-02T00:00:00Z");

        vi.mocked(getLaunchAt)
          .mockResolvedValueOnce(date1)
          .mockResolvedValueOnce(date2);

        // First call
        const result1 = await getCachedLaunchAt();
        expect(result1).toBe(date1);

        // Expire TTL
        vi.advanceTimersByTime(60001);

        // Second call should refetch
        const result2 = await getCachedLaunchAt();
        expect(result2).toBe(date2);

        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(2);
      });
    });

    describe("_resetLaunchAtCacheForTests helper", () => {
      it("clears the cache", async () => {
        const date1 = new Date("2026-02-01T00:00:00Z");
        const date2 = new Date("2026-02-02T00:00:00Z");

        vi.mocked(getLaunchAt)
          .mockResolvedValueOnce(date1)
          .mockResolvedValueOnce(date2);

        // First call caches
        const result1 = await getCachedLaunchAt();
        expect(result1).toBe(date1);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);

        // Reset cache
        _resetLaunchAtCacheForTests();

        // Next call should refetch (no TTL delay needed)
        const result2 = await getCachedLaunchAt();
        expect(result2).toBe(date2);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(2);
      });

      it("allows test isolation between cases", async () => {
        const date1 = new Date("2026-02-01T00:00:00Z");
        const date2 = new Date("2026-02-02T00:00:00Z");

        // Test case 1
        vi.mocked(getLaunchAt).mockResolvedValue(date1);
        let result = await getCachedLaunchAt();
        expect(result).toBe(date1);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);

        // Reset for test case 2
        _resetLaunchAtCacheForTests();
        vi.clearAllMocks();

        vi.mocked(getLaunchAt).mockResolvedValue(date2);
        result = await getCachedLaunchAt();
        expect(result).toBe(date2);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);
      });

      it("clears null-cached values", async () => {
        const date = new Date("2026-02-01T00:00:00Z");

        vi.mocked(getLaunchAt)
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(date);

        // First call: null
        let result = await getCachedLaunchAt();
        expect(result).toBeNull();

        // Reset clears the null cache
        _resetLaunchAtCacheForTests();

        // Next call: fetches and gets date
        result = await getCachedLaunchAt();
        expect(result).toBe(date);

        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(2);
      });

      it("does not affect getLaunchAt mock", async () => {
        const date = new Date("2026-02-01T00:00:00Z");
        vi.mocked(getLaunchAt).mockResolvedValue(date);

        await getCachedLaunchAt();
        _resetLaunchAtCacheForTests();

        // Mock is still configured
        const result = await getCachedLaunchAt();
        expect(result).toBe(date);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(2);
      });
    });

    describe("TTL constant verification", () => {
      it("respects 60 second TTL (no less)", async () => {
        const date1 = new Date("2026-02-01T00:00:00Z");
        const date2 = new Date("2026-02-02T00:00:00Z");

        vi.mocked(getLaunchAt)
          .mockResolvedValueOnce(date1)
          .mockResolvedValueOnce(date2);

        await getCachedLaunchAt();

        // Advance 59999ms (just under 60s)
        vi.advanceTimersByTime(59999);
        let result = await getCachedLaunchAt();
        expect(result).toBe(date1); // Should still be cached
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);

        // Advance 1ms more to reach 60s
        vi.advanceTimersByTime(1);
        result = await getCachedLaunchAt();
        expect(result).toBe(date2); // Should refetch
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(2);
      });
    });

    describe("real-world scenarios", () => {
      it("simulates a proxy request pattern: fetch once, reuse within TTL", async () => {
        const launchDate = new Date("2026-02-15T10:00:00Z");
        vi.mocked(getLaunchAt).mockResolvedValue(launchDate);

        // Request 1 at time 0
        const result1 = await getCachedLaunchAt();
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);

        // Requests 2-5 at different times within TTL
        vi.advanceTimersByTime(15000); // +15s
        const result2 = await getCachedLaunchAt();

        vi.advanceTimersByTime(15000); // +30s total
        const result3 = await getCachedLaunchAt();

        vi.advanceTimersByTime(20000); // +50s total
        const result4 = await getCachedLaunchAt();

        // All should be the same, only 1 fetch
        expect(result1).toBe(launchDate);
        expect(result2).toBe(launchDate);
        expect(result3).toBe(launchDate);
        expect(result4).toBe(launchDate);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(1);

        // Request at 61s triggers refetch
        vi.advanceTimersByTime(11000); // +61s total
        const result5 = await getCachedLaunchAt();
        expect(result5).toBe(launchDate);
        expect(vi.mocked(getLaunchAt)).toHaveBeenCalledTimes(2);
      });

      it("simulates value changing between TTL windows", async () => {
        const date1 = new Date("2026-02-01T00:00:00Z");
        const date2 = new Date("2026-03-01T00:00:00Z");

        vi.mocked(getLaunchAt)
          .mockResolvedValueOnce(date1)
          .mockResolvedValueOnce(date2);

        // Initial launch date
        let result = await getCachedLaunchAt();
        expect(result).toBe(date1);

        // Admin updates the launch date during TTL window
        // (but we won't see it until TTL expires)
        vi.advanceTimersByTime(30000);
        result = await getCachedLaunchAt();
        expect(result).toBe(date1); // Still old value

        // TTL expires
        vi.advanceTimersByTime(31000);
        result = await getCachedLaunchAt();
        expect(result).toBe(date2); // New value loaded
      });
    });
  });
});
