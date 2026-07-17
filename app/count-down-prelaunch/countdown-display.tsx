"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useCountdown } from "@/lib/countdown/use-countdown";
import { CountdownUnit } from "./countdown-unit";

type CountdownDisplayProps = {
  /**
   * ISO datetime the countdown ticks down to (`event_settings.launch_at`,
   * fetched server-side). `null` when the data source is unavailable —
   * renders a static "00 00 00" fallback instead of crashing the public page.
   */
  targetDate: string | null;
  /** mms 2268:35137 "Awards Information Navigation Links" — countdown title. */
  title: string;
};

/**
 * mms 2268:35136 "Countdown time" — title + ticking Days/Hours/Minutes
 * tiles. Client component so it can update every second; ticking, range
 * clamping, and the one-shot at-zero redirect to "/" live in
 * lib/countdown/use-countdown.ts.
 */
export function CountdownDisplay({ targetDate, title }: CountdownDisplayProps) {
  // Reuses the "Hero" namespace: these unit labels are identical to the
  // home page's countdown widget (Hero.countdownDays/Hours/Minutes).
  const t = useTranslations("Hero");
  const launchAt = useMemo(
    () => (targetDate ? new Date(targetDate) : null),
    [targetDate],
  );
  const { days, hours, minutes } = useCountdown(launchAt);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-[36px] leading-[48px] font-bold text-white">
        {title}
      </p>
      <div className="flex flex-row items-center gap-[60px]">
        <CountdownUnit value={days} label={t("countdownDays")} />
        <CountdownUnit value={hours} label={t("countdownHours")} />
        <CountdownUnit value={minutes} label={t("countdownMinutes")} />
      </div>
    </div>
  );
}
