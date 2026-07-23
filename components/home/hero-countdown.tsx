import { getTranslations } from "next-intl/server";
import { getCachedLaunchAt } from "@/lib/countdown/launch-at-cache";
import { HeroCountdownTiles } from "./hero-countdown-tiles";

// mm:2167:9034 (Frame 523) — countdown timer (mms_B1) + event info (mms_B2)

const MONTSERRAT = "var(--font-montserrat)";

export async function HeroCountdown() {
  const t = await getTranslations("Hero");
  const launchAt = await getCachedLaunchAt();

  // mm:2167:9054 (Frame 522)
  const EVENT_FACTS = [
    { id: "2167:9055", label: t("eventTimeLabel"), value: t("eventTimeValue") },
    { id: "2167:9058", label: t("eventLocationLabel"), value: t("eventLocationValue") },
  ];

  return (
    // mm:2167:9034 (Frame 523)
    <div className="flex w-full flex-col items-start gap-4">
      {/* mm:2167:9035 mms_B1_Countdown time — client tiles: ticks from
          launchAt, hides "Coming soon" at zero, never redirects here */}
      <HeroCountdownTiles
        launchAt={launchAt?.toISOString() ?? null}
        comingSoonLabel={t("comingSoon")}
        labels={{
          days: t("countdownDays"),
          hours: t("countdownHours"),
          minutes: t("countdownMinutes"),
        }}
      />

      {/* mm:2167:9053 mms_B2_Thông tin sự kiện */}
      <div className="flex flex-col items-start gap-2">
        {/* mm:2167:9054 (Frame 522) */}
        <div className="flex flex-wrap items-center gap-6 lg:gap-[60px]">
          {EVENT_FACTS.map((fact) => (
            <p key={fact.id} className="flex items-center gap-1">
              <span
                style={{
                  fontFamily: MONTSERRAT,
                  fontWeight: 700,
                  fontSize: 16,
                  lineHeight: "24px",
                  letterSpacing: "0.15px",
                  color: "rgba(255, 255, 255, 1)",
                }}
              >
                {fact.label}
              </span>
              <span
                style={{
                  fontFamily: MONTSERRAT,
                  fontWeight: 700,
                  fontSize: 24,
                  lineHeight: "32px",
                  color: "rgba(255, 234, 158, 1)",
                }}
              >
                {fact.value}
              </span>
            </p>
          ))}
        </div>

        {/* mm:2167:9061 */}
        <p
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "0.5px",
            color: "rgba(255, 255, 255, 1)",
          }}
        >
          {t("livestreamNote")}
        </p>
      </div>
    </div>
  );
}
