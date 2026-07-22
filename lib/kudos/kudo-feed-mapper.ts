import { formatCount, formatKudoTime } from "@/lib/format/kudo-display-format";
import type { KudoPostData } from "@/components/kudos-live-board/kudo-posts-data";
import { sanitizeMessageHtml } from "./sanitize-message-html";
import type { KudoFeedItem } from "./kudos-types";

const ANONYMOUS_FALLBACK_NAME = "Ẩn danh";

/**
 * DB `hashtags` is comma-joined bare tags for modal-written rows
 * ("LiveTest,TeamWork") but legacy seed rows carry a single pre-formatted
 * string ("#Dedicated #Inspring…"). Normalize both to "#Tag #Tag" display.
 */
export function formatHashtagsDisplay(hashtags: string): string {
  return hashtags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ");
}

/**
 * Pure DB→card mapper for the /kudos-live-board ALL KUDOS feed. Runs
 * server-side only (called from the async live-board-all-kudos.tsx server
 * component) so anonymous rows never serialize the real sender identity to
 * the client — the joined `sender` profile is simply never read below when
 * `item.isAnonymous` is true.
 */
export function toKudoFeedCards(items: KudoFeedItem[]): KudoPostData[] {
  return items.map((item) => {
    const senderName = item.isAnonymous
      ? item.anonymousName?.trim() || ANONYMOUS_FALLBACK_NAME
      : (item.sender?.displayName ?? "");
    const senderHeroCode = item.isAnonymous ? "" : (item.sender?.heroCode ?? "");
    const senderBadge = item.isAnonymous ? "new" : (item.sender?.heroBadge ?? "new");
    const senderAvatarSrc = item.isAnonymous
      ? undefined
      : (item.sender?.avatarUrl ?? undefined);

    return {
      id: item.id,
      senderName,
      senderHeroCode,
      senderBadge,
      senderAvatarSrc,
      receiverName: item.receiver?.displayName ?? "",
      receiverHeroCode: item.receiver?.heroCode ?? "",
      receiverBadge: item.receiver?.heroBadge ?? "new",
      receiverAvatarSrc: item.receiver?.avatarUrl ?? undefined,
      time: formatKudoTime(item.createdAt),
      hashtagTitle: item.hashtagTitle,
      message: item.message,
      messageHtml: sanitizeMessageHtml(item.message),
      attachmentCount: item.attachmentCount,
      imageUrls: item.imageUrls,
      hashtags: formatHashtagsDisplay(item.hashtags),
      heartsCount: formatCount(item.heartsCount),
      heartsValue: item.heartsCount,
      heartsLiked: item.likedByMe,
      isOwnKudo: item.isOwnKudo,
    };
  });
}
