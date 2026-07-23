// TODO(api): TEMPORARY mock data source for the /profile screen — delete this
// file (and the MOCK_DATA early-returns in profile-queries.ts + MOCK_DATA in
// .env.local) once the backend is ready (`supabase start` + seeded DB).
// Enabled via MOCK_DATA=true in .env.local; never active in production.
//
// Values mirror supabase/seed.sql / the Figma design (MoMorph 3FoIx6ALVb) so
// the mock render matches what the seeded database will produce.
import type {
  IconCollectionItem,
  ProfileData,
  ProfileStats,
  ReceivedKudo,
} from "./profile-types";
import { DEMO_USER_ID } from "./current-user";

export function isMockProfileDataEnabled(): boolean {
  // ALLOW_MOCK_IN_PROD=true is the explicit opt-in for demo deployments
  // (no hosted database); without it, mock data stays dev-only.
  return (
    process.env.MOCK_DATA === "true" &&
    (process.env.NODE_ENV !== "production" ||
      process.env.ALLOW_MOCK_IN_PROD === "true")
  );
}

export const MOCK_PROFILE: ProfileData = {
  id: DEMO_USER_ID,
  displayName: "Huỳnh Dương Xuân Nhật",
  heroCode: "CEVC3",
  avatarUrl: "/profile/avatar-sample-1.png",
  heroBadge: "legend",
  boxesOpened: 25,
  boxesUnopened: 25,
};

// Derived the same way the DB stats are: 4 received kudos below, 2 sent
// (see seed.sql), hearts = sum of received hearts_count.
export const MOCK_PROFILE_STATS: ProfileStats = {
  kudosReceived: 4,
  kudosSent: 2,
  heartsReceived: 4000,
  boxesOpened: 25,
  boxesUnopened: 25,
};

export const MOCK_ICON_COLLECTION: IconCollectionItem[] = Array.from(
  { length: 6 },
  (_, i) => ({
    id: `mock-icon-${i + 1}`,
    name: `Icon ${i + 1}`,
    imageUrl: `/profile/icons/icon-${i + 1}.png`,
    sortOrder: i + 1,
    unlocked: i < 3,
  }),
);

const KUDO_MESSAGE =
  "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...";
const KUDO_HASHTAGS =
  "#Dedicated #Inspring #Dedicated #Inspring #Dedicated #Inspring...";

// Design order top→bottom: 2 "Spam" cards (Super Hero sender, no title),
// then 2 titled cards (Legend Hero sender).
export const MOCK_RECEIVED_KUDOS: ReceivedKudo[] = [
  {
    id: "mock-kudo-1",
    senderName: "Huỳnh Dương Xuân Nhật",
    senderHeroCode: "CEVC10",
    senderBadge: "super",
    senderAvatarUrl: "/profile/avatar-sample-2.png",
    hashtagTitle: "",
    message: KUDO_MESSAGE,
    attachmentCount: 5,
    hashtags: KUDO_HASHTAGS,
    heartsCount: 1000,
    isSpam: true,
    createdAt: "2025-10-30T10:00:03+07:00",
  },
  {
    id: "mock-kudo-2",
    senderName: "Huỳnh Dương Xuân Nhật",
    senderHeroCode: "CEVC10",
    senderBadge: "super",
    senderAvatarUrl: "/profile/avatar-sample-2.png",
    hashtagTitle: "",
    message: KUDO_MESSAGE,
    attachmentCount: 5,
    hashtags: KUDO_HASHTAGS,
    heartsCount: 1000,
    isSpam: true,
    createdAt: "2025-10-30T10:00:02+07:00",
  },
  {
    id: "mock-kudo-3",
    senderName: "Huỳnh Dương Xuân Nhật",
    senderHeroCode: "CEVC10",
    senderBadge: "legend",
    senderAvatarUrl: "/profile/avatar-sample-2.png",
    hashtagTitle: "IDOL GIỚI TRẺ",
    message: KUDO_MESSAGE,
    attachmentCount: 5,
    hashtags: KUDO_HASHTAGS,
    heartsCount: 1000,
    isSpam: false,
    createdAt: "2025-10-30T10:00:01+07:00",
  },
  {
    id: "mock-kudo-4",
    senderName: "Huỳnh Dương Xuân Nhật",
    senderHeroCode: "CEVC10",
    senderBadge: "legend",
    senderAvatarUrl: "/profile/avatar-sample-2.png",
    hashtagTitle: "IDOL GIỚI TRẺ",
    message: KUDO_MESSAGE,
    attachmentCount: 5,
    hashtags: KUDO_HASHTAGS,
    heartsCount: 1000,
    isSpam: false,
    createdAt: "2025-10-30T10:00:00+07:00",
  },
];
