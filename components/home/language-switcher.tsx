"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LanguageDropdown } from "@/components/language-dropdown/language-dropdown";
import type { Locale } from "@/components/language-dropdown/language-dropdown-data";
import { setLocale } from "@/lib/i18n/set-locale-action";

type LanguageSwitcherProps = {
  /** Active locale resolved server-side via `getLocale()`. */
  currentLocale: Locale;
};

/**
 * Client bridge between the presentational `LanguageDropdown` (Track A) and
 * the `setLocale` server action (phase 02). Persists the pick (cookie +
 * profiles.language when logged in) then refreshes server components so the
 * new locale/messages render without a full page reload.
 */
export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const t = useTranslations("Header");
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleSelect = (next: Locale) => {
    startTransition(() => {
      setLocale(next)
        .then(() => router.refresh())
        .catch((error) => {
          console.error("LanguageSwitcher: failed to set locale", error);
        });
    });
  };

  return (
    <LanguageDropdown
      value={currentLocale}
      onSelect={handleSelect}
      ariaLabel={t("languageSelector")}
    />
  );
}
