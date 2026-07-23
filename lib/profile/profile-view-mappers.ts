import type { ProfileHeroSectionProps } from "@/components/profile/profile-hero-section";
import type { ProfileKudoPostData } from "@/components/profile/profile-kudo-posts-data";
import { formatCount, formatKudoTime } from "@/lib/format/kudo-display-format";
import type {
  HeroBadge,
  IconCollectionItem,
  ProfileData,
  ProfileStats,
  ReceivedKudo,
} from "./profile-types";

// Maps phase-02 query results onto the Track A component props. Pure
// functions, no data fetching — keeps app/profile/page.tsx small.
// formatCount/formatKudoTime live in lib/format/kudo-display-format.ts so
// lib/kudos/kudo-feed-mapper.ts (kudos-live-board feed) can reuse them.

const HERO_BADGE_LABELS: Record<HeroBadge, string> = {
  new: "New Hero",
  rising: "Rising Hero",
  legend: "Legend Hero",
  super: "Super Hero",
};

/** Locale-dependent UI labels — resolved by the caller (next-intl). */
export interface ProfileHeroLabels {
  collectionLinkLabel: string;
  openBoxButtonLabel: string;
}

export function toProfileHeroProps(
  profile: ProfileData,
  stats: ProfileStats,
  icons: IconCollectionItem[],
  labels: ProfileHeroLabels,
): ProfileHeroSectionProps {
  return {
    info: {
      name: profile.displayName,
      department: profile.heroCode,
      legendLabel: HERO_BADGE_LABELS[profile.heroBadge],
      avatarSrc: profile.avatarUrl ?? undefined,
    },
    badges: {
      icons: icons.map(({ id, unlocked }) => ({ id, unlocked })),
      collectionLinkLabel: labels.collectionLinkLabel,
    },
    stats: {
      kudosReceived: formatCount(stats.kudosReceived),
      kudosSent: formatCount(stats.kudosSent),
      heartsReceived: formatCount(stats.heartsReceived),
      secretBoxesOpened: formatCount(stats.boxesOpened),
      secretBoxesUnopened: formatCount(stats.boxesUnopened),
      openBoxButtonLabel: labels.openBoxButtonLabel,
    },
  };
}

export function toKudoPostCards(
  kudos: ReceivedKudo[],
  receiver: ProfileData,
): ProfileKudoPostData[] {
  return kudos.map((kudo) => ({
    id: kudo.id,
    isSpam: kudo.isSpam,
    senderName: kudo.senderName,
    senderHeroCode: kudo.senderHeroCode,
    senderBadge: kudo.senderBadge,
    senderAvatarSrc: kudo.senderAvatarUrl ?? undefined,
    receiverName: receiver.displayName,
    receiverHeroCode: receiver.heroCode,
    receiverBadge: receiver.heroBadge,
    receiverAvatarSrc: receiver.avatarUrl ?? undefined,
    time: formatKudoTime(kudo.createdAt),
    title: kudo.hashtagTitle || undefined,
    message: kudo.message,
    attachmentCount: kudo.attachmentCount,
    hashtags: kudo.hashtags,
    heartsCount: formatCount(kudo.heartsCount),
  }));
}
