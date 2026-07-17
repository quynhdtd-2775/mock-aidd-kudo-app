import { getTranslations } from "next-intl/server";

// mm:2940:13476 (B.6_Header Giải thưởng) — section title, divider, and the
// "SPOTLIGHT BOARD" heading that sits above the awards spotlight panel.

const MONTSERRAT = "var(--font-montserrat)";

export async function SpotlightHeader() {
  const t = await getTranslations("LiveBoard");

  return (
    // mm:2940:13476
    <div className="flex w-full max-w-[1152px] flex-col items-start gap-4">
      {/* mm:2940:13477 */}
      <p
        className="w-full text-left"
        style={{
          fontFamily: MONTSERRAT,
          fontWeight: 700,
          fontSize: 24,
          lineHeight: "32px",
          color: "rgba(255, 255, 255, 1)",
        }}
      >
        {t("sectionTitle")}
      </p>

      {/* mm:2940:13478 (Rectangle 26) */}
      <div className="h-px w-full bg-[#2E3940]" />

      {/* mm:2940:13479 (Frame 488) */}
      <div className="flex w-full items-center">
        {/* mm:2940:13480 */}
        <p
          className="text-left text-4xl leading-11 lg:text-[57px] lg:leading-16"
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            letterSpacing: "-0.25px",
            color: "rgba(255, 234, 158, 1)",
          }}
        >
          {t("spotlightHeading")}
        </p>
      </div>
    </div>
  );
}
