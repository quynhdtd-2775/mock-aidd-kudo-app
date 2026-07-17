// mm:520:11647 — shared type/constant definitions for the write-kudo modal.
// Integration (phase-04) replaced the static mock recipient/image data with
// live queries (searchProfilesAction) and real uploaded Files — see
// use-write-kudo-form.ts.

export interface RecipientOption {
  id: string;
  name: string;
}

export interface UploadedImage {
  id: string;
  /** Object URL (blob:) for a pending upload preview, or a remote URL. */
  src: string;
  alt: string;
}

export const MAX_HASHTAGS = 5;
export const MAX_IMAGES = 5;
