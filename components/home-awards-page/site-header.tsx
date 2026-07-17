import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/auth-service";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locale-config";
import { LanguageSwitcher } from "@/components/home/language-switcher";
import { UserMenu } from "@/components/home/user-menu";

/**
 * mm:313:8440 — SiteHeader: semi-transparent bar pinned to the top of the
 * home/awards screen. Logo + nav links on the left, language / notification /
 * profile menu (with logout) on the right.
 */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700"],
});

export async function SiteHeader() {
  // Auth facade: mock user while AUTH_MODE=mock, Supabase session otherwise.
  const user = await getCurrentUser();
  const t = await getTranslations("Header");
  const locale = await getLocale();

  return (
    // mm:313:8440
    <header
      className={`${montserrat.className} absolute left-0 top-0 z-[1] flex w-full flex-wrap items-center justify-between gap-4 bg-[rgba(16,20,23,0.8)] px-4 py-3 sm:px-8 md:flex-nowrap lg:px-[144px]`}
    >
      {/* mm:I313:8440;186:2166 */}
      <div className="flex flex-wrap items-center gap-4 md:gap-8 lg:gap-[64px]">
        {/* mm:I313:8440;178:1033 */}
        <div className="relative h-[48px] w-[52px] shrink-0">
          {/* mm:I313:8440;178:1033;178:1030 */}
          <Image
            src="/home/Logo.png"
            alt="SAA 2025"
            fill
            className="object-cover"
          />
        </div>

        {/* mm:I313:8440;178:653 */}
        <nav className="flex flex-wrap items-center gap-1 md:gap-2 lg:gap-[24px]">
          {/* mm:I313:8440;186:1579 */}
          <Link
            href="/home-page-saa"
            className="flex cursor-pointer items-center gap-1 rounded-[4px] p-4 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
          >
            {/* mm:I313:8440;186:1579;186:1937 */}
            <div className="flex items-center gap-1">
              {/* mm:I313:8440;186:1579;186:1439 */}
              <span className="w-[137px] text-center text-base font-bold leading-6 tracking-[0.15px] text-white transition-colors duration-200">
                {t("navAbout")}
              </span>
            </div>
          </Link>

          {/* mm:I313:8440;186:1587 */}
          <Link
            href="/home-awards-page"
            className="flex cursor-pointer items-center gap-1 border-b border-[#FFEA9E] p-4 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
          >
            {/* mm:I313:8440;186:1587;186:2013 */}
            <div className="flex items-center gap-1">
              {/* mm:I313:8440;186:1587;186:1502 */}
              <span
                className="w-[161px] text-center text-base font-bold leading-6 tracking-[0.15px] text-[#FFEA9E]"
                style={{
                  textShadow:
                    "0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287",
                }}
              >
                {t("navAwardInfo")}
              </span>
            </div>
          </Link>

          {/* mm:I313:8440;186:1593 */}
          <Link
            href="/kudos-live-board"
            className="flex cursor-pointer items-center gap-1 rounded-[4px] p-4 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
          >
            {/* mm:I313:8440;186:1593;186:1937 */}
            <div className="flex items-center gap-1">
              {/* mm:I313:8440;186:1593;186:1439 */}
              <span className="w-[85px] text-center text-sm font-bold leading-5 tracking-[0.1px] text-white transition-colors duration-200">
                {t("navSunKudos")}
              </span>
            </div>
          </Link>
        </nav>
      </div>

      {/* mm:I313:8440;186:1601 */}
      <div className="flex items-center gap-[16px]">
        {/* mm:I313:8440;186:1696 — working language switcher (i18n) */}
        <LanguageSwitcher currentLocale={isLocale(locale) ? locale : DEFAULT_LOCALE} />

        {/* mm:I313:8440;186:2101 */}
        <div className="relative h-10 w-10">
          {/* mm:I313:8440;186:2101;186:2020 */}
          <div
            tabIndex={0}
            className="flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-[4px] bg-transparent p-[10px] transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
          >
            {/* mm:I313:8440;186:2101;186:2020;186:1420 */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 text-white"
            >
              <path
                d="M21 19V20H3V19L5 17V11C5 7.9 7.03 5.17 10 4.29C10 4.19 10 4.1 10 4C10 3.46957 10.2107 2.96086 10.5858 2.58579C10.9609 2.21071 11.4696 2 12 2C12.5304 2 13.0391 2.21071 13.4142 2.58579C13.7893 2.96086 14 3.46957 14 4C14 4.1 14 4.19 14 4.29C16.97 5.17 19 7.9 19 11V17L21 19ZM14 21C14 21.5304 13.7893 22.0391 13.4142 22.4142C13.0391 22.7893 12.5304 23 12 23C11.4696 23 10.9609 22.7893 10.5858 22.4142C10.2107 22.0391 10 21.5304 10 21"
                fill="currentColor"
              />
            </svg>
          </div>
          {/* mm:I313:8440;186:2101;186:2089 */}
          <div className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full">
            {/* mm:I313:8440;186:2101;186:2090 */}
            <div className="h-2 w-2 rounded-full bg-[#D4271D]" />
          </div>
        </div>

        {/* mm:I313:8440;186:1597 — profile button with logout dropdown */}
        <UserMenu email={user?.email ?? null} />
      </div>
    </header>
  );
}
