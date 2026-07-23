import { describe, it, expect, vi } from "vitest";
import { scrollToAwardSection, type ElementResolver } from "./scroll-to-award-section";

describe("scroll-to-award-section", () => {
  describe("missing target (test case ID-13)", () => {
    it("returns early without throwing when resolver returns null", () => {
      const nullResolver: ElementResolver = () => null;

      expect(() => {
        scrollToAwardSection("#top-talent", nullResolver);
      }).not.toThrow();
    });

    it("does not call scrollIntoView when resolver returns null", () => {
      const mockScrollIntoView = vi.fn();
      const nullResolver: ElementResolver = () => null;

      scrollToAwardSection("#top-talent", nullResolver);

      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe("happy path", () => {
    it("calls scrollIntoView with smooth behavior and start block", () => {
      const mockScrollIntoView = vi.fn();
      const mockResolver: ElementResolver = () => ({
        scrollIntoView: mockScrollIntoView,
      });

      scrollToAwardSection("#top-talent", mockResolver);

      expect(mockScrollIntoView).toHaveBeenCalledOnce();
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
    });

    it("strips the leading hash (#) before passing id to resolver", () => {
      const mockResolver = vi.fn<ElementResolver>(
        () => ({
          scrollIntoView: vi.fn(),
        })
      );

      scrollToAwardSection("#top-talent", mockResolver);

      expect(mockResolver).toHaveBeenCalledWith("top-talent");
    });

    it("resolves correctly when href has no leading hash", () => {
      const mockResolver = vi.fn<ElementResolver>(
        () => ({
          scrollIntoView: vi.fn(),
        })
      );

      scrollToAwardSection("top-talent", mockResolver);

      expect(mockResolver).toHaveBeenCalledWith("top-talent");
    });
  });

  describe("anchor id handling", () => {
    it("handles multiple hashes (only strips leading #)", () => {
      const mockResolver = vi.fn<ElementResolver>(
        () => ({
          scrollIntoView: vi.fn(),
        })
      );

      scrollToAwardSection("#section#inner", mockResolver);

      expect(mockResolver).toHaveBeenCalledWith("section#inner");
    });

    it("handles ids with special characters after stripping hash", () => {
      const mockResolver = vi.fn<ElementResolver>(
        () => ({
          scrollIntoView: vi.fn(),
        })
      );

      scrollToAwardSection("#best-new-hire-2024", mockResolver);

      expect(mockResolver).toHaveBeenCalledWith("best-new-hire-2024");
    });
  });
});
