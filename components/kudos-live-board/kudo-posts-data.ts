import type { HeroBadgeVariant } from "./kudo-hero-badge";

// mm:2940:13482 "C.2_Danh sách lời cảm ơn" — mock data extracted verbatim
// from the four "C.3/5/6/7_KUDOpost" Figma instances (3127:21871, 3127:22053,
// 3127:22375, 3127:22439). Text, counters and hero codes are copied exactly
// as authored in the design; nothing here is invented.
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
}

export const KUDO_POSTS: KudoPostData[] = [
  {
    id: "3127:21871",
    senderName: "Huỳnh Dương Xuân Nhật",
    senderHeroCode: "CEVC10",
    senderBadge: "new",
    receiverName: "Huỳnh Dương Xuân",
    receiverHeroCode: "CEVC10",
    receiverBadge: "legend",
    time: "10:00 - 10/30/2025",
    hashtagTitle: "IDOL GIỚI TRẺ",
    message:
      "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...",
    attachmentCount: 5,
    hashtags: "#Dedicated #Inspring #Dedicated #Inspring #Dedicated  #Inspring...",
    heartsCount: "1.000",
  },
  {
    id: "3127:22053",
    senderName: "Huỳnh Dương Xuân Nhật",
    senderHeroCode: "CEVC10",
    senderBadge: "rising",
    receiverName: "Huỳnh Dương Xuân",
    receiverHeroCode: "CEVC10",
    receiverBadge: "legend",
    time: "10:00 - 10/30/2025",
    hashtagTitle: "IDOL GIỚI TRẺ",
    message:
      "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...",
    attachmentCount: 5,
    hashtags: "#Dedicated #Inspring #Dedicated #Inspring #Dedicated  #Inspring...",
    heartsCount: "1.000",
  },
  {
    id: "3127:22375",
    senderName: "Huỳnh Dương Xuân Nhật",
    senderHeroCode: "CEVC10",
    senderBadge: "super",
    receiverName: "Huỳnh Dương Xuân",
    receiverHeroCode: "CEVC10",
    receiverBadge: "legend",
    time: "10:00 - 10/30/2025",
    hashtagTitle: "IDOL GIỚI TRẺ",
    message:
      "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...",
    attachmentCount: 5,
    hashtags: "#Dedicated #Inspring #Dedicated #Inspring #Dedicated  #Inspring...",
    heartsCount: "1.000",
  },
  {
    id: "3127:22439",
    senderName: "Huỳnh Dương Xuân Nhật",
    senderHeroCode: "CEVC10",
    senderBadge: "super",
    receiverName: "Huỳnh Dương Xuân",
    receiverHeroCode: "CEVC10",
    receiverBadge: "legend",
    time: "10:00 - 10/30/2025",
    hashtagTitle: "IDOL GIỚI TRẺ",
    message:
      "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...",
    attachmentCount: 5,
    hashtags: "#Dedicated #Inspring #Dedicated #Inspring #Dedicated  #Inspring...",
    heartsCount: "1.000",
  },
];
