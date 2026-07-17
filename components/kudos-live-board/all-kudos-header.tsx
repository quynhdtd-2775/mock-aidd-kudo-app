import { getTranslations } from "next-intl/server";

// mm:2940:14221 "C.1_Header Giải thưởng" — section title, divider rule and
// "ALL KUDOS" highlighted subtitle above the C_All kudos feed.
export async function AllKudosHeader() {
  const t = await getTranslations("LiveBoard");

  return (
    // mm:2940:14221
    <div className="flex w-full flex-col items-start gap-4">
      {/* mm:2940:14222 */}
      <h2
        className="text-2xl font-bold leading-8 text-white"
        style={{ fontFamily: "var(--font-montserrat)" }}
      >
        {t("sectionTitle")}
      </h2>

      {/* mm:2940:14223 — Rectangle 26 */}
      <div className="h-px w-full bg-[#2E3940]" />

      {/* mm:2940:14224 — Frame 488 */}
      <div className="flex w-full items-center">
        {/* mm:2940:14225 */}
        <p
          className="text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-[#FFEA9E]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {t("allKudosHeading")}
        </p>
      </div>
    </div>
  );
}
