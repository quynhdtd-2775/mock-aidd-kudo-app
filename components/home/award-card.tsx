import Image from "next/image";
import Link from "next/link";

const GOLD = "rgba(255, 234, 158, 1)";

export interface AwardCardData {
  id: string;
  /** Key into the `Awards.cards` message namespace (title/description). */
  messageKey: string;
  nameImage: string;
  nameWidth: number;
  nameHeight: number;
}

// mm:2167:9074 + mm:2167:9078 — six instances of component 214:1032
export const AWARD_CARDS: AwardCardData[] = [
  {
    id: "2167:9075", // mms_C2.1_Top Talent Award
    messageKey: "topTalent",
    nameImage: "/home/Top_Talent.png",
    nameWidth: 221,
    nameHeight: 35,
  },
  {
    id: "2167:9076", // mms_C2.2_Top Project Award
    messageKey: "topProject",
    nameImage: "/home/Top_Project.png",
    nameWidth: 232,
    nameHeight: 35,
  },
  {
    id: "2167:9077", // mms_C2.3_Top Project Leader Award
    messageKey: "topProjectLeader",
    nameImage: "/home/Top_Project_Leader.png",
    nameWidth: 232,
    nameHeight: 64,
  },
  {
    id: "2167:9079", // mms_C2.4_Best Manager Award
    messageKey: "bestManager",
    nameImage: "/home/Best_Manager.png",
    nameWidth: 232,
    nameHeight: 30,
  },
  {
    id: "2167:9080", // mms_C2.5_Signature 2025 - Creator Award
    messageKey: "signature2025Creator",
    nameImage: "/home/Signature_2025_Creator.png",
    nameWidth: 232,
    nameHeight: 54,
  },
  {
    id: "2167:9081", // mms_C2.6_MVP Award
    messageKey: "mvp",
    nameImage: "/home/MVP.png",
    nameWidth: 116,
    nameHeight: 52,
  },
];

interface AwardCardProps {
  card: AwardCardData;
  title: string;
  description: string;
  detailsLabel: string;
  /** Anchor slug on /home-awards-page this card links to (see CARD_ANCHORS in awards-section.tsx). */
  slug: string;
}

// Whole card (image + title + "Chi tiết") is a single link per spec C2 — nested
// anchors aren't valid HTML, so the entire card is the clickable surface
// rather than separate links inside it.
export function AwardCard({ card, title, description, detailsLabel, slug }: AwardCardProps) {
  return (
    <Link
      href={`/home-awards-page#${slug}`}
      className="group flex w-full max-w-[336px] flex-col items-start gap-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-2"
    >
      {/* mm:I2167:9075;214:1019 — Picture-Award */}
      <div
        className="relative flex aspect-square w-full items-center justify-center rounded-3xl transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
        style={{
          boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 #FAE287",
          mixBlendMode: "screen",
        }}
      >
        {/* mm:I2167:9075;214:1019;81:2442 — MM_MEDIA_Award BG */}
        <Image
          src="/home/Award_BG.png"
          alt=""
          fill
          className="rounded-3xl object-cover"
          style={{ border: `0.955px solid ${GOLD}` }}
        />
        {/* mm:I2167:9075;214:1019;214:666 — Awards-Name (MM_MEDIA award name) */}
        <Image
          src={card.nameImage}
          alt={title}
          width={card.nameWidth}
          height={card.nameHeight}
          className="relative"
        />
      </div>

      {/* mm:I2167:9075;214:1020 — Frame 490 */}
      <div className="flex w-full flex-col items-start gap-1">
        {/* mm:I2167:9075;214:1021 — award title */}
        <p
          style={{
            fontFamily: "var(--font-montserrat)",
            fontWeight: 400,
            fontSize: 24,
            lineHeight: "32px",
            color: GOLD,
          }}
        >
          {title}
        </p>
        {/* mm:I2167:9075;214:1022 — award description, clamped to 2 lines */}
        <p
          className="line-clamp-2"
          style={{
            fontFamily: "var(--font-montserrat)",
            fontWeight: 400,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "0.5px",
            color: "rgba(255, 255, 255, 1)",
          }}
        >
          {description}
        </p>
        {/* mm:I2167:9075;214:1023 — "Chi tiết" (part of the card-wide link, not its own anchor) */}
        <span className="flex items-center gap-1 py-4 transition-opacity duration-200 group-hover:opacity-80">
          <span
            style={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 500,
              fontSize: 16,
              lineHeight: "24px",
              letterSpacing: "0.15px",
              color: "rgba(255, 255, 255, 1)",
            }}
          >
            {detailsLabel}
          </span>
          {/* mm:I2167:9075;214:1023;186:1441 — MM_MEDIA_Up */}
          <Image src="/home/Up.svg" alt="" width={24} height={24} />
        </span>
      </div>
    </Link>
  );
}
