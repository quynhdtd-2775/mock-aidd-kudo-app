import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateKudoErrorCode } from "./kudos-types";

export const KUDOS_IMAGES_BUCKET = "kudos-images";

const MAX_IMAGES = 5;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

type SniffableImageType = "image/jpeg" | "image/png";

// Magic-byte signatures, checked against the actual file content server-side
// before upload — `file.type` is a client-declared MIME label and cannot be
// trusted on its own (the bucket is public, so a mislabeled file would be
// hosted with an attacker-chosen content-type).
const MAGIC_BYTE_SIGNATURES: { type: SniffableImageType; bytes: number[] }[] = [
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];
const MAX_SIGNATURE_LENGTH = Math.max(...MAGIC_BYTE_SIGNATURES.map((s) => s.bytes.length));

/** Sync validation only — no network calls. Returns null when all images pass. */
export function validateImages(images: File[]): CreateKudoErrorCode | null {
  if (images.length > MAX_IMAGES) return "too_many_images";
  for (const file of images) {
    if (!(file.type in ALLOWED_EXTENSION_BY_TYPE)) return "invalid_image_type";
    if (file.size > MAX_SIZE_BYTES) return "image_too_large";
  }
  return null;
}

/**
 * Sniffs a file's real type from its leading bytes, ignoring the
 * client-declared `file.type`. Returns null when the content doesn't match
 * any allowed image signature.
 */
async function sniffImageType(file: File): Promise<SniffableImageType | null> {
  const header = new Uint8Array(await file.slice(0, MAX_SIGNATURE_LENGTH).arrayBuffer());
  for (const { type, bytes } of MAGIC_BYTE_SIGNATURES) {
    if (bytes.every((byte, index) => header[index] === byte)) return type;
  }
  return null;
}

export type UploadKudoImagesResult =
  | { ok: true; urls: string[]; paths: string[] }
  | { ok: false; error: CreateKudoErrorCode };

/**
 * Uploads validated images to the `kudos-images` bucket under
 * `{senderId}/{uuid}.{ext}` and returns their public URLs. On partial
 * failure, best-effort deletes whatever had already uploaded.
 */
export async function uploadKudoImages(
  supabase: SupabaseClient,
  senderId: string,
  images: File[],
): Promise<UploadKudoImagesResult> {
  const validationError = validateImages(images);
  if (validationError) return { ok: false, error: validationError };
  if (images.length === 0) return { ok: true, urls: [], paths: [] };

  const uploadedPaths: string[] = [];
  try {
    for (const file of images) {
      const sniffedType = await sniffImageType(file);
      if (!sniffedType) {
        console.error("uploadKudoImages: magic-byte sniff failed, rejecting", file.name);
        await removeKudoImages(supabase, uploadedPaths);
        return { ok: false, error: "invalid_image_type" };
      }
      const ext = ALLOWED_EXTENSION_BY_TYPE[sniffedType];
      // Path starts with the sender's own id — satisfies the storage RLS
      // insert policy's `(storage.foldername(name))[1] = auth.uid()::text`
      // check for the direct-API surface (see the write-kudos migration).
      const path = `${senderId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(KUDOS_IMAGES_BUCKET)
        .upload(path, file, { contentType: sniffedType, upsert: false });
      if (error) throw error;
      uploadedPaths.push(path);
    }
    const urls = uploadedPaths.map(
      (path) => supabase.storage.from(KUDOS_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl,
    );
    return { ok: true, urls, paths: uploadedPaths };
  } catch (err) {
    console.error("uploadKudoImages: upload failed", err);
    await removeKudoImages(supabase, uploadedPaths);
    return { ok: false, error: "upload_failed" };
  }
}

/** Best-effort cleanup — used both on upload failure and on later insert failure. */
export async function removeKudoImages(
  supabase: SupabaseClient,
  paths: string[],
): Promise<void> {
  if (paths.length === 0) return;
  try {
    await supabase.storage.from(KUDOS_IMAGES_BUCKET).remove(paths);
  } catch (err) {
    console.error("removeKudoImages: cleanup failed", err);
  }
}
