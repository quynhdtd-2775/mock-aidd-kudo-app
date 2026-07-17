import Image from "next/image";
import Link from "next/link";
import { Montserrat, Montserrat_Alternates } from "next/font/google";
import { getTranslations } from "next-intl/server";

/**
 * mm:5001:14800 — SiteFooter: bordered footer with logo, nav links, and
 * copyright notice. Copyright uses Montserrat Alternates; everything else
 * uses Montserrat, per the design. Static/presentational — no business logic.
 */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700"],
});

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["700"],
});

export async function SiteFooter() {
  const t = await getTranslations("Footer");

  return (
    // mm:5001:14800
    <footer
      className={`${montserrat.className} flex w-full flex-col items-center justify-between gap-8 border-t border-[#2E3940] px-4 py-8 sm:px-8 sm:py-10 lg:flex-row lg:gap-0 lg:px-[90px]`}
    >
      {/* mm:I5001:14800;342:1407 */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8 lg:gap-[80px]">
        {/* mm:I5001:14800;342:1408 */}
        <div className="relative h-[64px] w-[69px] shrink-0">
          {/* mm:I5001:14800;342:1408;178:1030 */}
          <Image
            src="/home/Logo.png"
            alt="SAA 2025"
            fill
            className="object-cover"
          />
        </div>

        {/* mm:I5001:14800;342:1409 */}
        <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 lg:gap-[48px]">
          {/* mm:I5001:14800;342:1410 */}
          <Link
            href="/home-page-saa"
            className="flex cursor-pointer items-center gap-1 rounded-sm p-4 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
          >
            {/* mm:I5001:14800;342:1410;186:1937 */}
            <div className="flex items-center gap-1">
              {/* mm:I5001:14800;342:1410;186:1439 */}
              <span className="w-[137px] text-center text-base font-bold leading-6 tracking-[0.15px] text-white">
                {t("navAbout")}
              </span>
            </div>
          </Link>

          {/* mm:I5001:14800;342:1411 */}
          <Link
            href="/home-awards-page"
            className="flex cursor-pointer items-center gap-1 rounded-sm bg-[rgba(255,234,158,0.1)] p-4 transition-colors duration-200 hover:bg-[rgba(255,234,158,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
          >
            {/* mm:I5001:14800;342:1411;186:2012 */}
            <div className="flex items-center gap-1">
              {/* mm:I5001:14800;342:1411;186:1497 */}
              <span
                className="w-[161px] text-center text-base font-bold leading-6 tracking-[0.15px] text-white"
                style={{
                  textShadow:
                    "0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287",
                }}
              >
                {t("navAwardInfo")}
              </span>
            </div>
          </Link>

          {/* mm:I5001:14800;342:1412 */}
          <div
            tabIndex={0}
            className="flex cursor-pointer items-center gap-1 rounded-sm p-4 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
          >
            {/* mm:I5001:14800;342:1412;186:1937 */}
            <div className="flex items-center gap-1">
              {/* mm:I5001:14800;342:1412;186:1439 */}
              <span className="w-[98px] text-center text-base font-bold leading-6 tracking-[0.15px] text-white">
                {t("navSunKudos")}
              </span>
            </div>
          </div>

          {/* mm:I5001:14800;1161:9487 */}
          <div
            tabIndex={0}
            className="flex cursor-pointer items-center gap-1 rounded-sm p-4 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
          >
            {/* mm:I5001:14800;1161:9487;186:1937 */}
            <div className="flex items-center gap-1">
              {/* mm:I5001:14800;1161:9487;186:1439 */}
              <span className="w-[154px] text-center text-base font-bold leading-6 tracking-[0.15px] text-white">
                {t("navCommonStandard")}
              </span>
            </div>
          </div>
        </nav>
      </div>

      {/* mm:I5001:14800;342:1413 */}
      <p
        className={`${montserratAlternates.className} w-full max-w-[275px] text-center text-base font-bold leading-6 text-white`}
      >
        {t("copyright")}
      </p>
    </footer>
  );
}
