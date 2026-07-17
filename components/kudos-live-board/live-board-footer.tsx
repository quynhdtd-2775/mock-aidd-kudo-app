import Image from "next/image";
import { getTranslations } from "next-intl/server";

// mm:2940:13522 "Header cuối" — bottom-of-page footer bar: Sun* logo on the
// left, copyright notice on the right. Static/presentational only.
export async function LiveBoardFooter() {
  const t = await getTranslations("Footer");
  const tLiveBoard = await getTranslations("LiveBoard");

  return (
    // mm:2940:13522
    <footer className="flex w-full flex-col items-center justify-between gap-6 border-t border-[#2E3940] bg-[#00101A] px-4 py-8 sm:px-8 sm:flex-row lg:px-[90px] lg:py-10">
      {/* mm:I2940:13522;342:1407 — logo + nav links */}
      <div className="flex flex-col items-center gap-6 sm:flex-row lg:gap-10">
        {/* mm:I2940:13522;342:1408 — LOGO */}
        <div className="relative h-16 w-[69px] shrink-0">
          {/* mm:I2940:13522;342:1408;178:1030 — MM_MEDIA_Logo */}
          <Image
            src="/kudos-live-board/sun-logo-footer.png"
            alt={tLiveBoard("sunLogoAlt")}
            fill
            className="object-cover"
          />
        </div>

        {/* mm:I2940:13522;342:1409 — Frame 476 nav buttons */}
        <nav
          className="flex flex-wrap items-center justify-center gap-2 text-base font-bold leading-6 tracking-[0.15px] lg:gap-4"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {/* mm:I2940:13522;342:1410 */}
          <span className="cursor-pointer whitespace-nowrap rounded p-4 text-white transition-colors duration-200 hover:bg-white/5">
            {t("navAbout")}
          </span>
          {/* mm:I2940:13522;342:1411 */}
          <span className="cursor-pointer whitespace-nowrap rounded p-4 text-white transition-colors duration-200 hover:bg-white/5">
            {t("navAwardInfo")}
          </span>
          {/* mm:I2940:13522;342:1412 — active tab, yellow tint bg */}
          <span className="cursor-pointer whitespace-nowrap rounded bg-[rgba(255,234,158,0.1)] p-4 text-[#FFEA9E]">
            {t("navSunKudos")}
          </span>
          {/* mm:I2940:13522;1161:9487 */}
          <span className="cursor-pointer whitespace-nowrap rounded p-4 text-white transition-colors duration-200 hover:bg-white/5">
            {t("navCommonStandard")}
          </span>
        </nav>
      </div>

      {/* mm:I2940:13522;342:1413 — Figma uses "Montserrat Alternates"; that
          family isn't loaded in this project, so it falls back to the shared
          Montserrat font already used across the screen. */}
      <p
        className="text-center text-base font-bold leading-6 text-white"
        style={{ fontFamily: "var(--font-montserrat)" }}
      >
        {t("copyright")}
      </p>
    </footer>
  );
}
