// Single source of truth for the locale union lives in the i18n contract.
export type { Locale } from "@/lib/i18n/locale-config";
import type { Locale } from "@/lib/i18n/locale-config";

export type LanguageOption = {
  code: Locale;
  /** Two-letter badge label shown next to the flag, e.g. "VN" / "EN". */
  label: string;
  /** Full language name, used as the flag image alt text. */
  name: string;
  flagSrc: string;
};

/**
 * mm:I525:11713;362:6085 (Tiếng Việt) + mm:I525:11713;362:6128 (Tiếng Anh) —
 * the two rows rendered by the language dropdown, in Figma display order.
 */
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "vi", label: "VN", name: "Tiếng Việt", flagSrc: "/home/FLAG_VN.svg" },
  { code: "en", label: "EN", name: "Tiếng Anh", flagSrc: "/home/FLAG_GB.svg" },
];
