import type { HeroBadgeVariant } from "../kudos-live-board/kudo-hero-badge";

// mm:362:5091 "mms_D_Post all" — mock data extracted verbatim from the four
// post instances on the Profile screen: two "KUDO spam" instances (3127:24169,
// 3127:24455) flagged with a Spam status badge and no hashtag title, and two
// "KUDO" instances (1949:12834, 3127:22945) with a centered hashtag title and
// no status badge. Text, counters and hero codes are copied exactly as
// authored in the design; nothing here is invented.
export interface ProfileKudoPostData {
  id: string;
  isSpam: boolean;
  senderName: string;
  senderHeroCode: string;
  senderBadge: HeroBadgeVariant;
  /** Falls back to the profile sample avatar when omitted. */
  senderAvatarSrc?: string;
  receiverName: string;
  receiverHeroCode: string;
  receiverBadge: HeroBadgeVariant;
  /** Falls back to the profile sample avatar when omitted. */
  receiverAvatarSrc?: string;
  time: string;
  /** mm:I1949:12834;1949:13384 — only present on non-spam "KUDO" cards */
  title?: string;
  message: string;
  attachmentCount: number;
  hashtags: string;
  heartsCount: string;
}

const MESSAGE =
  "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...";
const HASHTAGS = "#Dedicated #Inspring #Dedicated #Inspring #Dedicated  #Inspring...";

export const PROFILE_KUDO_POSTS: ProfileKudoPostData[] = [
  {
    id: "3127:24169",
    isSpam: true,
    senderName: "Huỳnh Dương Xuân Nhật ",
    senderHeroCode: "CEVC10",
    senderBadge: "super",
    receiverName: "Huỳnh Dương Xuân",
    receiverHeroCode: "CEVC10",
    receiverBadge: "legend",
    time: "10:00 - 10/30/2025",
    message: MESSAGE,
    attachmentCount: 5,
    hashtags: HASHTAGS,
    heartsCount: "1.000",
  },
  {
    id: "3127:24455",
    isSpam: true,
    senderName: "Huỳnh Dương Xuân Nhật ",
    senderHeroCode: "CEVC10",
    senderBadge: "super",
    receiverName: "Huỳnh Dương Xuân",
    receiverHeroCode: "CEVC10",
    receiverBadge: "legend",
    time: "10:00 - 10/30/2025",
    message: MESSAGE,
    attachmentCount: 5,
    hashtags: HASHTAGS,
    heartsCount: "1.000",
  },
  {
    id: "1949:12834",
    isSpam: false,
    senderName: "Huỳnh Dương Xuân Nhật ",
    senderHeroCode: "CEVC10",
    senderBadge: "legend",
    receiverName: "Huỳnh Dương Xuân ",
    receiverHeroCode: "CEVC10",
    receiverBadge: "legend",
    time: "10:00 - 10/30/2025",
    title: "IDOL GIỚI TRẺ",
    message: MESSAGE,
    attachmentCount: 5,
    hashtags: HASHTAGS,
    heartsCount: "1.000",
  },
  {
    id: "3127:22945",
    isSpam: false,
    senderName: "Huỳnh Dương Xuân Nhật ",
    senderHeroCode: "CEVC10",
    senderBadge: "legend",
    receiverName: "Huỳnh Dương Xuân ",
    receiverHeroCode: "CEVC10",
    receiverBadge: "legend",
    time: "10:00 - 10/30/2025",
    title: "IDOL GIỚI TRẺ",
    message: MESSAGE,
    attachmentCount: 5,
    hashtags: HASHTAGS,
    heartsCount: "1.000",
  },
];
