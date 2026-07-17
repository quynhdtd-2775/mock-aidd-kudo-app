import { describe, it, expect } from "vitest";
import { isLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE } from "./locale-config";

describe("locale-config", () => {
  describe("isLocale", () => {
    it("accepts 'vi' as a valid locale", () => {
      expect(isLocale("vi")).toBe(true);
    });

    it("accepts 'en' as a valid locale", () => {
      expect(isLocale("en")).toBe(true);
    });

    it("rejects unsupported strings like 'fr'", () => {
      expect(isLocale("fr")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(isLocale("")).toBe(false);
    });

    it("rejects path-traversal attempts like '../en'", () => {
      expect(isLocale("../en")).toBe(false);
    });

    it("rejects numbers", () => {
      expect(isLocale(123)).toBe(false);
      expect(isLocale(0)).toBe(false);
    });

    it("rejects null", () => {
      expect(isLocale(null)).toBe(false);
    });

    it("rejects undefined", () => {
      expect(isLocale(undefined)).toBe(false);
    });

    it("rejects objects", () => {
      expect(isLocale({})).toBe(false);
      expect(isLocale({ locale: "vi" })).toBe(false);
    });

    it("rejects arrays", () => {
      expect(isLocale(["vi"])).toBe(false);
    });

    it("rejects booleans", () => {
      expect(isLocale(true)).toBe(false);
      expect(isLocale(false)).toBe(false);
    });
  });

  describe("constants", () => {
    it("SUPPORTED_LOCALES contains exactly 'vi' and 'en'", () => {
      expect(SUPPORTED_LOCALES).toEqual(["vi", "en"]);
    });

    it("DEFAULT_LOCALE is set to 'vi'", () => {
      expect(DEFAULT_LOCALE).toBe("vi");
    });

    it("DEFAULT_LOCALE is one of the SUPPORTED_LOCALES", () => {
      expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
    });

    it("LOCALE_COOKIE is set correctly", () => {
      expect(LOCALE_COOKIE).toBe("NEXT_LOCALE");
    });
  });
});
