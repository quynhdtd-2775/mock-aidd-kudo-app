import { getLocale } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locale-config";
import { LanguageSwitcher } from "@/components/home/language-switcher";

/**
 * mms_A_Header — semi-transparent bar pinned to the top of the login screen.
 * Logo on the left, language switcher (wired to i18n) on the right.
 */
export async function LoginHeader() {
  const locale = await getLocale();

  return (
    <header className="absolute left-0 top-0 z-20 flex w-full items-center justify-between bg-[rgba(11,15,18,0.8)] px-4 py-3 sm:px-10 md:px-16 lg:px-[144px]">
      <img
        src="/login/saa-logo.png"
        alt="SAA 2025"
        width={52}
        height={48}
        className="h-10 w-auto sm:h-12"
      />

      <LanguageSwitcher currentLocale={isLocale(locale) ? locale : DEFAULT_LOCALE} />
    </header>
  );
}
