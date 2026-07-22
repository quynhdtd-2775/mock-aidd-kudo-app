import type { HeroBadgeVariant } from "@/components/kudos-live-board/kudo-hero-badge";

// Shapes shared by lib/kudos/** and app/kudos-live-board/actions.ts.
//
// Server actions return typed error CODES here, not translated strings —
// the UI layer (Track A, components/kudos/write-kudo/**) owns all
// user-facing copy/i18n and maps these codes to localized messages. Keeps
// this module i18n-agnostic and avoids touching messages/*.json from here.

export interface ProfileSuggestion {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface CreateKudoInput {
  receiverId: string;
  /** Required "Danh hiệu" — stored as kudos.hashtag_title. */
  awardTitle: string;
  /** Raw HTML from the Tiptap editor — sanitized server-side before storage. */
  message: string;
  hashtags: string[];
  isAnonymous: boolean;
  anonymousName?: string;
  images: File[];
}

export type CreateKudoErrorCode =
  | "receiver_required"
  | "receiver_not_found"
  | "award_title_required"
  | "message_required"
  | "hashtags_count"
  | "invalid_hashtag"
  | "too_many_images"
  | "invalid_image_type"
  | "image_too_large"
  | "upload_failed"
  | "insert_failed";

export interface CreateKudoFieldErrors {
  receiverId?: CreateKudoErrorCode;
  awardTitle?: CreateKudoErrorCode;
  message?: CreateKudoErrorCode;
  hashtags?: CreateKudoErrorCode;
  images?: CreateKudoErrorCode;
}

export type CreateKudoResult =
  | { ok: true }
  | { ok: false; error: CreateKudoErrorCode; fieldErrors?: CreateKudoFieldErrors };

// --- ALL KUDOS feed (lib/kudos/kudos-feed-queries.ts + kudo-feed-mapper.ts) ---

/** Sender/receiver profile fields joined onto a kudos row for the feed. */
export interface KudoFeedProfile {
  displayName: string;
  heroCode: string;
  heroBadge: HeroBadgeVariant;
  avatarUrl: string | null;
}

/** Raw DB shape returned by getAllKudos(), before pure mapping to KudoPostData. */
export interface KudoFeedItem {
  id: string;
  hashtagTitle: string;
  message: string;
  attachmentCount: number;
  hashtags: string;
  heartsCount: number;
  imageUrls: string[];
  isAnonymous: boolean;
  anonymousName: string | null;
  createdAt: string;
  sender: KudoFeedProfile | null;
  receiver: KudoFeedProfile | null;
}
