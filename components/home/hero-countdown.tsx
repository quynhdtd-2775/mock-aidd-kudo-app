import { getTranslations } from "next-intl/server";

// mm:2167:9034 (Frame 523) — countdown timer (mms_B1) + event info (mms_B2)

const MONTSERRAT = "var(--font-montserrat)";

// mm:186:2619 — glass digit card 51x82 with "Digital Numbers" digit
function CountdownDigit({ value }: { value: string }) {
  return (
    <div className="relative h-[82px] w-[51px]">
      {/* mm:I…;186:2616 (Rectangle 1) */}
      <div
        className="absolute inset-0 rounded-lg opacity-50 backdrop-blur-[17px]"
        style={{
          border: "0.5px solid rgba(255, 234, 158, 1)",
          background:
            "linear-gradient(180deg, #FFF 0%, rgba(255, 255, 255, 0.10) 100%)",
        }}
      />
      {/* mm:I…;186:2617 */}
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{
          fontFamily: "'Digital Numbers', var(--font-geist-mono), monospace",
          fontWeight: 400,
          fontSize: 49,
          color: "rgba(255, 255, 255, 1)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export async function HeroCountdown() {
  const t = await getTranslations("Hero");

  // mm:2167:9037 (mms_B1.3_Countdown) — every digit card in the design reads "20"
  const COUNTDOWN_UNITS = [
    { id: "2167:9038", label: t("countdownDays"), digits: ["2", "0"] },
    { id: "2167:9043", label: t("countdownHours"), digits: ["2", "0"] },
    { id: "2167:9048", label: t("countdownMinutes"), digits: ["2", "0"] },
  ];

  // mm:2167:9054 (Frame 522)
  const EVENT_FACTS = [
    { id: "2167:9055", label: t("eventTimeLabel"), value: t("eventTimeValue") },
    { id: "2167:9058", label: t("eventLocationLabel"), value: t("eventLocationValue") },
  ];

  return (
    // mm:2167:9034 (Frame 523)
    <div className="flex w-full flex-col items-start gap-4">
      {/* mm:2167:9035 mms_B1_Countdown time */}
      <div className="flex w-full flex-col items-start gap-4">
        {/* mm:2167:9036 mms_B1.2_Coming soon */}
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
          {t("comingSoon")}
        </p>

        {/* mm:2167:9037 mms_B1.3_Countdown */}
        <div className="flex flex-wrap items-center gap-6 lg:gap-10">
          {COUNTDOWN_UNITS.map((unit) => (
            // mm:mms_B1.3.x
            <div key={unit.id} className="flex flex-col justify-center gap-3.5">
              {/* mm:Frame 485 */}
              <div className="flex items-center gap-3.5">
                {unit.digits.map((digit, index) => (
                  <CountdownDigit key={index} value={digit} />
                ))}
              </div>
              <p
                style={{
                  fontFamily: MONTSERRAT,
                  fontWeight: 700,
                  fontSize: 24,
                  lineHeight: "32px",
                  color: "rgba(255, 255, 255, 1)",
                }}
              >
                {unit.label}
              </p>
            </div>
          ))}
        </div>
      </div>

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
