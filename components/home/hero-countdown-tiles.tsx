"use client";

import { useMemo } from "react";
import { useCountdown } from "@/lib/countdown/use-countdown";

// mm:2167:9035 mms_B1_Countdown time + mm:2167:9037 mms_B1.3_Countdown

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

type HeroCountdownTilesProps = {
  /** ISO datetime the countdown ticks down to, fetched server-side by
   * `HeroCountdown` from `event_settings.launch_at`. `null` when the data
   * source is unavailable — renders a static "00 00 00" fallback. */
  launchAt: string | null;
  /** mms 2167:9036 "Coming soon" copy — hidden once the countdown completes. */
  comingSoonLabel: string;
  /** mms_B1.3.x unit labels (Hero.countdownDays/Hours/Minutes), passed down
   * from the server component since messages/*.json is owned by Track A. */
  labels: { days: string; hours: string; minutes: string };
};

/**
 * Client tiles for the homepage hero countdown. Ticks every second via
 * `useCountdown` with `redirectOnZero: false` — unlike the prelaunch page,
 * the homepage must stay put (no redirect) once the countdown reaches zero,
 * showing a static "00 00 00" and hiding "Coming soon" instead.
 */
export function HeroCountdownTiles({
  launchAt,
  comingSoonLabel,
  labels,
}: HeroCountdownTilesProps) {
  const launchAtDate = useMemo(
    () => (launchAt ? new Date(launchAt) : null),
    [launchAt]
  );
  const { days, hours, minutes, isComplete } = useCountdown(launchAtDate, {
    redirectOnZero: false,
  });

  // mm:2167:9037 (Frame 522) — every digit card in the design reads "20"
  const COUNTDOWN_UNITS = [
    { id: "2167:9038", label: labels.days, value: days },
    { id: "2167:9043", label: labels.hours, value: hours },
    { id: "2167:9048", label: labels.minutes, value: minutes },
  ];

  return (
    <div className="flex w-full flex-col items-start gap-4">
      {/* mm:2167:9036 mms_B1.2_Coming soon — hidden once the countdown hits zero */}
      {!isComplete && (
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
          {comingSoonLabel}
        </p>
      )}

      {/* mm:2167:9037 mms_B1.3_Countdown */}
      <div className="flex flex-wrap items-center gap-6 lg:gap-10">
        {COUNTDOWN_UNITS.map((unit) => (
          // mm:mms_B1.3.x
          <div key={unit.id} className="flex flex-col justify-center gap-3.5">
            {/* mm:Frame 485 */}
            <div className="flex items-center gap-3.5">
              {unit.value.split("").map((digit, index) => (
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
  );
}
