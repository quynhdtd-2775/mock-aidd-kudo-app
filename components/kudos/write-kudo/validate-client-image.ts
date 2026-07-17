// Client-side pre-validation for the image picker — mirrors the server-side
// rules in lib/kudos/upload-kudo-images.ts (jpg/png only, 5MB cap, 5 images
// max) so the user gets immediate feedback before any network round-trip.
// The server still re-validates; this is UX only, never the source of truth.

export type ClientImageErrorCode = "too_many_images" | "invalid_image_type" | "image_too_large";

export const CLIENT_MAX_IMAGES = 5;
export const CLIENT_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png"]);

export interface ValidateClientImagesResult {
  accepted: File[];
  error: ClientImageErrorCode | null;
}

export function validateClientImages(
  existingCount: number,
  incoming: File[],
  maxImages: number = CLIENT_MAX_IMAGES,
): ValidateClientImagesResult {
  const accepted: File[] = [];
  let error: ClientImageErrorCode | null = null;

  for (const file of incoming) {
    if (existingCount + accepted.length >= maxImages) {
      error = "too_many_images";
      break;
    }
    if (!ACCEPTED_TYPES.has(file.type)) {
      error = "invalid_image_type";
      continue;
    }
    if (file.size > CLIENT_MAX_IMAGE_BYTES) {
      error = "image_too_large";
      continue;
    }
    accepted.push(file);
  }

  return { accepted, error };
}
