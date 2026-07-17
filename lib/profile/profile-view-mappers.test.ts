import { describe, it, expect } from "vitest";
import {
  toProfileHeroProps,
  toKudoPostCards,
} from "./profile-view-mappers";
import type {
  ProfileData,
  ProfileStats,
  ReceivedKudo,
  IconCollectionItem,
} from "./profile-types";

const TEST_LABELS = {
  collectionLinkLabel: "Bộ sưu tập icon của tôi",
  openBoxButtonLabel: "Mở Secret Box",
};

describe("profile-view-mappers", () => {
  describe("toProfileHeroProps", () => {
    it("should map profile data and stats to hero props", () => {
      const profile: ProfileData = {
        id: "user-1",
        displayName: "John Doe",
        heroCode: "VN-001",
        avatarUrl: "https://example.com/avatar.jpg",
        heroBadge: "legend",
        boxesOpened: 5,
        boxesUnopened: 3,
      };

      const stats: ProfileStats = {
        kudosReceived: 150,
        kudosSent: 42,
        heartsReceived: 789,
        boxesOpened: 5,
        boxesUnopened: 3,
      };

      const icons: IconCollectionItem[] = [
        {
          id: "icon-1",
          name: "Fire",
          imageUrl: "https://example.com/fire.svg",
          sortOrder: 1,
          unlocked: true,
        },
        {
          id: "icon-2",
          name: "Star",
          imageUrl: "https://example.com/star.svg",
          sortOrder: 2,
          unlocked: false,
        },
      ];

      const result = toProfileHeroProps(profile, stats, icons, TEST_LABELS);

      expect(result.info.name).toBe("John Doe");
      expect(result.info.department).toBe("VN-001");
      expect(result.info.legendLabel).toBe("Legend Hero");
      expect(result.info.avatarSrc).toBe("https://example.com/avatar.jpg");

      expect(result.badges.icons).toEqual([
        { id: "icon-1", unlocked: true },
        { id: "icon-2", unlocked: false },
      ]);
      expect(result.badges.collectionLinkLabel).toBe("Bộ sưu tập icon của tôi");

      expect(result.stats.kudosReceived).toBe("150");
      expect(result.stats.kudosSent).toBe("42");
      expect(result.stats.heartsReceived).toBe("789");
      expect(result.stats.secretBoxesOpened).toBe("5");
      expect(result.stats.secretBoxesUnopened).toBe("3");
      expect(result.stats.openBoxButtonLabel).toBe("Mở Secret Box");
    });

    it("should handle null avatar URL", () => {
      const profile: ProfileData = {
        id: "user-2",
        displayName: "Jane Doe",
        heroCode: "VN-002",
        avatarUrl: null,
        heroBadge: "new",
        boxesOpened: 0,
        boxesUnopened: 1,
      };

      const stats: ProfileStats = {
        kudosReceived: 0,
        kudosSent: 0,
        heartsReceived: 0,
        boxesOpened: 0,
        boxesUnopened: 1,
      };

      const icons: IconCollectionItem[] = [];

      const result = toProfileHeroProps(profile, stats, icons, TEST_LABELS);

      expect(result.info.avatarSrc).toBeUndefined();
      expect(result.badges.icons).toEqual([]);
    });

    it("should format all hero badge types correctly", () => {
      const baseProfile: ProfileData = {
        id: "user-3",
        displayName: "Test User",
        heroCode: "VN-003",
        avatarUrl: null,
        heroBadge: "super",
        boxesOpened: 0,
        boxesUnopened: 0,
      };

      const stats: ProfileStats = {
        kudosReceived: 0,
        kudosSent: 0,
        heartsReceived: 0,
        boxesOpened: 0,
        boxesUnopened: 0,
      };

      const badges = ["new", "rising", "legend", "super"] as const;
      const expectedLabels: Record<string, string> = {
        new: "New Hero",
        rising: "Rising Hero",
        legend: "Legend Hero",
        super: "Super Hero",
      };

      badges.forEach((badge) => {
        const profile = { ...baseProfile, heroBadge: badge };
        const result = toProfileHeroProps(profile, stats, [], TEST_LABELS);
        expect(result.info.legendLabel).toBe(expectedLabels[badge]);
      });
    });

    it("should format counts with vi-VN locale", () => {
      const profile: ProfileData = {
        id: "user-4",
        displayName: "Test User",
        heroCode: "VN-004",
        avatarUrl: null,
        heroBadge: "rising",
        boxesOpened: 0,
        boxesUnopened: 0,
      };

      const stats: ProfileStats = {
        kudosReceived: 1000,
        kudosSent: 1000000,
        heartsReceived: 999,
        boxesOpened: 0,
        boxesUnopened: 0,
      };

      const result = toProfileHeroProps(profile, stats, [], TEST_LABELS);

      expect(result.stats.kudosReceived).toBe("1.000");
      expect(result.stats.kudosSent).toBe("1.000.000");
      expect(result.stats.heartsReceived).toBe("999");
    });

    it("should handle large numbers with vi-VN formatting", () => {
      const profile: ProfileData = {
        id: "user-5",
        displayName: "Popular User",
        heroCode: "VN-005",
        avatarUrl: null,
        heroBadge: "legend",
        boxesOpened: 0,
        boxesUnopened: 0,
      };

      const stats: ProfileStats = {
        kudosReceived: 123456789,
        kudosSent: 987654321,
        heartsReceived: 555555555,
        boxesOpened: 0,
        boxesUnopened: 0,
      };

      const result = toProfileHeroProps(profile, stats, [], TEST_LABELS);

      expect(result.stats.kudosReceived).toBe("123.456.789");
      expect(result.stats.kudosSent).toBe("987.654.321");
      expect(result.stats.heartsReceived).toBe("555.555.555");
    });
  });

  describe("toKudoPostCards", () => {
    it("should map kudo data to post card props", () => {
      const receiver: ProfileData = {
        id: "receiver-1",
        displayName: "Jane Doe",
        heroCode: "VN-REC-001",
        avatarUrl: "https://example.com/jane.jpg",
        heroBadge: "rising",
        boxesOpened: 2,
        boxesUnopened: 1,
      };

      const kudos: ReceivedKudo[] = [
        {
          id: "kudo-1",
          senderName: "John Doe",
          senderHeroCode: "VN-SEND-001",
          senderBadge: "legend",
          senderAvatarUrl: null,
          hashtagTitle: "#TeamWork",
          message: "Great job on the project!",
          attachmentCount: 2,
          hashtags: "#TeamWork #Awesome",
          heartsCount: 42,
          isSpam: false,
          createdAt: "2025-10-30T10:00:00Z",
        },
      ];

      const result = toKudoPostCards(kudos, receiver);

      expect(result).toHaveLength(1);
      const card = result[0];
      expect(card.id).toBe("kudo-1");
      expect(card.senderName).toBe("John Doe");
      expect(card.senderHeroCode).toBe("VN-SEND-001");
      expect(card.senderBadge).toBe("legend");
      expect(card.receiverName).toBe("Jane Doe");
      expect(card.receiverHeroCode).toBe("VN-REC-001");
      expect(card.receiverBadge).toBe("rising");
      expect(card.title).toBe("#TeamWork");
      expect(card.message).toBe("Great job on the project!");
      expect(card.attachmentCount).toBe(2);
      expect(card.hashtags).toBe("#TeamWork #Awesome");
      expect(card.heartsCount).toBe("42");
      expect(card.isSpam).toBe(false);
    });

    it("should handle empty kudo list", () => {
      const receiver: ProfileData = {
        id: "receiver-2",
        displayName: "Empty User",
        heroCode: "VN-EMPTY",
        avatarUrl: null,
        heroBadge: "new",
        boxesOpened: 0,
        boxesUnopened: 0,
      };

      const kudos: ReceivedKudo[] = [];

      const result = toKudoPostCards(kudos, receiver);

      expect(result).toEqual([]);
    });

    it("should handle null hashtag title", () => {
      const receiver: ProfileData = {
        id: "receiver-3",
        displayName: "No Title User",
        heroCode: "VN-NOTITLE",
        avatarUrl: null,
        heroBadge: "super",
        boxesOpened: 0,
        boxesUnopened: 0,
      };

      const kudos: ReceivedKudo[] = [
        {
          id: "kudo-2",
          senderName: "Sender Name",
          senderHeroCode: "VN-SENDER",
          senderBadge: "new",
          senderAvatarUrl: null,
          hashtagTitle: "",
          message: "Message without title",
          attachmentCount: 0,
          hashtags: "",
          heartsCount: 0,
          isSpam: false,
          createdAt: "2025-01-01T00:00:00Z",
        },
      ];

      const result = toKudoPostCards(kudos, receiver);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBeUndefined();
    });

    it("should format time with vi-VN timezone", () => {
      const receiver: ProfileData = {
        id: "receiver-4",
        displayName: "Time User",
        heroCode: "VN-TIME",
        avatarUrl: null,
        heroBadge: "legend",
        boxesOpened: 0,
        boxesUnopened: 0,
      };

      const kudos: ReceivedKudo[] = [
        {
          id: "kudo-3",
          senderName: "Sender",
          senderHeroCode: "VN-SEND",
          senderBadge: "super",
          senderAvatarUrl: null,
          hashtagTitle: "#Time",
          message: "Test message",
          attachmentCount: 0,
          hashtags: "#Time",
          heartsCount: 0,
          isSpam: false,
          createdAt: "2025-10-30T10:00:00Z",
        },
      ];

      const result = toKudoPostCards(kudos, receiver);

      // UTC 10:00 converts to 17:00 in Ho Chi Minh timezone (UTC+7)
      expect(result[0].time).toBe("17:00 - 10/30/2025");
    });

    it("should handle midnight time formatting", () => {
      const receiver: ProfileData = {
        id: "receiver-5",
        displayName: "Midnight User",
        heroCode: "VN-MIDNIGHT",
        avatarUrl: null,
        heroBadge: "new",
        boxesOpened: 0,
        boxesUnopened: 0,
      };

      const kudos: ReceivedKudo[] = [
        {
          id: "kudo-4",
          senderName: "Sender",
          senderHeroCode: "VN-SEND",
          senderBadge: "rising",
          senderAvatarUrl: null,
          hashtagTitle: "#Midnight",
          message: "Midnight message",
          attachmentCount: 0,
          hashtags: "#Midnight",
          heartsCount: 0,
          isSpam: false,
          createdAt: "2025-12-31T23:59:59Z",
        },
      ];

      const result = toKudoPostCards(kudos, receiver);

      expect(result[0].time).toMatch(/^\d{2}:\d{2} - \d{2}\/\d{2}\/\d{4}$/);
    });

    it("should handle multiple kudos", () => {
      const receiver: ProfileData = {
        id: "receiver-6",
        displayName: "Popular User",
        heroCode: "VN-POPULAR",
        avatarUrl: null,
        heroBadge: "legend",
        boxesOpened: 0,
        boxesUnopened: 0,
      };

      const kudos: ReceivedKudo[] = [
        {
          id: "kudo-5",
          senderName: "Sender 1",
          senderHeroCode: "VN-S1",
          senderBadge: "new",
          senderAvatarUrl: null,
          hashtagTitle: "#First",
          message: "First kudo",
          attachmentCount: 1,
          hashtags: "#First",
          heartsCount: 10,
          isSpam: false,
          createdAt: "2025-01-01T08:30:00Z",
        },
        {
          id: "kudo-6",
          senderName: "Sender 2",
          senderHeroCode: "VN-S2",
          senderBadge: "rising",
          senderAvatarUrl: null,
          hashtagTitle: "#Second",
          message: "Second kudo",
          attachmentCount: 0,
          hashtags: "#Second",
          heartsCount: 20,
          isSpam: false,
          createdAt: "2025-02-15T14:45:00Z",
        },
      ];

      const result = toKudoPostCards(kudos, receiver);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("kudo-5");
      expect(result[1].id).toBe("kudo-6");
      expect(result[0].senderName).toBe("Sender 1");
      expect(result[1].senderName).toBe("Sender 2");
    });

    it("should handle spam kudo flag", () => {
      const receiver: ProfileData = {
        id: "receiver-7",
        displayName: "Spam User",
        heroCode: "VN-SPAM",
        avatarUrl: null,
        heroBadge: "super",
        boxesOpened: 0,
        boxesUnopened: 0,
      };

      const kudos: ReceivedKudo[] = [
        {
          id: "kudo-spam",
          senderName: "Spammer",
          senderHeroCode: "VN-SPAMMER",
          senderBadge: "new",
          senderAvatarUrl: null,
          hashtagTitle: "#Spam",
          message: "Spam message",
          attachmentCount: 0,
          hashtags: "#Spam",
          heartsCount: 0,
          isSpam: true,
          createdAt: "2025-01-01T00:00:00Z",
        },
      ];

      const result = toKudoPostCards(kudos, receiver);

      expect(result[0].isSpam).toBe(true);
    });

    it("should format hearts count with vi-VN locale", () => {
      const receiver: ProfileData = {
        id: "receiver-8",
        displayName: "Popular Kudo User",
        heroCode: "VN-POPULAR-KUDO",
        avatarUrl: null,
        heroBadge: "legend",
        boxesOpened: 0,
        boxesUnopened: 0,
      };

      const kudos: ReceivedKudo[] = [
        {
          id: "kudo-7",
          senderName: "Sender",
          senderHeroCode: "VN-SEND",
          senderBadge: "legend",
          senderAvatarUrl: null,
          hashtagTitle: "#Popular",
          message: "Popular kudo",
          attachmentCount: 0,
          hashtags: "#Popular",
          heartsCount: 1500000,
          isSpam: false,
          createdAt: "2025-01-01T00:00:00Z",
        },
      ];

      const result = toKudoPostCards(kudos, receiver);

      expect(result[0].heartsCount).toBe("1.500.000");
    });
  });
});
