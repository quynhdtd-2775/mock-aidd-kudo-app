import { describe, expect, it } from "vitest";
import { shouldRedirectAtZero } from "./use-countdown";

describe("shouldRedirectAtZero", () => {
  it("redirects once when complete and redirectOnZero is on (prelaunch)", () => {
    expect(shouldRedirectAtZero(true, true, false)).toBe(true);
  });

  it("never redirects when redirectOnZero is off (homepage opt-out)", () => {
    expect(shouldRedirectAtZero(true, false, false)).toBe(false);
  });

  it("does not redirect before the countdown completes", () => {
    expect(shouldRedirectAtZero(false, true, false)).toBe(false);
  });

  it("does not redirect a second time after it already fired", () => {
    expect(shouldRedirectAtZero(true, true, true)).toBe(false);
  });
});
