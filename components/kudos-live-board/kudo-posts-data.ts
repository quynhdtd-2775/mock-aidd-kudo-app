import type { HeroBadgeVariant } from "./kudo-hero-badge";

// mm:2940:13482 "C.2_Danh sách lời cảm ơn" — card view-model for the ALL
// KUDOS feed. Originally shipped with verbatim Figma mock rows; those were
// removed once live-board-all-kudos.tsx switched to real Supabase data
// (lib/kudos/kudos-feed-queries.ts → kudo-feed-mapper.ts).
export interface KudoPostData {
  id: string;
  senderName: string;
  senderHeroCode: string;
  senderBadge: HeroBadgeVariant;
  receiverName: string;
  receiverHeroCode: string;
  receiverBadge: HeroBadgeVariant;
  time: string;
  hashtagTitle: string;
  message: string;
  attachmentCount: number;
  hashtags: string;
  heartsCount: string;
  /** Sanitized HTML for the message body — real feed rows only. When
   * present, kudo-post-card.tsx renders this instead of the plain `message`
   * text. Mock rows omit it and keep the plain-text branch. */
  messageHtml?: string;
  /** Real avatar URLs from `profiles` — real feed rows only. Falls back to
   * the design's default avatar asset when absent. */
  senderAvatarSrc?: string;
  receiverAvatarSrc?: string;
  /** Real uploaded attachment URLs — real feed rows only. When present,
   * kudo-post-card.tsx renders these instead of the `attachmentCount`
   * placeholder loop. */
  imageUrls?: string[];
}
