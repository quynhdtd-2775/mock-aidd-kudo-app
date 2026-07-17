// Typed shapes returned by lib/profile/profile-queries.ts and consumed by the
// /profile page. Field names align with the Track A component props.

/** Matches the UI HeroBadgeVariant union (components/kudos-live-board/kudo-hero-badge.tsx). */
export type HeroBadge = "new" | "rising" | "legend" | "super";

export interface ProfileData {
  id: string;
  displayName: string;
  heroCode: string;
  avatarUrl: string | null;
  heroBadge: HeroBadge;
  boxesOpened: number;
  boxesUnopened: number;
}

export interface ReceivedKudo {
  id: string;
  senderName: string;
  senderHeroCode: string;
  senderBadge: HeroBadge;
  senderAvatarUrl: string | null;
  hashtagTitle: string;
  message: string;
  attachmentCount: number;
  hashtags: string;
  heartsCount: number;
  isSpam: boolean;
  createdAt: string;
}

export interface ProfileStats {
  kudosReceived: number;
  kudosSent: number;
  heartsReceived: number;
  boxesOpened: number;
  boxesUnopened: number;
}

export interface IconCollectionItem {
  id: string;
  name: string;
  imageUrl: string;
  sortOrder: number;
  unlocked: boolean;
}
