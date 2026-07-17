import { getTranslations } from "next-intl/server";
import { AWARD_CARDS, AwardCard } from "./award-card";

const GOLD = "rgba(255, 234, 158, 1)";
const DIVIDER_COLOR = "rgba(46, 57, 64, 1)";

export async function AwardsSection() {
  const t = await getTranslations("Awards");

  return (
    // mm:2167:9068 — section "Hệ thống giải thưởng"
    <section className="flex w-full flex-col gap-12 lg:gap-20">
      {/* mm:2167:9069 — mms_C1_Header Giải thưởng */}
      <div className="flex w-full flex-col items-start gap-4">
        {/* mm:2167:9070 */}
        <p
          style={{
            fontFamily: "var(--font-montserrat)",
            fontWeight: 700,
            fontSize: 24,
            lineHeight: "32px",
            color: "rgba(255, 255, 255, 1)",
          }}
        >
          {t("sectionLabel")}
        </p>
        {/* mm:2167:9071 */}
        <div className="h-px w-full" style={{ backgroundColor: DIVIDER_COLOR }} />
        {/* mm:2167:9072 / mm:2167:9073 */}
        <h2
          className="text-[32px] leading-10 lg:text-[57px] lg:leading-[64px]"
          style={{
            fontFamily: "var(--font-montserrat)",
            fontWeight: 700,
            letterSpacing: "-0.25px",
            color: GOLD,
          }}
        >
          {t("sectionTitle")}
        </h2>
      </div>

      {/* mm:5005:14974 — mms_C2_Award list (rows mm:2167:9074 / mm:2167:9078) */}
      <div className="grid w-full grid-cols-1 justify-items-center gap-x-10 gap-y-12 sm:grid-cols-2 sm:justify-items-start lg:grid-cols-[repeat(3,336px)] lg:justify-between lg:gap-y-20">
        {AWARD_CARDS.map((card) => (
          <AwardCard
            key={card.id}
            card={card}
            title={t(`cards.${card.messageKey}.title`)}
            description={t(`cards.${card.messageKey}.description`)}
            detailsLabel={t("detailsButton")}
          />
        ))}
      </div>
    </section>
  );
}
