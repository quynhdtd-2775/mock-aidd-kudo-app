import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCachedLaunchAt } from "@/lib/countdown/launch-at-cache";
import { montserrat } from "./countdown-fonts";
import { CountdownDisplay } from "./countdown-display";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Countdown");
  return {
    title: t("metaTitle"),
  };
}

/**
 * mms 2268:35127 "Countdown - Prelaunch page" — full-viewport countdown
 * screen shown before an event goes live. Fetches `event_settings.launch_at`
 * server-side; `null` (DB down) degrades to a static "00 00 00" display.
 */
export default async function CountdownPrelaunchPage() {
  const launchAt = await getCachedLaunchAt();
  const t = await getTranslations("Countdown");
  return (
    <div
      className={`${montserrat.className} relative flex min-h-screen w-full flex-1 flex-col overflow-hidden bg-[#00101a]`}
      data-name="Countdown - Prelaunch page"
    >
      {/* mms 2268:35129 "MM_MEDIA_BG Image" — full-bleed background artwork */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/count-down-prelaunch/background.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* mms 2268:35130 "Cover" — diagonal darkening gradient for text contrast */}
      <div className="absolute inset-0 bg-[linear-gradient(18deg,#00101A_15.48%,rgba(0,18,29,0.46)_52.13%,rgba(0,19,32,0)_63.41%)]" />

      <main className="relative flex flex-1 items-center justify-center px-6 py-24 sm:px-16 lg:px-36">
        <CountdownDisplay
          targetDate={launchAt ? launchAt.toISOString() : null}
          title={t("heroTitle")}
        />
      </main>
    </div>
  );
}
