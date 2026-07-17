import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  KUDOS_IMAGES_BUCKET,
  removeKudoImages,
  uploadKudoImages,
  validateImages,
} from "./upload-kudo-images";

const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function makeFile(name: string, type: string, sizeBytes: number, magic: number[] = []): File {
  const content = new Uint8Array(sizeBytes);
  magic.forEach((byte, index) => {
    content[index] = byte;
  });
  return new File([content], name, { type });
}

// Real magic bytes by default, matching the declared type — most tests care
// about validateImages/upload plumbing, not the sniffing itself, so these
// should pass the new content check unless a test explicitly wants a mismatch.
const JPG_1KB = () => makeFile("photo.jpg", "image/jpeg", 1024, JPEG_MAGIC);
const PNG_1KB = () => makeFile("photo.png", "image/png", 1024, PNG_MAGIC);

describe("validateImages", () => {
  it("returns null (no error) for an empty array", () => {
    expect(validateImages([])).toBeNull();
  });

  it("returns null for up to 5 valid jpg/png images", () => {
    const images = Array.from({ length: 5 }, () => JPG_1KB());
    expect(validateImages(images)).toBeNull();
  });

  it("returns 'too_many_images' for more than 5 images", () => {
    const images = Array.from({ length: 6 }, () => JPG_1KB());
    expect(validateImages(images)).toBe("too_many_images");
  });

  it("returns 'invalid_image_type' for a non-jpg/png file", () => {
    const images = [makeFile("doc.pdf", "application/pdf", 1024)];
    expect(validateImages(images)).toBe("invalid_image_type");
  });

  it("returns 'invalid_image_type' for a gif image", () => {
    const images = [makeFile("anim.gif", "image/gif", 1024)];
    expect(validateImages(images)).toBe("invalid_image_type");
  });

  it("returns 'image_too_large' for a file over 5MB", () => {
    const images = [makeFile("big.jpg", "image/jpeg", 5 * 1024 * 1024 + 1)];
    expect(validateImages(images)).toBe("image_too_large");
  });

  it("accepts a file exactly at the 5MB cap", () => {
    const images = [makeFile("edge.jpg", "image/jpeg", 5 * 1024 * 1024)];
    expect(validateImages(images)).toBeNull();
  });

  it("accepts png alongside jpg in the same batch", () => {
    expect(validateImages([JPG_1KB(), PNG_1KB()])).toBeNull();
  });
});

function buildStorageClient() {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const getPublicUrl = vi.fn((path: string) => ({
    data: { publicUrl: `https://cdn.example.com/${path}` },
  }));
  const remove = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn().mockReturnValue({ upload, getPublicUrl, remove });
  const client = { storage: { from } };
  return { client, from, upload, getPublicUrl, remove };
}

describe("uploadKudoImages", () => {
  const senderId = "sender-1";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ok with empty urls/paths when no images are given", async () => {
    const { client } = buildStorageClient();
    const result = await uploadKudoImages(client as never, senderId, []);
    expect(result).toEqual({ ok: true, urls: [], paths: [] });
  });

  it("returns the validation error without uploading when images fail validation", async () => {
    const { client, upload } = buildStorageClient();
    const images = Array.from({ length: 6 }, () => JPG_1KB());
    const result = await uploadKudoImages(client as never, senderId, images);
    expect(result).toEqual({ ok: false, error: "too_many_images" });
    expect(upload).not.toHaveBeenCalled();
  });

  it("uploads each image under {senderId}/{uuid}.{ext} (satisfying the storage RLS uid-folder check) and returns public URLs", async () => {
    const { client, from, upload } = buildStorageClient();
    const images = [JPG_1KB(), PNG_1KB()];

    const result = await uploadKudoImages(client as never, senderId, images);

    expect(from).toHaveBeenCalledWith(KUDOS_IMAGES_BUCKET);
    expect(upload).toHaveBeenCalledTimes(2);
    expect(upload.mock.calls[0][0]).toMatch(new RegExp(`^${senderId}/.+\\.jpg$`));
    expect(upload.mock.calls[1][0]).toMatch(new RegExp(`^${senderId}/.+\\.png$`));
    // contentType is set from the sniffed magic bytes, not the client-declared file.type.
    expect(upload.mock.calls[0][2]).toMatchObject({ contentType: "image/jpeg" });
    expect(upload.mock.calls[1][2]).toMatchObject({ contentType: "image/png" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.urls).toHaveLength(2);
      expect(result.urls[0]).toContain("https://cdn.example.com/");
      expect(result.paths).toHaveLength(2);
    }
  });

  it("cleans up already-uploaded images and returns 'upload_failed' on partial failure", async () => {
    const upload = vi
      .fn()
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: new Error("storage full") });
    const getPublicUrl = vi.fn((path: string) => ({
      data: { publicUrl: `https://cdn.example.com/${path}` },
    }));
    const remove = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ upload, getPublicUrl, remove });
    const client = { storage: { from } };

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const images = [JPG_1KB(), PNG_1KB()];
    const result = await uploadKudoImages(client as never, senderId, images);

    expect(result).toEqual({ ok: false, error: "upload_failed" });
    // Only the first (successful) upload's path should be cleaned up.
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove.mock.calls[0][0]).toHaveLength(1);

    consoleErrorSpy.mockRestore();
  });

  it("returns 'invalid_image_type' when a file's content doesn't match its declared type (magic-byte sniff, MAJOR-2)", async () => {
    const { client, upload } = buildStorageClient();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Declared as image/jpeg via file.type, but the actual bytes are plain
    // zeros — must not be trusted just because the client says so.
    const fakeJpeg = makeFile("fake.jpg", "image/jpeg", 1024);
    const result = await uploadKudoImages(client as never, senderId, [fakeJpeg]);

    expect(result).toEqual({ ok: false, error: "invalid_image_type" });
    expect(upload).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("cleans up already-uploaded images when a later file fails the magic-byte sniff", async () => {
    const { client, upload, remove } = buildStorageClient();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const goodJpeg = JPG_1KB();
    const fakePng = makeFile("fake.png", "image/png", 1024); // no PNG magic bytes
    const result = await uploadKudoImages(client as never, senderId, [goodJpeg, fakePng]);

    expect(result).toEqual({ ok: false, error: "invalid_image_type" });
    expect(upload).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove.mock.calls[0][0]).toHaveLength(1);

    consoleErrorSpy.mockRestore();
  });
});

describe("removeKudoImages", () => {
  it("does nothing when paths is empty", async () => {
    const { client, from } = buildStorageClient();
    await removeKudoImages(client as never, []);
    expect(from).not.toHaveBeenCalled();
  });

  it("calls storage.remove with the given paths", async () => {
    const { client, remove } = buildStorageClient();
    await removeKudoImages(client as never, ["a/1.jpg", "a/2.png"]);
    expect(remove).toHaveBeenCalledWith(["a/1.jpg", "a/2.png"]);
  });

  it("swallows storage errors instead of throwing", async () => {
    const remove = vi.fn().mockRejectedValue(new Error("network error"));
    const from = vi.fn().mockReturnValue({ remove });
    const client = { storage: { from } };
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(removeKudoImages(client as never, ["a/1.jpg"])).resolves.toBeUndefined();

    consoleErrorSpy.mockRestore();
  });
});
