import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { HighlightHeader } from "./highlight-header";
import { HighlightKudoCard } from "./highlight-kudo-card";
import { HIGHLIGHT_KUDOS } from "./highlight-kudo-data";
import { ArrowNavButton } from "./secondary-buttons";

// mm:2940:13451 (B_Highlight) — header + horizontally-scrollable highlight
// cards row (with large left/right nav buttons) + page indicator.

const MONTSERRAT = "var(--font-montserrat)";

export async function HighlightKudosSection() {
  const t = await getTranslations("LiveBoard");

  return (
    // mm:2940:13451
    <div className="flex w-full flex-col items-start gap-10">
      {/* header shares the 1152px centered content column (144px side margins) */}
      <div className="flex w-full justify-center px-4 sm:px-8 lg:px-[144px]">
        <HighlightHeader />
      </div>

      {/* mm:2940:13461 (B.2_HIGHLIGHT KUDOS) */}
      <div className="relative flex w-full items-center">
        {/* mm:2940:13463 (B.2.3_content HIghlight KUDO) */}
        <div className="flex w-full items-center gap-6 overflow-x-auto px-4 py-2 lg:px-[144px]">
          {HIGHLIGHT_KUDOS.map((kudo) => (
            <HighlightKudoCard key={kudo.id} data={kudo} />
          ))}
        </div>

        {/* mm:2940:13469 (Frame 528) — left fade + big prev arrow, desktop only */}
        <div
          className="pointer-events-none absolute left-0 top-0 hidden h-full w-[400px] items-center justify-start pl-20 lg:flex"
          style={{
            background:
              "linear-gradient(90deg, #00101A 50%, rgba(0,16,26,0) 100%)",
          }}
        >
          {/* mm:2940:13470 (B.2.1_Button lùi) */}
          <button
            type="button"
            aria-label={t("prevKudoAriaLabel")}
            className="pointer-events-auto flex h-20 w-20 items-center justify-center rounded p-2.5 transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1 active:translate-y-px"
          >
            {/* mm:I2940:13470;186:1420 (MM_MEDIA_Left) */}
            <Image
              src="/kudos-live-board/icon-arrow-left-lg.svg"
              alt=""
              width={60}
              height={60}
            />
          </button>
        </div>

        {/* mm:2940:13467 (Frame 527) — right fade + big next arrow, desktop only */}
        <div
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-[400px] items-center justify-end pr-10 lg:flex"
          style={{
            background:
              "linear-gradient(270deg, #00101A 50%, rgba(0,16,26,0) 100%)",
          }}
        >
          {/* mm:2940:13468 (B.2.2_Button tiến) */}
          <button
            type="button"
            aria-label={t("nextKudoAriaLabel")}
            className="pointer-events-auto flex h-20 w-20 items-center justify-center rounded p-2.5 transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1 active:translate-y-px"
          >
            {/* mm:I2940:13468;186:1420 (MM_MEDIA_Right) */}
            <Image
              src="/kudos-live-board/icon-arrow-right-lg.svg"
              alt=""
              width={60}
              height={60}
            />
          </button>
        </div>
      </div>

      {/* mm:2940:13471 (B.5_slide) */}
      <div className="flex w-full items-center justify-center gap-8 px-4 lg:px-[144px]">
        {/* mm:2940:13472 (B.5.1_Button lùi) */}
        <ArrowNavButton direction="left" aria-label={t("prevPageAriaLabel")} />
        {/* mm:2940:13473 (B.5.2_số trang) */}
        <span
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 28,
            lineHeight: "36px",
            color: "#999",
          }}
        >
          2/5
        </span>
        {/* mm:2940:13474 (B.5.3_Button tiến) */}
        <ArrowNavButton direction="right" aria-label={t("nextPageAriaLabel")} />
      </div>
    </div>
  );
}
