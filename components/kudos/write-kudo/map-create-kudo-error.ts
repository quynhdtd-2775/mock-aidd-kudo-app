// Maps a `CreateKudoErrorCode` (from app/kudos-live-board/actions.ts) to a
// localized message key under the `WriteKudo` i18n namespace. Pure/testable —
// the caller supplies the translator (next-intl's `t`) so this stays
// framework-agnostic.

import type { CreateKudoErrorCode } from "@/lib/kudos/kudos-types";

const ERROR_MESSAGE_KEY: Record<CreateKudoErrorCode, string> = {
  receiver_required: "errorReceiverRequired",
  receiver_not_found: "errorReceiverNotFound",
  award_title_required: "errorAwardTitleRequired",
  message_required: "errorMessageRequired",
  hashtags_count: "errorHashtagsCount",
  invalid_hashtag: "errorInvalidHashtag",
  too_many_images: "errorTooManyImages",
  invalid_image_type: "errorInvalidImageType",
  image_too_large: "errorImageTooLarge",
  upload_failed: "errorUploadFailed",
  insert_failed: "errorInsertFailed",
};

export function mapCreateKudoErrorCode(code: CreateKudoErrorCode, t: (key: string) => string): string {
  return t(ERROR_MESSAGE_KEY[code]);
}
