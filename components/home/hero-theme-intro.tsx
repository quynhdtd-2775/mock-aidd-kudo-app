import Image from "next/image";
import { getTranslations } from "next-intl/server";

// mm:3204:10152 (Frame 486) — "Root Further" theme introduction block

const MONTSERRAT = "var(--font-montserrat)";

const BODY_STYLE = {
  fontFamily: MONTSERRAT,
  fontWeight: 700,
  fontSize: 24,
  lineHeight: "32px",
  color: "rgba(255, 255, 255, 1)",
} as const;

export async function HeroThemeIntro() {
  const t = await getTranslations("Hero");

  return (
    // mm:3204:10152 — 1152px wide, centered inside the 1224px content column
    <div className="mx-auto flex w-full max-w-[1152px] flex-col items-center gap-8 rounded-lg">
      {/* mm:3204:10153 (Group 434) — Root / Further wordmark composition */}
      <div className="relative h-[134px] w-[290px]">
        {/* mm:3204:10155 MM_MEDIA_Root Text */}
        <Image
          src="/home/Root_Text.png"
          alt="Root"
          width={189}
          height={67}
          className="absolute left-[51px] top-0 h-[67px] w-[189px]"
        />
        {/* mm:3204:10154 MM_MEDIA_Further Text */}
        <Image
          src="/home/Further_Text.png"
          alt="Further"
          width={290}
          height={67}
          className="absolute left-0 top-[67px] h-[67px] w-[290px]"
        />
      </div>

      {/* mm:5001:14827 (mms_B4_content) */}
      <div className="flex w-full flex-col gap-8">
        {/* mm:3204:10156 */}
        <p className="whitespace-pre-line text-justify" style={BODY_STYLE}>
          {t("themeParagraphOne")}
        </p>

        {/* mm:3204:10161 */}
        <p
          className="whitespace-pre-line text-center"
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 20,
            lineHeight: "32px",
            color: "#FFF",
          }}
        >
          {t("themeQuote")}
        </p>

        {/* mm:3204:10162 */}
        <p className="whitespace-pre-line text-justify" style={BODY_STYLE}>
          {t("themeParagraphTwo")}
        </p>
      </div>
    </div>
  );
}
