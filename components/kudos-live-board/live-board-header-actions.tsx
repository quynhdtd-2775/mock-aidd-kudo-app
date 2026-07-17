import { getLocale, getTranslations } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locale-config";
import { LanguageSwitcher } from "@/components/home/language-switcher";

/**
 * mm:I2940:13433;186:1601 — Header right-side actions: language switch,
 * notification bell (with unread dot), and profile button. Language switch
 * is wired to i18n; bell/profile stay presentational.
 */
export async function LiveBoardHeaderActions() {
  const locale = await getLocale();
  const t = await getTranslations("LiveBoard");

  return (
    // mm:I2940:13433;186:1601
    <div className="flex items-center gap-[16px]">
      {/* mm:I2940:13433;186:1696 — working language switcher (i18n) */}
      <LanguageSwitcher currentLocale={isLocale(locale) ? locale : DEFAULT_LOCALE} />

      {/* mm:I2940:13433;186:2101 */}
      <div className="relative h-10 w-10">
        {/* mm:I2940:13433;186:2101;186:2020 */}
        <div
          tabIndex={0}
          className="flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-[4px] bg-transparent p-[10px] transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
        >
          {/* mm:I2940:13433;186:2101;186:2020;186:1420 — bell */}
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
        {/* mm:I2940:13433;186:2101;186:2089 */}
        <div className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full">
          {/* mm:I2940:13433;186:2101;186:2090 */}
          <div className="h-2 w-2 rounded-full bg-[#D4271D]" />
        </div>
      </div>

      {/* mm:I2940:13433;186:1597 — profile button (static, no dropdown/logout in this presentational build) */}
      <div
        tabIndex={0}
        role="button"
        aria-label={t("profileAriaLabel")}
        className="flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-[#998C5F] bg-transparent p-[10px] transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
      >
        {/* mm:I2940:13433;186:1597;186:1420 — profile icon */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 text-white"
        >
          <path
            d="M12 4C13.0609 4 14.0783 4.42143 14.8284 5.17157C15.5786 5.92172 16 6.93913 16 8C16 9.06087 15.5786 10.0783 14.8284 10.8284C14.0783 11.5786 13.0609 12 12 12C10.9391 12 9.92172 11.5786 9.17157 10.8284C8.42143 10.0783 8 9.06087 8 8C8 6.93913 8.42143 5.92172 9.17157 5.17157C9.92172 4.42143 10.9391 4 12 4ZM12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
