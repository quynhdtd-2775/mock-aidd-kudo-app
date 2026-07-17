import Image from "next/image";
import { getTranslations } from "next-intl/server";

// mm:435:3154 "Header cuối" — bottom-of-page footer bar: Sun* logo on the
// left, nav links, copyright notice on the right. Same shared footer
// component as the other SAA 2025 screens. Static/presentational only.
// Reuses the "Footer" namespace since the nav labels and copyright text are
// identical to components/home/site-footer.tsx.
export async function ProfileFooter() {
  const t = await getTranslations("Footer");

  return (
    // mm:435:3154
    <footer className="flex w-full flex-col items-center justify-between gap-6 border-t border-[#2E3940] bg-[#00101A] px-4 py-8 sm:flex-row sm:px-8 lg:px-[90px] lg:py-10">
      {/* mm:I435:3154;342:1407 — logo + nav links */}
      <div className="flex flex-col items-center gap-6 sm:flex-row lg:gap-10">
        {/* mm:I435:3154;342:1408 — LOGO */}
        <div className="relative h-16 w-[69px] shrink-0">
          {/* mm:I435:3154;342:1408;178:1030 — MM_MEDIA_Logo */}
          <Image
            src="/profile/sun-logo-footer.png"
            alt="Sun*"
            fill
            className="object-cover"
          />
        </div>

        {/* mm:I435:3154;342:1409 — Frame 476 nav buttons */}
        <nav
          className="flex flex-wrap items-center justify-center gap-2 text-base font-bold leading-6 tracking-[0.15px] lg:gap-4"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {/* mm:I435:3154;342:1410 */}
          <span className="cursor-pointer whitespace-nowrap rounded p-4 text-white transition-colors duration-200 hover:bg-white/5">
            {t("navAbout")}
          </span>
          {/* mm:I435:3154;342:1411 */}
          <span className="cursor-pointer whitespace-nowrap rounded p-4 text-white transition-colors duration-200 hover:bg-white/5">
            {t("navAwardInfo")}
          </span>
          {/* mm:I435:3154;342:1412 */}
          <span className="cursor-pointer whitespace-nowrap rounded p-4 text-white transition-colors duration-200 hover:bg-white/5">
            {t("navSunKudos")}
          </span>
          {/* mm:I435:3154;1161:9487 — active tab, yellow tint bg */}
          <span className="cursor-pointer whitespace-nowrap rounded bg-[rgba(255,234,158,0.1)] p-4 text-[#FFEA9E]">
            {t("navCommonStandard")}
          </span>
        </nav>
      </div>

      {/* mm:I435:3154;342:1413 */}
      <p
        className="text-center text-base font-bold leading-6 text-white"
        style={{ fontFamily: "var(--font-montserrat)" }}
      >
        {t("copyright")}
      </p>
    </footer>
  );
}
