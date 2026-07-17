import { describe, it, expect } from "vitest";
import { validateClientImages } from "./validate-client-image";

function makeFile(name: string, type: string, sizeBytes = 1024): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

describe("validateClientImages", () => {
  it("accepts all files when within type/size/count limits", () => {
    const files = [makeFile("a.jpg", "image/jpeg"), makeFile("b.png", "image/png")];
    const result = validateClientImages(0, files);
    expect(result.error).toBeNull();
    expect(result.accepted).toHaveLength(2);
  });

  it("rejects a disallowed mime type but keeps validating the rest", () => {
    const files = [makeFile("a.gif", "image/gif"), makeFile("b.jpg", "image/jpeg")];
    const result = validateClientImages(0, files);
    expect(result.error).toBe("invalid_image_type");
    expect(result.accepted).toHaveLength(1);
    expect(result.accepted[0].name).toBe("b.jpg");
  });

  it("rejects a file over the 5MB cap", () => {
    const files = [makeFile("big.jpg", "image/jpeg", 6 * 1024 * 1024)];
    const result = validateClientImages(0, files);
    expect(result.error).toBe("image_too_large");
    expect(result.accepted).toHaveLength(0);
  });

  it("stops accepting once existing + incoming reaches the max", () => {
    const files = [makeFile("a.jpg", "image/jpeg"), makeFile("b.jpg", "image/jpeg"), makeFile("c.jpg", "image/jpeg")];
    const result = validateClientImages(3, files, 5);
    expect(result.error).toBe("too_many_images");
    expect(result.accepted).toHaveLength(2);
  });

  it("returns no error and empty accepted list for empty input", () => {
    const result = validateClientImages(0, []);
    expect(result.error).toBeNull();
    expect(result.accepted).toHaveLength(0);
  });
});
