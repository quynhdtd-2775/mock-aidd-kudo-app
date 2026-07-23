import { describe, it, expect } from "vitest";
import { formatCount, formatKudoTime } from "./kudo-display-format";

describe("kudo-display-format", () => {
  describe("formatCount", () => {
    it("formats 0", () => {
      expect(formatCount(0)).toBe("0");
    });

    it("formats 1000 with vi-VN thousands separator", () => {
      expect(formatCount(1000)).toBe("1.000");
    });

    it("formats a large number with vi-VN thousands separators", () => {
      expect(formatCount(123456789)).toBe("123.456.789");
    });
  });

  describe("formatKudoTime", () => {
    it("converts a known UTC ISO timestamp to Asia/Ho_Chi_Minh time (UTC+7)", () => {
      // UTC 10:00 → 17:00 in Ho Chi Minh timezone.
      expect(formatKudoTime("2025-10-30T10:00:00Z")).toBe("17:00 - 10/30/2025");
    });

    it("is stable across timezone offsets regardless of host TZ", () => {
      expect(formatKudoTime("2025-10-30T10:00:03+07:00")).toBe("10:00 - 10/30/2025");
    });

    it("formats midnight-rollover timestamps correctly", () => {
      expect(formatKudoTime("2025-12-31T23:59:59Z")).toMatch(
        /^\d{2}:\d{2} - \d{2}\/\d{2}\/\d{4}$/,
      );
    });
  });
});
