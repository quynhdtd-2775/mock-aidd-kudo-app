import { getRequestConfig } from "next-intl/server";
import { loadPreferredLocale } from "@/lib/i18n/load-preferred-locale";

export default getRequestConfig(async () => {
  // Precedence: cookie > profiles.language (logged-in) > DEFAULT_LOCALE.
  // loadPreferredLocale validates and seeds the cookie when it falls back to
  // the DB value, so the returned locale is always a supported Locale.
  const locale = await loadPreferredLocale();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
