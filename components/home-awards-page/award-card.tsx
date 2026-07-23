import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { IconTarget } from "./icon-target";

function IconDiamond(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16 9H19L14 16M10 9H14L12 17M5 9H8L10 16M15 4H17L19 7H16M11 4H13L14 7H10M7 4H9L8 7H5M6 2L2 8L12 22L22 8L18 2H6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconLicense(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.00011 10C9.01047 9.20761 9.32986 8.45055 9.89024 7.89017C10.4506 7.32979 11.2077 7.0104 12.0001 7.00004C12.7925 7.0104 13.5496 7.32979 14.11 7.89017C14.6704 8.45055 14.9897 9.20761 15.0001 10C14.9897 10.7925 14.6704 11.5495 14.11 12.1099C13.5496 12.6703 12.7925 12.9897 12.0001 13C11.2077 12.9897 10.4506 12.6703 9.89024 12.1099C9.32986 11.5495 9.01047 10.7925 9.00011 10ZM12.0001 19L16.0001 20V16.92C14.7938 17.6465 13.4081 18.0206 12.0001 18C10.5921 18.0206 9.20643 17.6465 8.00011 16.92V20M12.0001 4.00004C11.2121 3.98566 10.4294 4.1326 9.70027 4.43183C8.97112 4.73106 8.31087 5.17625 7.76011 5.74004C7.19022 6.2914 6.73988 6.95414 6.4371 7.68701C6.13431 8.41988 5.98557 9.20722 6.00011 10C5.98969 10.7878 6.14044 11.5695 6.4431 12.2969C6.74576 13.0243 7.19394 13.6821 7.76011 14.23C8.3083 14.7993 8.9674 15.25 9.69668 15.5544C10.426 15.8589 11.2099 16.0105 12.0001 16C12.7903 16.0105 13.5743 15.8589 14.3035 15.5544C15.0328 15.25 15.6919 14.7993 16.2401 14.23C16.8063 13.6821 17.2545 13.0243 17.5571 12.2969C17.8598 11.5695 18.0105 10.7878 18.0001 10C18.0146 9.20722 17.8659 8.41988 17.5631 7.68701C17.2603 6.95414 16.81 6.2914 16.2401 5.74004C15.6893 5.17625 15.0291 4.73106 14.2999 4.43183C13.5708 4.1326 12.7881 3.98566 12.0001 4.00004ZM20.0001 10C19.9788 10.9599 19.7858 11.9082 19.4301 12.8C19.1097 13.7075 18.6249 14.5481 18.0001 15.28V23L12.0001 21L6.00011 23V15.28C4.7058 13.8265 3.99361 11.9463 4.00011 10C3.98248 8.95062 4.18014 7.90873 4.58089 6.93868C4.98163 5.96864 5.57696 5.09103 6.33011 4.36004C7.06381 3.60013 7.94547 2.99867 8.92067 2.59277C9.89587 2.18686 10.9439 1.98514 12.0001 2.00004C13.0563 1.98514 14.1043 2.18686 15.0795 2.59277C16.0547 2.99867 16.9364 3.60013 17.6701 4.36004C18.4233 5.09103 19.0186 5.96864 19.4193 6.93868C19.8201 7.90873 20.0177 8.95062 20.0001 10Z"
        fill="currentColor"
      />
    </svg>
  );
}

const GOLD = "rgba(255, 234, 158, 1)";
const DIVIDER_COLOR = "rgba(46, 57, 64, 1)";

interface AwardValue {
  amount: string;
  /** Key into AwardsPage.cards.{messageKey}.{captionKey} */
  captionKey: string;
  /** Whether an "orDivider" label is rendered above this value (e.g. Signature's dual values) */
  showDivider?: boolean;
}

interface ResolvedAwardValue {
  amount: string;
  caption: string;
  dividerLabel?: string;
}

export interface AwardCardData {
  id: string;
  /** Key into Awards.cards.{messageKey} (title) and AwardsPage.cards.{messageKey} (description/unit/captions) */
  messageKey: string;
  quantity: string;
  values: AwardValue[];
  badgeImage?: string;
  badgeWidth?: number;
  badgeHeight?: number;
  imageSide: "left" | "right";
  wrapId: string;
  contentId: string;
  titleFrameId: string;
  targetIconId: string;
  titleTextId: string;
  descTextId: string;
  divider1Id: string;
  quantityRowId: string;
  diamondIconId: string;
  quantityLabelId: string;
  divider2Id: string;
  valueRowId: string;
  licenseIconId: string;
  valueLabelId: string;
  photoId: string;
  thumbBgId: string;
  badgeId: string;
  endDividerId?: string;
}

interface ResolvedAwardCard {
  card: AwardCardData;
  title: string;
  description: string;
  unit: string;
  badgeText: string;
  quantityLabel: string;
  valueLabel: string;
  values: ResolvedAwardValue[];
}

function AwardPhoto({ card, badgeText }: { card: AwardCardData; badgeText: string }) {
  return (
    // Repeated card template — canonical nodeId 313:8467 branch; per-instance nodeId is card.photoId (see AWARD_CARDS)
    // mm:I313:8467;214:2525
    <div
      className="group relative flex aspect-square w-full max-w-[336px] shrink-0 items-center justify-center transition-transform duration-300 motion-safe:hover:scale-[1.02]"
      style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 #FAE287", mixBlendMode: "screen" }}
    >
      {/* mm:I313:8467;214:2525;81:2442 — per-instance id: card.thumbBgId */}
      <Image
        src="/home/3be6747ea4c982f14ae2a7c871e54888.png"
        alt=""
        fill
        className="rounded-3xl object-cover"
        style={{ border: `0.955px solid ${GOLD}` }}
      />
      {/* mm:I313:8467;214:2525;214:666 — per-instance id: card.badgeId */}
      <div className="absolute top-[44.6%] left-1/2 -translate-x-1/2">
        {card.badgeImage ? (
          <Image
            src={card.badgeImage}
            alt={badgeText}
            width={card.badgeWidth ?? 232}
            height={card.badgeHeight ?? 35}
          />
        ) : (
          <span
            className="whitespace-pre-line rounded px-4 py-1 text-center"
            style={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 700,
              fontSize: 16,
              lineHeight: "20px",
              color: GOLD,
              backgroundColor: "rgba(0, 16, 26, 0.6)",
            }}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}

function AwardContent({ card, title, description, unit, quantityLabel, valueLabel, values }: Omit<ResolvedAwardCard, "badgeText">) {
  return (
    // mm:I313:8467;214:2526 — per-instance id: card.contentId
    <div
      className="flex w-full max-w-[480px] flex-col items-start gap-8 rounded-2xl"
      style={{ backdropFilter: "blur(32px)" }}
    >
      {/* mm:I313:8467;214:2528 — per-instance id: card.titleFrameId */}
      <div className="flex flex-col items-start gap-6">
        <div className="flex items-center gap-4">
          {/* mm:I313:8467;214:2529 — per-instance id: card.targetIconId */}
          <IconTarget className="h-6 w-6" style={{ color: GOLD }} />
          {/* mm:I313:8467;214:2530 — per-instance id: card.titleTextId */}
          <p
            style={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 700,
              fontSize: 24,
              lineHeight: "32px",
              color: GOLD,
            }}
          >
            {title}
          </p>
        </div>

        {/* mm:I313:8467;214:2531 — per-instance id: card.descTextId */}
        <p
          className="text-justify"
          style={{
            fontFamily: "var(--font-montserrat)",
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "0.5px",
            color: "rgba(255, 255, 255, 1)",
          }}
        >
          {description}
        </p>
      </div>

      {/* mm:I313:8467;214:2532 — per-instance id: card.divider1Id */}
      <div className="h-px w-full" style={{ backgroundColor: DIVIDER_COLOR }} />

      {/* mm:I313:8467;214:2534 — per-instance id: card.quantityRowId */}
      <div className="flex items-center gap-4">
        <IconDiamond className="h-6 w-6" style={{ color: GOLD }} />
        {/* mm:I313:8467;214:2536 — per-instance id: card.quantityLabelId */}
        <p
          style={{
            fontFamily: "var(--font-montserrat)",
            fontWeight: 700,
            fontSize: 24,
            lineHeight: "32px",
            color: GOLD,
          }}
        >
          {quantityLabel}
        </p>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 700,
              fontSize: 36,
              lineHeight: "44px",
              color: "rgba(255, 255, 255, 1)",
            }}
          >
            {card.quantity}
          </span>
          <span
            style={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 700,
              fontSize: 14,
              lineHeight: "20px",
              letterSpacing: "0.1px",
              color: "rgba(255, 255, 255, 1)",
            }}
          >
            {unit}
          </span>
        </div>
      </div>

      {/* mm:I313:8467;214:2539 — per-instance id: card.divider2Id */}
      <div className="h-px w-full" style={{ backgroundColor: DIVIDER_COLOR }} />

      {/* mm:I313:8467;214:2540 — per-instance id: card.valueRowId (dual-value cards add an "orDivider" label between entries, see 313:8471) */}
      <div className="flex w-full flex-col items-start gap-6">
        {values.map((value, index) => (
          <div key={index} className="flex w-full flex-col items-start gap-4">
            {index > 0 && value.dividerLabel ? (
              <div className="flex w-full items-center justify-center gap-2">
                <span
                  style={{
                    fontFamily: "var(--font-montserrat)",
                    fontWeight: 700,
                    fontSize: 14,
                    lineHeight: "20px",
                    letterSpacing: "0.1px",
                    color: DIVIDER_COLOR,
                  }}
                >
                  {value.dividerLabel}
                </span>
                <div className="h-px flex-1" style={{ backgroundColor: DIVIDER_COLOR }} />
              </div>
            ) : null}
            <div className="flex items-center gap-4">
              <IconLicense className="h-6 w-6" style={{ color: GOLD }} />
              {/* mm:I313:8467;214:2544 — per-instance id: card.valueLabelId */}
              <p
                style={{
                  fontFamily: "var(--font-montserrat)",
                  fontWeight: 700,
                  fontSize: 24,
                  lineHeight: "32px",
                  color: GOLD,
                }}
              >
                {valueLabel}
              </p>
            </div>
            <span
              style={{
                fontFamily: "var(--font-montserrat)",
                fontWeight: 700,
                fontSize: 36,
                lineHeight: "44px",
                color: "rgba(255, 255, 255, 1)",
              }}
            >
              {value.amount}
            </span>
            <span
              style={{
                fontFamily: "var(--font-montserrat)",
                fontWeight: 700,
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: "0.1px",
                color: "rgba(255, 255, 255, 1)",
              }}
            >
              {value.caption}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function AwardCard({ card }: { card: AwardCardData }) {
  const tAwards = await getTranslations("Awards");
  const tPage = await getTranslations("AwardsPage");

  const title = tAwards(`cards.${card.messageKey}.title`);
  const badgeText =
    card.messageKey === "mvp" ? tPage("cards.mvp.badgeText") : title;
  const orDivider = tPage("orDivider");

  const resolved: ResolvedAwardCard = {
    card,
    title,
    description: tPage(`cards.${card.messageKey}.description`),
    unit: tPage(`cards.${card.messageKey}.unit`),
    badgeText,
    quantityLabel: tPage("quantityLabel"),
    valueLabel: tPage("valueLabel"),
    values: card.values.map((value) => ({
      amount: value.amount,
      caption: tPage(`cards.${card.messageKey}.${value.captionKey}`),
      dividerLabel: value.showDivider ? orDivider : undefined,
    })),
  };

  return (
    // mm:313:8467 — repeated award-card template (see AWARD_CARDS array for each instance's real nodeId set: wrapId, contentId, photoId, etc.)
    <div className="flex w-full flex-col items-start">
      {/* mm:I313:8467;214:2803 — per-instance id: card.wrapId */}
      <div className="flex w-full flex-col items-center gap-8 md:flex-row md:items-start lg:gap-10">
        {card.imageSide === "left" ? (
          <>
            <AwardPhoto card={card} badgeText={badgeText} />
            <AwardContent {...resolved} />
          </>
        ) : (
          <>
            <AwardContent {...resolved} />
            <AwardPhoto card={card} badgeText={badgeText} />
          </>
        )}
      </div>
      {card.endDividerId ? (
        // mm:I313:8467;214:2771 — per-instance id: card.endDividerId
        <div className="mt-20 h-px w-full" style={{ backgroundColor: DIVIDER_COLOR }} />
      ) : null}
    </div>
  );
}

export const AWARD_CARDS: AwardCardData[] = [
  {
    id: "313:8467",
    messageKey: "topTalent",
    quantity: "10",
    values: [{ amount: "7.000.000 VNĐ", captionKey: "perAwardCaption" }],
    badgeImage: "/home/2f088c920ef9dfb4b99cc86f8ab35189.png",
    badgeWidth: 232,
    badgeHeight: 37,
    imageSide: "left",
    wrapId: "I313:8467;214:2803",
    contentId: "I313:8467;214:2526",
    titleFrameId: "I313:8467;214:2528",
    targetIconId: "I313:8467;214:2529",
    titleTextId: "I313:8467;214:2530",
    descTextId: "I313:8467;214:2531",
    divider1Id: "I313:8467;214:2532",
    quantityRowId: "I313:8467;214:2534",
    diamondIconId: "I313:8467;214:2535",
    quantityLabelId: "I313:8467;214:2536",
    divider2Id: "I313:8467;214:2539",
    valueRowId: "I313:8467;214:2540",
    licenseIconId: "I313:8467;214:2543",
    valueLabelId: "I313:8467;214:2544",
    photoId: "I313:8467;214:2525",
    thumbBgId: "I313:8467;214:2525;81:2442",
    badgeId: "I313:8467;214:2525;214:666",
    endDividerId: "I313:8467;214:2771",
  },
  {
    id: "313:8468",
    messageKey: "topProject",
    quantity: "02",
    values: [{ amount: "15.000.000 VNĐ", captionKey: "perAwardCaption" }],
    badgeImage: "/home/Award_Name_Top_Project.png",
    badgeWidth: 232,
    badgeHeight: 35,
    imageSide: "right",
    wrapId: "I313:8468;214:2928",
    contentId: "I313:8468;214:2618",
    titleFrameId: "I313:8468;214:2620",
    targetIconId: "I313:8468;214:2621",
    titleTextId: "I313:8468;214:2622",
    descTextId: "I313:8468;214:2623",
    divider1Id: "I313:8468;214:2624",
    quantityRowId: "I313:8468;214:2626",
    diamondIconId: "I313:8468;214:2627",
    quantityLabelId: "I313:8468;214:2628",
    divider2Id: "I313:8468;214:2631",
    valueRowId: "I313:8468;214:2632",
    licenseIconId: "I313:8468;214:2635",
    valueLabelId: "I313:8468;214:2636",
    photoId: "I313:8468;214:2617",
    thumbBgId: "I313:8468;214:2617;81:2442",
    badgeId: "I313:8468;214:2617;214:666",
    endDividerId: "I313:8468;214:2896",
  },
  {
    id: "313:8469",
    messageKey: "topProjectLeader",
    quantity: "03",
    values: [{ amount: "7.000.000 VNĐ", captionKey: "perAwardCaption" }],
    badgeImage: "/home/Award_Name_Top_Project_Leader.png",
    badgeWidth: 232,
    badgeHeight: 64,
    imageSide: "left",
    wrapId: "I313:8469;214:2803",
    contentId: "I313:8469;214:2526",
    titleFrameId: "I313:8469;214:2528",
    targetIconId: "I313:8469;214:2529",
    titleTextId: "I313:8469;214:2530",
    descTextId: "I313:8469;214:2531",
    divider1Id: "I313:8469;214:2532",
    quantityRowId: "I313:8469;214:2534",
    diamondIconId: "I313:8469;214:2535",
    quantityLabelId: "I313:8469;214:2536",
    divider2Id: "I313:8469;214:2539",
    valueRowId: "I313:8469;214:2540",
    licenseIconId: "I313:8469;214:2543",
    valueLabelId: "I313:8469;214:2544",
    photoId: "I313:8469;214:2525",
    thumbBgId: "I313:8469;214:2525;81:2442",
    badgeId: "I313:8469;214:2525;214:666",
    endDividerId: "I313:8469;214:2771",
  },
  {
    id: "313:8470",
    messageKey: "bestManager",
    quantity: "01",
    values: [{ amount: "10.000.000 VNĐ", captionKey: "perAwardCaption" }],
    badgeImage: "/home/Award_Name_Best_Manager.png",
    badgeWidth: 232,
    badgeHeight: 30,
    imageSide: "right",
    wrapId: "I313:8470;214:2928",
    contentId: "I313:8470;214:2618",
    titleFrameId: "I313:8470;214:2620",
    targetIconId: "I313:8470;214:2621",
    titleTextId: "I313:8470;214:2622",
    descTextId: "I313:8470;214:2623",
    divider1Id: "I313:8470;214:2624",
    quantityRowId: "I313:8470;214:2626",
    diamondIconId: "I313:8470;214:2627",
    quantityLabelId: "I313:8470;214:2628",
    divider2Id: "I313:8470;214:2631",
    valueRowId: "I313:8470;214:2632",
    licenseIconId: "I313:8470;214:2635",
    valueLabelId: "I313:8470;214:2636",
    photoId: "I313:8470;214:2617",
    thumbBgId: "I313:8470;214:2617;81:2442",
    badgeId: "I313:8470;214:2617;214:666",
    endDividerId: "I313:8470;214:2896",
  },
  {
    id: "313:8471",
    messageKey: "signature2025Creator",
    quantity: "01",
    values: [
      { amount: "5.000.000 VNĐ", captionKey: "individualCaption" },
      { amount: "8.000.000 VNĐ", captionKey: "collectiveCaption", showDivider: true },
    ],
    badgeImage: "/home/Award_Name_Signature_2025_Creator.png",
    badgeWidth: 232,
    badgeHeight: 54,
    imageSide: "left",
    wrapId: "313:8472",
    contentId: "313:8474",
    titleFrameId: "313:8476",
    targetIconId: "313:8477",
    titleTextId: "313:8478",
    descTextId: "313:8479",
    divider1Id: "313:8480",
    quantityRowId: "313:8482",
    diamondIconId: "313:8483",
    quantityLabelId: "313:8484",
    divider2Id: "313:8489",
    valueRowId: "313:8490",
    licenseIconId: "313:8493",
    valueLabelId: "313:8494",
    photoId: "313:8473",
    thumbBgId: "I313:8473;81:2442",
    badgeId: "I313:8473;214:666",
    endDividerId: "313:8509",
  },
  {
    id: "313:8510",
    messageKey: "mvp",
    quantity: "01",
    values: [{ amount: "15.000.000 VNĐ", captionKey: "perAwardCaption" }],
    badgeImage: "/home/Award_Name_MVP.png",
    badgeWidth: 116,
    badgeHeight: 52,
    imageSide: "right",
    wrapId: "I313:8510;214:2928",
    contentId: "I313:8510;214:2618",
    titleFrameId: "I313:8510;214:2620",
    targetIconId: "I313:8510;214:2621",
    titleTextId: "I313:8510;214:2622",
    descTextId: "I313:8510;214:2623",
    divider1Id: "I313:8510;214:2624",
    quantityRowId: "I313:8510;214:2626",
    diamondIconId: "I313:8510;214:2627",
    quantityLabelId: "I313:8510;214:2628",
    divider2Id: "I313:8510;214:2631",
    valueRowId: "I313:8510;214:2632",
    licenseIconId: "I313:8510;214:2635",
    valueLabelId: "I313:8510;214:2636",
    photoId: "I313:8510;214:2617",
    thumbBgId: "I313:8510;214:2617;81:2442",
    badgeId: "I313:8510;214:2617;214:666",
  },
];
