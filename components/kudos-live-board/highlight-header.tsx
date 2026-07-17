import { getTranslations } from "next-intl/server";
import { DropdownFilterButton } from "./secondary-buttons";

// mm:2940:13452 (B.1_header -> Header Giải thưởng, node 2940:13453)
// Section title, divider, HIGHLIGHT KUDOS heading + hashtag/department filters.

const MONTSERRAT = "var(--font-montserrat)";

export async function HighlightHeader() {
  const t = await getTranslations("LiveBoard");

  return (
    // mm:2940:13453 (Header Giải thưởng)
    <div className="flex w-full max-w-[1152px] flex-col items-start gap-4">
      {/* mm:2940:13454 */}
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

      {/* mm:2940:13455 (Rectangle 26) */}
      <div className="h-px w-full bg-[#2E3940]" />

      {/* mm:2940:13456 (Frame 488) */}
      <div className="flex w-full flex-wrap items-center justify-between gap-6">
        {/* mm:2940:13457 */}
        <p
          className="text-left text-4xl leading-[44px] lg:text-[57px] lg:leading-[64px]"
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            letterSpacing: "-0.25px",
            color: "rgba(255, 234, 158, 1)",
          }}
        >
          {t("highlightHeading")}
        </p>

        {/* mm:2940:13458 (Buttons) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* mm:2940:13459 (B.1.1_ButtonHashtag) */}
          <DropdownFilterButton label={t("filterHashtag")} />
          {/* mm:2940:13460 (B.1.2_Button Phong ban) */}
          <DropdownFilterButton label={t("filterDepartment")} />
        </div>
      </div>
    </div>
  );
}
