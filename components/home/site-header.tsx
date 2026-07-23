import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/auth-service";
import { resolveCurrentUserId } from "@/lib/profile/current-user";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locale-config";
import { getNotifications } from "@/lib/notifications/notifications-queries";
import { getCurrentUserRole } from "@/lib/profile/profile-role-query";
import { LanguageSwitcher } from "./language-switcher";
import { NotificationsBell } from "./notifications-bell";
import { UserMenu } from "./user-menu";

/**
 * mm:2167:9091 (mms_A1_Header) — semi-transparent bar pinned to the top of the
 * home/awards screen. Logo + nav links on the left, notification / language /
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
  const userId = await resolveCurrentUserId();
  const notifications = userId ? await getNotifications(userId) : [];
  const role = userId ? await getCurrentUserRole(userId) : "user";

  const NAV_ITEMS = [
    // mm:I2167:9091;186:1579 — selected state
    { label: t("navAbout"), width: "w-[120px]", selected: true, href: "/home-page-saa" },
    // mm:I2167:9091;186:1587
    { label: t("navAwardInfo"), width: "w-[141px]", selected: false, href: "/home-awards-page" },
    // mm:I2167:9091;186:1593
    { label: t("navSunKudos"), width: "w-[85px]", selected: false, href: "/kudos-live-board" },
  ];

  return (
    // mm:2167:9091
    <header
      className={`${montserrat.className} absolute left-0 top-0 z-[1] flex w-full flex-wrap items-center justify-between gap-4 bg-[rgba(16,20,23,0.8)] px-4 py-3 sm:px-8 md:flex-nowrap lg:px-[144px]`}
    >
      {/* mm:I2167:9091;186:2166 */}
      <div className="flex flex-wrap items-center gap-4 md:gap-8 lg:gap-[64px]">
        {/* mm:I2167:9091;178:1033 */}
        <div className="relative h-[48px] w-[52px] shrink-0">
          {/* mm:I2167:9091;178:1033;178:1030 */}
          <Image
            src="/home/Logo_Header.png"
            alt="SAA 2025"
            fill
            className="object-cover"
          />
        </div>

        {/* mm:I2167:9091;178:653 */}
        <nav className="flex flex-wrap items-center gap-1 md:gap-2 lg:gap-[24px]">
          {NAV_ITEMS.map((item) => {
            const className = item.selected
              ? "flex cursor-pointer items-center gap-1 border-b border-[#FFEA9E] p-4 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
              : "flex cursor-pointer items-center gap-1 rounded-[4px] p-4 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1";
            const inner = (
              <div className="flex items-center gap-1">
                <span
                  className={`${item.width} text-center text-sm font-bold leading-5 tracking-[0.1px] ${
                    item.selected
                      ? "text-[#FFEA9E]"
                      : "text-white transition-colors duration-200"
                  }`}
                  style={
                    item.selected
                      ? {
                          textShadow:
                            "0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287",
                        }
                      : undefined
                  }
                >
                  {item.label}
                </span>
              </div>
            );
            return item.href ? (
              <Link key={item.label} href={item.href} className={className}>
                {inner}
              </Link>
            ) : (
              <div key={item.label} tabIndex={0} className={className}>
                {inner}
              </div>
            );
          })}
        </nav>
      </div>

      {/* mm:I2167:9091;186:1601 */}
      <div className="flex items-center gap-[16px]">
        {/* mm:I2167:9091;186:2101 — notification */}
        <NotificationsBell items={notifications} />

        {/* mm:I2167:9091;186:1696 — language selector */}
        <LanguageSwitcher currentLocale={isLocale(locale) ? locale : DEFAULT_LOCALE} />

        {/* mm:I2167:9091;186:1597 — profile button with logout dropdown */}
        <UserMenu email={user?.email ?? null} isAdmin={role === "admin"} />
      </div>
    </header>
  );
}
