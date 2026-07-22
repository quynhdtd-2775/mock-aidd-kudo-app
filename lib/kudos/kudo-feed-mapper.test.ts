import { describe, it, expect } from "vitest";
import { formatHashtagsDisplay, toKudoFeedCards } from "./kudo-feed-mapper";
import type { KudoFeedItem, KudoFeedProfile } from "./kudos-types";

const SENDER: KudoFeedProfile = {
  displayName: "John Doe",
  heroCode: "CEVC10",
  heroBadge: "legend",
  avatarUrl: "https://example.com/john.jpg",
};

const RECEIVER: KudoFeedProfile = {
  displayName: "Jane Doe",
  heroCode: "CEVC3",
  heroBadge: "super",
  avatarUrl: "https://example.com/jane.jpg",
};

function baseItem(overrides: Partial<KudoFeedItem> = {}): KudoFeedItem {
  return {
    id: "kudo-1",
    hashtagTitle: "IDOL GIỚI TRẺ",
    message: "<p>Great job!</p>",
    attachmentCount: 2,
    hashtags: "#Dedicated #Inspring",
    heartsCount: 1000,
    imageUrls: [],
    isAnonymous: false,
    anonymousName: null,
    createdAt: "2025-10-30T10:00:00Z",
    sender: SENDER,
    receiver: RECEIVER,
    senderId: "sender-1",
    likedByMe: false,
    isOwnKudo: false,
    ...overrides,
  };
}

describe("toKudoFeedCards", () => {
  it("maps a normal (non-anonymous) row: sender/receiver/time/hearts/messageHtml", () => {
    const [card] = toKudoFeedCards([baseItem()]);

    expect(card.id).toBe("kudo-1");
    expect(card.senderName).toBe("John Doe");
    expect(card.senderHeroCode).toBe("CEVC10");
    expect(card.senderBadge).toBe("legend");
    expect(card.senderAvatarSrc).toBe("https://example.com/john.jpg");
    expect(card.receiverName).toBe("Jane Doe");
    expect(card.receiverHeroCode).toBe("CEVC3");
    expect(card.receiverBadge).toBe("super");
    expect(card.receiverAvatarSrc).toBe("https://example.com/jane.jpg");
    expect(card.time).toBe("17:00 - 10/30/2025");
    expect(card.heartsCount).toBe("1.000");
    expect(card.messageHtml).toBe("<p>Great job!</p>");
  });

  it("passes through heartsValue (raw number), heartsLiked, and isOwnKudo", () => {
    const [liked] = toKudoFeedCards([
      baseItem({ heartsCount: 42, likedByMe: true, isOwnKudo: false }),
    ]);
    expect(liked.heartsValue).toBe(42);
    expect(liked.heartsLiked).toBe(true);
    expect(liked.isOwnKudo).toBe(false);

    const [own] = toKudoFeedCards([
      baseItem({ likedByMe: false, isOwnKudo: true }),
    ]);
    expect(own.heartsLiked).toBe(false);
    expect(own.isOwnKudo).toBe(true);
  });

  it("anonymizes a row with no custom name → 'Ẩn danh', empty hero code, 'new' badge, no sender leak", () => {
    const [card] = toKudoFeedCards([
      baseItem({ isAnonymous: true, anonymousName: null }),
    ]);

    expect(card.senderName).toBe("Ẩn danh");
    expect(card.senderHeroCode).toBe("");
    expect(card.senderBadge).toBe("new");
    expect(card.senderAvatarSrc).toBeUndefined();
    // The joined sender identity must never surface on an anonymous card.
    expect(card.senderName).not.toBe(SENDER.displayName);
  });

  it("anonymizes a row with a custom anonymous name", () => {
    const [card] = toKudoFeedCards([
      baseItem({ isAnonymous: true, anonymousName: "Người bí ẩn" }),
    ]);

    expect(card.senderName).toBe("Người bí ẩn");
    expect(card.senderHeroCode).toBe("");
    expect(card.senderBadge).toBe("new");
  });

  it("falls back to 'Ẩn danh' when anonymousName is whitespace-only", () => {
    const [card] = toKudoFeedCards([
      baseItem({ isAnonymous: true, anonymousName: "   " }),
    ]);

    expect(card.senderName).toBe("Ẩn danh");
  });

  it("passes through real imageUrls when present", () => {
    const [card] = toKudoFeedCards([
      baseItem({ imageUrls: ["/kudos-live-board/sample-image.png"] }),
    ]);

    expect(card.imageUrls).toEqual(["/kudos-live-board/sample-image.png"]);
    expect(card.attachmentCount).toBe(2);
  });

  it("keeps attachmentCount as the placeholder signal when imageUrls is empty", () => {
    const [card] = toKudoFeedCards([baseItem({ imageUrls: [] })]);

    expect(card.imageUrls).toEqual([]);
    expect(card.attachmentCount).toBe(2);
  });

  it("re-sanitizes the message HTML on read (defense-in-depth)", () => {
    const [card] = toKudoFeedCards([
      baseItem({ message: '<p onclick="alert(1)">hi</p><script>alert(1)</script>' }),
    ]);

    expect(card.messageHtml).toBe("<p>hi</p>");
  });

  it("handles a null sender/receiver join gracefully", () => {
    const [card] = toKudoFeedCards([baseItem({ sender: null, receiver: null })]);

    expect(card.senderName).toBe("");
    expect(card.senderHeroCode).toBe("");
    expect(card.receiverName).toBe("");
    expect(card.receiverHeroCode).toBe("");
    expect(card.receiverBadge).toBe("new");
  });

  it("returns an empty array for an empty input", () => {
    expect(toKudoFeedCards([])).toEqual([]);
  });
});

describe("formatHashtagsDisplay", () => {
  it("prefixes bare comma-joined tags with #", () => {
    expect(formatHashtagsDisplay("LiveTest,TeamWork")).toBe("#LiveTest #TeamWork");
  });

  it("keeps legacy pre-formatted seed strings unchanged", () => {
    expect(formatHashtagsDisplay("#Dedicated #Inspring #Dedicated #Inspring...")).toBe(
      "#Dedicated #Inspring #Dedicated #Inspring...",
    );
  });

  it("drops empty segments and trims", () => {
    expect(formatHashtagsDisplay(" A , ,B ")).toBe("#A #B");
  });
});
