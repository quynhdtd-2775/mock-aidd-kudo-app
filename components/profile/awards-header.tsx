import { getTranslations } from "next-intl/server";
import { DownIcon } from "../kudos-live-board/secondary-buttons";

export interface AwardsHeaderProps {
  title?: string;
  kudosTitle?: string;
  navigationLabel?: string;
}

// mm:362:5084 (mms_C_Header Giải thưởng) — page title + divider + big
// "KUDOS" heading with a static-look "Đã gửi (n)" dropdown button. No real
// dropdown logic here — presentational only, per plan scope.
export async function AwardsHeader({
  title,
  kudosTitle,
  navigationLabel,
}: AwardsHeaderProps) {
  const t = await getTranslations("Profile");
  const resolvedTitle = title ?? t("awardsTitle");
  const resolvedKudosTitle = kudosTitle ?? t("kudosHeading");
  const resolvedNavigationLabel =
    navigationLabel ?? t("sentCount", { count: 5 });

  return (
    // mm:362:5084
    <div className="flex w-full flex-col items-center justify-center gap-4">
      {/* mm:362:5085 — mms_C.1_title */}
      <h2
        className="w-full text-left text-2xl font-bold leading-8 text-white"
        style={{ fontFamily: "var(--font-montserrat)" }}
      >
        {resolvedTitle}
      </h2>

      {/* mm:362:5086 — Rectangle 26 */}
      <div className="h-px w-full bg-[#2E3940]" />

      {/* mm:362:5087 — Frame 488 */}
      <div className="flex w-full items-center justify-between gap-8">
        {/* mm:362:5088 — mms_C.2_KUDOS title */}
        <h1
          className="text-left text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-[#FFEA9E]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {resolvedKudosTitle}
        </h1>

        {/* mm:362:5089 — mms_C.3_Button */}
        <button
          type="button"
          className="flex shrink-0 items-center gap-2 self-stretch rounded border border-[#998C5F] bg-[rgba(255,234,158,0.10)] px-6 py-4 text-white transition-colors duration-200 hover:bg-[rgba(255,234,158,0.20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
        >
          {/* mm:I362:5089;186:2760 */}
          <span
            className="text-center text-base font-bold leading-6 tracking-[0.15px]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {resolvedNavigationLabel}
          </span>
          {/* mm:I362:5089;186:2761 — Button down */}
          <DownIcon />
        </button>
      </div>
    </div>
  );
}
