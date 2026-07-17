import Link from "next/link";
import { getTranslations } from "next-intl/server";

/**
 * mm:I2940:13433;178:653 — Header nav links. "Sun* Kudos" is the active tab
 * on this screen (Sun* Kudos - Live board). Routes: homepage lives at
 * /home-page-saa, awards system at /home-awards-page.
 */
export async function LiveBoardNav() {
  const t = await getTranslations("Header");

  return (
    // mm:I2940:13433;178:653
    <nav className="flex flex-wrap items-center gap-1 md:gap-2 lg:gap-[24px]">
      {/* mm:I2940:13433;186:1579 */}
      <Link
        href="/home-page-saa"
        className="flex cursor-pointer items-center gap-1 rounded-[4px] p-4 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
      >
        {/* mm:I2940:13433;186:1579;186:1937 */}
        <div className="flex items-center gap-1">
          {/* mm:I2940:13433;186:1579;186:1439 */}
          <span className="whitespace-nowrap text-center text-base font-bold leading-6 tracking-[0.15px] text-white transition-colors duration-200">
            {t("navAbout")}
          </span>
        </div>
      </Link>

      {/* mm:I2940:13433;186:1587 */}
      <Link
        href="/home-awards-page"
        className="flex cursor-pointer items-center gap-1 rounded-[4px] p-4 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
      >
        {/* mm:I2940:13433;186:1587;186:1937 */}
        <div className="flex items-center gap-1">
          {/* mm:I2940:13433;186:1587;186:1439 */}
          <span className="w-[141px] text-center text-sm font-bold leading-5 tracking-[0.1px] text-white transition-colors duration-200">
            {t("navAwardInfo")}
          </span>
        </div>
      </Link>

      {/* mm:I2940:13433;186:1593 — active tab (current screen) */}
      <Link
        href="/kudos-live-board"
        className="flex cursor-pointer items-center gap-1 border-b border-[#FFEA9E] p-4 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
      >
        {/* mm:I2940:13433;186:1593;186:2013 */}
        <div className="flex items-center gap-1">
          {/* mm:I2940:13433;186:1593;186:1502 */}
          <span
            className="w-[98px] text-center text-base font-bold leading-6 tracking-[0.15px] text-[#FFEA9E]"
            style={{
              textShadow: "0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287",
            }}
          >
            {t("navSunKudos")}
          </span>
        </div>
      </Link>
    </nav>
  );
}
