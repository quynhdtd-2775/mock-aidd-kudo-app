import Image from "next/image";
import { Montserrat } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { LiveBoardNav } from "./live-board-nav";
import { LiveBoardHeaderActions } from "./live-board-header-actions";

/**
 * mm:2940:13433 — LiveBoardHeader: semi-transparent bar pinned to the top of
 * the Sun* Kudos - Live board screen. Logo + nav links on the left,
 * language / notification / profile icons on the right. Presentational
 * only — no navigation wiring.
 */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700"],
});

export async function LiveBoardHeader() {
  const t = await getTranslations("LiveBoard");

  return (
    // mm:2940:13433
    <header
      className={`${montserrat.className} absolute left-0 top-0 z-[1] flex w-full flex-wrap items-center justify-between gap-4 bg-[rgba(16,20,23,0.8)] px-4 py-3 sm:px-8 md:flex-nowrap lg:px-[144px]`}
    >
      {/* mm:I2940:13433;186:2166 */}
      <div className="flex flex-wrap items-center gap-4 md:gap-8 lg:gap-[64px]">
        {/* mm:I2940:13433;178:1033 */}
        <div className="relative h-[48px] w-[52px] shrink-0">
          {/* mm:I2940:13433;178:1033;178:1030 */}
          <Image
            src="/kudos-live-board/sun-logo.png"
            alt={t("kudosLogoAlt")}
            fill
            className="object-cover"
          />
        </div>

        <LiveBoardNav />
      </div>

      <LiveBoardHeaderActions />
    </header>
  );
}
