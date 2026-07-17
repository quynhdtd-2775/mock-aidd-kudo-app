import { getTranslations } from "next-intl/server";
import type { HighlightKudoData } from "./highlight-kudo-data";
import {
  DetailArrowIcon,
  HeartIcon,
  LinkIcon,
  TransferArrowIcon,
} from "./highlight-kudo-icons";
import { HighlightPersonInfo } from "./highlight-person-info";

// mm:335:9620 (KUDO - Highlight component) — a single highlighted kudos
// card: sender -> receiver, award title, thank-you message, hashtags,
// heart count and Copy Link / Xem chi tiết actions. Reused 3x in
// HighlightKudosSection (mm:2940:13464 / 2940:13465 / 2940:13466).

const MONTSERRAT = "var(--font-montserrat)";

export async function HighlightKudoCard({ data }: { data: HighlightKudoData }) {
  const t = await getTranslations("LiveBoard");
  const {
    timestamp,
    awardTitle,
    senderName,
    senderAvatar,
    senderBadge,
    receiverName,
    receiverAvatar,
    receiverBadge,
    message,
    hashtags,
    likeCount,
    showDetailButton,
  } = data;

  return (
    // mm:335:9620 (KUDO - Highlight)
    <article
      className="flex w-full max-w-[528px] shrink-0 flex-col items-start gap-4 rounded-2xl px-6 pb-4 pt-6"
      style={{ border: "4px solid #FFEA9E", background: "#FFF8E1" }}
    >
      {/* mm:335:9442 (Frame 482) */}
      <div className="flex w-full items-start justify-between gap-6">
        <HighlightPersonInfo name={senderName} avatar={senderAvatar} badge={senderBadge} />

        {receiverName && receiverAvatar && (
          <>
            {/* mm:335:9444 (Frame 484) */}
            <div className="flex items-start py-4 text-[#00101A]">
              <TransferArrowIcon />
            </div>
            <HighlightPersonInfo
              name={receiverName}
              avatar={receiverAvatar}
              badge={receiverBadge ?? ""}
            />
          </>
        )}
      </div>

      {/* mm:335:9447 (Rectangle 14) */}
      <div className="h-px w-full bg-[#FFEA9E]" />

      {/* mm:335:9448 (Content) */}
      <div className="flex w-full flex-col items-end gap-4">
        <p
          className="w-full text-left"
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "0.5px",
            color: "#999",
          }}
        >
          {timestamp}
        </p>
        <p
          className="w-full text-center"
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "0.5px",
            color: "#00101A",
          }}
        >
          {awardTitle}
        </p>

        {/* mm:662:12221 (Frame 425) */}
        <div
          className="flex w-full flex-1 items-start gap-2.5 self-stretch rounded-xl px-6 py-4"
          style={{ border: "1px solid #FFEA9E", background: "rgba(255,234,158,0.40)" }}
        >
          <p
            className="w-full text-justify"
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 700,
              fontSize: 20,
              lineHeight: "32px",
              color: "#00101A",
            }}
          >
            {message}
          </p>
        </div>

        <p
          className="w-full text-left"
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "0.5px",
            color: "#D4271D",
          }}
        >
          {hashtags}
        </p>
      </div>

      {/* mm:335:9460 (Rectangle 15) */}
      <div className="h-px w-full bg-[#FFEA9E]" />

      {/* mm:335:9461 (Frame 485) */}
      <div className="flex w-full flex-wrap items-center justify-between gap-6">
        {/* mm:335:9462 (Hearts) */}
        <div className="flex items-center gap-1 text-[#00101A]">
          <span
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 700,
              fontSize: 24,
              lineHeight: "32px",
              color: "#00101A",
            }}
          >
            {likeCount}
          </span>
          <span className="text-[#E73928]">
            <HeartIcon />
          </span>
        </div>

        {/* mm:335:9672 (Buttons) */}
        <div className="flex items-center gap-2 text-[#00101A]">
          <button
            type="button"
            className="flex items-center gap-1 rounded p-4 transition-colors duration-200 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1 active:translate-y-px"
          >
            <span
              style={{
                fontFamily: MONTSERRAT,
                fontWeight: 700,
                fontSize: 16,
                lineHeight: "24px",
                letterSpacing: "0.15px",
              }}
            >
              {t("copyLink")}
            </span>
            <LinkIcon />
          </button>

          {showDetailButton && (
            <button
              type="button"
              className="flex items-center gap-1 rounded p-4 transition-colors duration-200 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1 active:translate-y-px"
            >
              <span
                style={{
                  fontFamily: MONTSERRAT,
                  fontWeight: 700,
                  fontSize: 16,
                  lineHeight: "24px",
                  letterSpacing: "0.15px",
                }}
              >
                {t("viewDetail")}
              </span>
              <DetailArrowIcon />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
