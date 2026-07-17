// mm:2940:13464 / 2940:13465 / 2940:13466 — mock data for the 3 highlight
// kudos cards, extracted verbatim from Figma text content (no invented data).

export interface HighlightKudoData {
  id: string;
  timestamp: string;
  awardTitle: string;
  senderName: string;
  senderAvatar: string;
  senderBadge: string;
  /** Omit for a solo-recipient card (mm:2940:13466 has no receiver). */
  receiverName?: string;
  receiverAvatar?: string;
  receiverBadge?: string;
  message: string;
  hashtags: string;
  likeCount: string;
  /** mm:I…;335:9663 "Xem chi tiết" button — only card 1 & 2 show it. */
  showDetailButton?: boolean;
}

export const HIGHLIGHT_KUDOS: HighlightKudoData[] = [
  {
    id: "2940:13464",
    timestamp: "10:00 - 10/30/2025",
    awardTitle: "IDOL GIỚI TRẺ",
    senderName: "Huỳnh Dương Xuân Nhật",
    senderAvatar: "/kudos-live-board/avatar-sender.png",
    senderBadge: "Rising Hero",
    receiverName: "Huỳnh Dương Xuân Nhật",
    receiverAvatar: "/kudos-live-board/avatar-receiver.png",
    receiverBadge: "Legend Hero",
    message:
      "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất...",
    hashtags: "#Dedicated #Inspring #Dedicated #Inspring #Dedicated  #Inspring...",
    likeCount: "1.000",
    showDetailButton: true,
  },
  {
    id: "2940:13465",
    timestamp: "10:00 - 10/30/2025",
    awardTitle: "IDOL GIỚI TRẺ",
    senderName: "Huỳnh Dương Xuân Nhật",
    senderAvatar: "/kudos-live-board/avatar-sender.png",
    senderBadge: "Rising Hero",
    receiverName: "Huỳnh Dương Xuân Nhật",
    receiverAvatar: "/kudos-live-board/avatar-receiver.png",
    receiverBadge: "Legend Hero",
    message:
      "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất...",
    hashtags: "#Dedicated #Inspring #Dedicated #Inspring #Dedicated  #Inspring...",
    likeCount: "1.000",
    showDetailButton: true,
  },
  {
    id: "2940:13466",
    timestamp: "10:00 - 10/30/2025",
    awardTitle: "IDOL GIỚI TRẺ",
    senderName: "Huỳnh Dương Xuân Nhật",
    senderAvatar: "/kudos-live-board/avatar-sender.png",
    senderBadge: "Rising Hero",
    message:
      "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất...",
    hashtags: "#Dedicated #Inspring #Dedicated #Inspring #Dedicated  #Inspring...",
    likeCount: "1.000",
    showDetailButton: false,
  },
];
