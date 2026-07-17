import { describe, it, expect } from "vitest";
import { computeCountdown, pad2, type CountdownParts } from "./countdown-math";

describe("countdown-math", () => {
  describe("pad2", () => {
    it("pads single digits to 2 characters with leading zero", () => {
      expect(pad2(0)).toBe("00");
      expect(pad2(1)).toBe("01");
      expect(pad2(5)).toBe("05");
      expect(pad2(9)).toBe("09");
    });

    it("leaves 2-digit numbers unchanged", () => {
      expect(pad2(10)).toBe("10");
      expect(pad2(23)).toBe("23");
      expect(pad2(59)).toBe("59");
      expect(pad2(99)).toBe("99");
    });

    it("handles numbers > 99", () => {
      expect(pad2(100)).toBe("100");
      expect(pad2(999)).toBe("999");
    });
  });

  describe("computeCountdown", () => {
    const baseDate = new Date("2026-01-01T00:00:00Z");

    describe("countdown complete (remainingMs <= 0)", () => {
      it("returns all 00 with isComplete true when launch is exactly now", () => {
        const launch = new Date("2026-01-01T00:00:00Z");
        const now = new Date("2026-01-01T00:00:00Z");
        const result = computeCountdown(launch, now);

        expect(result).toEqual({
          days: "00",
          hours: "00",
          minutes: "00",
          isComplete: true,
        });
      });

      it("returns all 00 with isComplete true when launch is in the past", () => {
        const launch = new Date("2025-12-31T23:59:59Z");
        const now = new Date("2026-01-01T00:00:00Z");
        const result = computeCountdown(launch, now);

        expect(result).toEqual({
          days: "00",
          hours: "00",
          minutes: "00",
          isComplete: true,
        });
      });

      it("returns all 00 with isComplete true for far-past launches", () => {
        const launch = new Date("2020-01-01T00:00:00Z");
        const now = new Date("2026-01-01T00:00:00Z");
        const result = computeCountdown(launch, now);

        expect(result).toEqual({
          days: "00",
          hours: "00",
          minutes: "00",
          isComplete: true,
        });
      });
    });

    describe("days boundary cases", () => {
      it("displays 0 days when less than 1 day remains", () => {
        // 23 hours 59 minutes 59 seconds = 86399000 ms
        const launch = new Date(baseDate.getTime() + 86399000);
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toBe("00");
        expect(result.isComplete).toBe(false);
      });

      it("displays 1 day when exactly 1 day remains", () => {
        const launch = new Date(baseDate.getTime() + 86400000); // 1 day = 86400000 ms
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toBe("01");
        expect(result.hours).toBe("00");
        expect(result.minutes).toBe("00");
      });

      it("displays 9 days correctly", () => {
        // 9 days = 9 * 86400000
        const launch = new Date(baseDate.getTime() + 9 * 86400000);
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toBe("09");
      });

      it("displays 10 days correctly", () => {
        // 10 days = 10 * 86400000
        const launch = new Date(baseDate.getTime() + 10 * 86400000);
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toBe("10");
      });

      it("displays 31 days correctly", () => {
        const launch = new Date(baseDate.getTime() + 31 * 86400000);
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toBe("31");
      });

      it("displays 99 days when exactly 99 days remain", () => {
        const launch = new Date(baseDate.getTime() + 99 * 86400000);
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toBe("99");
      });

      it("clamps to 99 days when more than 99 days remain", () => {
        // 100 days should clamp to 99
        const launch = new Date(baseDate.getTime() + 100 * 86400000);
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toBe("99");
      });

      it("clamps to 99 days for far-future dates (365 days)", () => {
        const launch = new Date(baseDate.getTime() + 365 * 86400000);
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toBe("99");
      });
    });

    describe("hours boundary cases", () => {
      it("displays 00 hours for 0 hours remaining", () => {
        const launch = new Date(baseDate.getTime() + 30 * 60000); // 30 minutes
        const result = computeCountdown(launch, baseDate);

        expect(result.hours).toBe("00");
      });

      it("displays 12 hours correctly", () => {
        // 12 hours = 12 * 3600000 ms
        const launch = new Date(baseDate.getTime() + 12 * 3600000);
        const result = computeCountdown(launch, baseDate);

        expect(result.hours).toBe("12");
      });

      it("displays 23 hours correctly (max single day)", () => {
        const launch = new Date(baseDate.getTime() + 23 * 3600000);
        const result = computeCountdown(launch, baseDate);

        expect(result.hours).toBe("23");
      });

      it("wraps hours to 0 at 24 hour boundary", () => {
        // Exactly 1 day = 24 hours
        const launch = new Date(baseDate.getTime() + 86400000);
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toBe("01");
        expect(result.hours).toBe("00");
      });

      it("wraps hours to 1 at 25 hour boundary", () => {
        // 1 day + 1 hour
        const launch = new Date(baseDate.getTime() + 86400000 + 3600000);
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toBe("01");
        expect(result.hours).toBe("01");
      });

      it("handles 1 day 23 hours correctly", () => {
        const launch = new Date(baseDate.getTime() + 86400000 + 23 * 3600000);
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toBe("01");
        expect(result.hours).toBe("23");
      });
    });

    describe("minutes boundary cases", () => {
      it("displays 00 minutes for 0 minutes remaining", () => {
        const launch = new Date(baseDate.getTime() + 30000); // 30 seconds
        const result = computeCountdown(launch, baseDate);

        expect(result.minutes).toBe("00");
      });

      it("displays 30 minutes correctly", () => {
        // 30 minutes = 30 * 60000 ms
        const launch = new Date(baseDate.getTime() + 30 * 60000);
        const result = computeCountdown(launch, baseDate);

        expect(result.minutes).toBe("30");
      });

      it("displays 59 minutes correctly (max single hour)", () => {
        const launch = new Date(baseDate.getTime() + 59 * 60000);
        const result = computeCountdown(launch, baseDate);

        expect(result.minutes).toBe("59");
      });

      it("wraps minutes to 0 at 60 minute boundary", () => {
        // Exactly 1 hour = 3600000 ms
        const launch = new Date(baseDate.getTime() + 3600000);
        const result = computeCountdown(launch, baseDate);

        expect(result.hours).toBe("01");
        expect(result.minutes).toBe("00");
      });

      it("wraps minutes to 1 at 61 minute boundary", () => {
        // 1 hour + 1 minute
        const launch = new Date(baseDate.getTime() + 3600000 + 60000);
        const result = computeCountdown(launch, baseDate);

        expect(result.hours).toBe("01");
        expect(result.minutes).toBe("01");
      });

      it("handles complex minute scenarios: 1 day 2 hours 30 minutes", () => {
        const launch = new Date(
          baseDate.getTime() + 86400000 + 2 * 3600000 + 30 * 60000
        );
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toBe("01");
        expect(result.hours).toBe("02");
        expect(result.minutes).toBe("30");
      });
    });

    describe("zero-padding verification", () => {
      it("pads single-digit days with leading zero", () => {
        const launch = new Date(baseDate.getTime() + 5 * 86400000);
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toBe("05");
        expect(result.days).toMatch(/^\d{2}$/);
      });

      it("pads single-digit hours with leading zero", () => {
        const launch = new Date(baseDate.getTime() + 7 * 3600000);
        const result = computeCountdown(launch, baseDate);

        expect(result.hours).toBe("07");
        expect(result.hours).toMatch(/^\d{2}$/);
      });

      it("pads single-digit minutes with leading zero", () => {
        const launch = new Date(baseDate.getTime() + 3 * 60000);
        const result = computeCountdown(launch, baseDate);

        expect(result.minutes).toBe("03");
        expect(result.minutes).toMatch(/^\d{2}$/);
      });

      it("all parts are always exactly 2 digits", () => {
        const launch = new Date(baseDate.getTime() + 99 * 86400000 + 23 * 3600000 + 59 * 60000);
        const result = computeCountdown(launch, baseDate);

        expect(result.days).toMatch(/^\d{2}$/);
        expect(result.hours).toMatch(/^\d{2}$/);
        expect(result.minutes).toMatch(/^\d{2}$/);
      });
    });

    describe("edge cases and integration", () => {
      it("handles 1 millisecond remaining (not yet complete)", () => {
        const launch = new Date(baseDate.getTime() + 1);
        const result = computeCountdown(launch, baseDate);

        expect(result.isComplete).toBe(false);
        expect(result.days).toBe("00");
        expect(result.hours).toBe("00");
        expect(result.minutes).toBe("00");
      });

      it("handles leap year dates correctly", () => {
        const leapDate = new Date("2024-02-29T00:00:00Z");
        const launch = new Date("2024-03-01T00:00:00Z");
        const result = computeCountdown(launch, leapDate);

        expect(result.days).toBe("01");
        expect(result.hours).toBe("00");
        expect(result.minutes).toBe("00");
      });

      it("handles year boundary crossing", () => {
        const now = new Date("2025-12-31T23:59:59Z");
        const launch = new Date("2026-01-01T00:00:01Z");
        const result = computeCountdown(launch, now);

        expect(result.isComplete).toBe(false);
        expect(result.days).toBe("00");
        expect(result.hours).toBe("00");
        expect(result.minutes).toBe("00");
      });

      it("differentiates between seconds/milliseconds (returns minutes)", () => {
        const now = new Date("2026-01-01T00:00:00Z");
        // 1 minute 30 seconds
        const launch = new Date(now.getTime() + 90000);
        const result = computeCountdown(launch, now);

        expect(result.minutes).toBe("01");
      });

      it("properly computes large countdown to 99 days edge", () => {
        const now = new Date("2026-01-01T00:00:00Z");
        // 99 days 23 hours 59 minutes
        const launch = new Date(
          now.getTime() + 99 * 86400000 + 23 * 3600000 + 59 * 60000
        );
        const result = computeCountdown(launch, now);

        expect(result.days).toBe("99");
        expect(result.hours).toBe("23");
        expect(result.minutes).toBe("59");
        expect(result.isComplete).toBe(false);
      });

      it("clamps days to 99 but preserves hours and minutes for 100+ days", () => {
        const now = new Date("2026-01-01T00:00:00Z");
        // 100 days 12 hours 30 minutes
        const launch = new Date(
          now.getTime() + 100 * 86400000 + 12 * 3600000 + 30 * 60000
        );
        const result = computeCountdown(launch, now);

        expect(result.days).toBe("99");
        // Should still show actual hours/minutes
        expect(result.hours).toBe("12");
        expect(result.minutes).toBe("30");
      });
    });

    describe("never drifts on repeated calls", () => {
      it("returns same value on repeated calls with same inputs", () => {
        const launch = new Date("2026-02-01T12:30:45Z");
        const now = new Date("2026-01-01T10:00:00Z");

        const result1 = computeCountdown(launch, now);
        const result2 = computeCountdown(launch, now);
        const result3 = computeCountdown(launch, now);

        expect(result1).toEqual(result2);
        expect(result2).toEqual(result3);
      });

      it("computes correctly with same precise inputs", () => {
        const launch = new Date("2026-02-01T00:00:00Z");
        const now = new Date("2026-01-01T00:00:00Z");

        const result1 = computeCountdown(launch, now);
        const result2 = computeCountdown(launch, now);

        // Same inputs always produce same outputs
        expect(result1).toEqual(result2);
      });
    });
  });
});
