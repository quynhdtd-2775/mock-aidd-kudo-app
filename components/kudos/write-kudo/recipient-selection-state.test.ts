import { describe, it, expect } from "vitest";
import { applyQueryChange, applySelection } from "./recipient-selection-state";
import type { RecipientOption } from "./write-kudo-mock-data";

describe("applyQueryChange", () => {
  it("sets the query and clears any previously selected id", () => {
    expect(applyQueryChange("jo")).toEqual({ query: "jo", selectedId: null });
  });

  it("clears the id even when the typed text still matches a resolved name", () => {
    // Regression guard for MAJOR-1: typing must never leave a stale id
    // attached, even if the text happens to still equal a valid option's name.
    const afterSelection = applySelection({ id: "profile-1", name: "John Doe" });
    expect(afterSelection.selectedId).toBe("profile-1");

    const afterRetype = applyQueryChange(afterSelection.query);
    expect(afterRetype).toEqual({ query: "John Doe", selectedId: null });
  });
});

describe("applySelection", () => {
  it("stores the option's id alongside its display name directly", () => {
    const option: RecipientOption = { id: "profile-42", name: "John Doe" };
    expect(applySelection(option)).toEqual({ query: "John Doe", selectedId: "profile-42" });
  });

  it("two different profiles sharing the same display name resolve to distinct ids", () => {
    // profiles.display_name has no uniqueness constraint — selection must
    // never be re-derived from the (possibly ambiguous) display name.
    const first = applySelection({ id: "id-a", name: "Same Name" });
    const second = applySelection({ id: "id-b", name: "Same Name" });

    expect(first.query).toBe(second.query);
    expect(first.selectedId).not.toBe(second.selectedId);
    expect(first.selectedId).toBe("id-a");
    expect(second.selectedId).toBe("id-b");
  });
});
