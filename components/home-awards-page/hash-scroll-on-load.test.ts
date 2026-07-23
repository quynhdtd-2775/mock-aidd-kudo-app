import { describe, it, expect, vi } from "vitest";
import { readHashOnLoad } from "./hash-scroll-on-load";

describe("readHashOnLoad", () => {
  it("calls scroll with the hash when a hash is present", () => {
    const scroll = vi.fn();
    const getHash = () => "#top-talent";

    readHashOnLoad(getHash, scroll);

    expect(scroll).toHaveBeenCalledOnce();
    expect(scroll).toHaveBeenCalledWith("#top-talent");
  });

  it("does not call scroll when the hash is an empty string", () => {
    const scroll = vi.fn();
    const getHash = () => "";

    readHashOnLoad(getHash, scroll);

    expect(scroll).not.toHaveBeenCalled();
  });

  it("does not call scroll when the hash is missing/falsy (test case ID-62)", () => {
    const scroll = vi.fn();
    // Simulates window.location.hash resolving to a falsy value.
    const getHash = (() => undefined as unknown as string) as () => string;

    readHashOnLoad(getHash, scroll);

    expect(scroll).not.toHaveBeenCalled();
  });

  it("does not throw when the injected getHash resolver returns null", () => {
    const scroll = vi.fn();
    const getHash = (() => null as unknown as string) as () => string;

    expect(() => {
      readHashOnLoad(getHash, scroll);
    }).not.toThrow();
    expect(scroll).not.toHaveBeenCalled();
  });
});
