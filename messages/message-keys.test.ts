import { describe, it, expect } from "vitest";
import viMessages from "./vi.json";
import enMessages from "./en.json";

/**
 * Build a nested key structure (path representation) for easier comparison.
 * E.g., { a: { b: 1 } } → { 'a': true, 'a.b': true }
 */
function buildKeyMap(obj: unknown): Set<string> {
  const keys = new Set<string>();

  function traverse(value: unknown, prefix = "") {
    if (typeof value !== "object" || value === null) {
      return;
    }

    for (const [key, val] of Object.entries(value)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.add(fullKey);
      if (typeof val === "object" && val !== null) {
        traverse(val, fullKey);
      }
    }
  }

  traverse(obj);
  return keys;
}

describe("message catalogs", () => {
  describe("key-set parity (vi.json vs en.json)", () => {
    const viKeys = buildKeyMap(viMessages);
    const enKeys = buildKeyMap(enMessages);

    it("both catalogs have the same set of keys", () => {
      const viOnly = Array.from(viKeys).filter((k) => !enKeys.has(k));
      const enOnly = Array.from(enKeys).filter((k) => !viKeys.has(k));

      if (viOnly.length > 0 || enOnly.length > 0) {
        throw new Error(
          `Key mismatch:\n` +
            (viOnly.length > 0 ? `Only in vi.json: ${viOnly.join(", ")}\n` : "") +
            (enOnly.length > 0 ? `Only in en.json: ${enOnly.join(", ")}` : "")
        );
      }

      expect(viKeys).toEqual(enKeys);
    });

    it("vi.json has all required top-level namespaces", () => {
      const topLevel = new Set(
        Array.from(viKeys)
          .filter((k) => !k.includes("."))
      );
      expect(topLevel).toContain("Home");
      expect(topLevel).toContain("Header");
      expect(topLevel).toContain("Footer");
      expect(topLevel).toContain("UserMenu");
      expect(topLevel).toContain("Hero");
      expect(topLevel).toContain("Awards");
      expect(topLevel).toContain("SunKudos");
    });

    it("en.json has all required top-level namespaces", () => {
      const topLevel = new Set(
        Array.from(enKeys)
          .filter((k) => !k.includes("."))
      );
      expect(topLevel).toContain("Home");
      expect(topLevel).toContain("Header");
      expect(topLevel).toContain("Footer");
      expect(topLevel).toContain("UserMenu");
      expect(topLevel).toContain("Hero");
      expect(topLevel).toContain("Awards");
      expect(topLevel).toContain("SunKudos");
    });

    it("both catalogs have identical structure depth (no mismatched nesting)", () => {
      expect(viKeys.size).toBe(enKeys.size);
    });
  });

  describe("message catalog content integrity", () => {
    it("vi.json is valid JSON with expected structure", () => {
      expect(viMessages).toBeDefined();
      expect(typeof viMessages).toBe("object");
      expect(viMessages).not.toBeNull();
    });

    it("en.json is valid JSON with expected structure", () => {
      expect(enMessages).toBeDefined();
      expect(typeof enMessages).toBe("object");
      expect(enMessages).not.toBeNull();
    });

    it("each namespace in vi.json contains non-empty strings or objects", () => {
      for (const content of Object.values(viMessages)) {
        expect(content).toBeDefined();
        expect(typeof content).toBe("object");
        // Ensure at least some content exists
        if (typeof content === "object" && content !== null) {
          expect(Object.keys(content).length).toBeGreaterThan(0);
        }
      }
    });

    it("each namespace in en.json contains non-empty strings or objects", () => {
      for (const content of Object.values(enMessages)) {
        expect(content).toBeDefined();
        expect(typeof content).toBe("object");
        // Ensure at least some content exists
        if (typeof content === "object" && content !== null) {
          expect(Object.keys(content).length).toBeGreaterThan(0);
        }
      }
    });
  });
});
