"use client";

import { LANGUAGE_OPTIONS, type Locale } from "./language-dropdown-data";
import { LanguageOptionRow } from "./language-option-row";

type LanguageDropdownListProps = {
  value: Locale;
  onSelect: (code: Locale) => void;
  /** Localized accessible label for the menu. */
  ariaLabel?: string;
};

/**
 * mm:525:11713 (mms_A_Dropdown-List) — the options panel itself: a bordered,
 * near-black container stacking the VN row above the EN row.
 */
export function LanguageDropdownList({
  value,
  onSelect,
  ariaLabel = "Chọn ngôn ngữ",
}: LanguageDropdownListProps) {
  return (
    <div
      role="menu"
      aria-label={ariaLabel}
      className="inline-flex w-[110px] flex-col items-start rounded-lg border border-[#998C5F] bg-[#00070C] p-[6px]"
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <LanguageOptionRow
          key={option.code}
          option={option}
          selected={option.code === value}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
