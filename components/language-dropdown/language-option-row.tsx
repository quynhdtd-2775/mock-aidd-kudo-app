"use client";

import Image from "next/image";
import type { LanguageOption, Locale } from "./language-dropdown-data";

type LanguageOptionRowProps = {
  option: LanguageOption;
  selected: boolean;
  onSelect: (code: Locale) => void;
};

/**
 * mm:I525:11713;362:6085 (VN) / mm:I525:11713;362:6128 (EN) — one selectable
 * row inside the language dropdown list. The selected row gets a warm
 * translucent highlight; every row shows a flag icon + two-letter label.
 */
export function LanguageOptionRow({ option, selected, onSelect }: LanguageOptionRowProps) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={() => onSelect(option.code)}
      className={`flex h-14 w-full items-center justify-between gap-[2px] rounded-[4px] p-4 text-left transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] ${
        selected ? "bg-[#FFEA9E]/20" : "bg-transparent"
      }`}
    >
      <span className="flex items-center gap-1">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center">
          <Image src={option.flagSrc} alt={option.name} width={20} height={15} />
        </span>
        <span className="text-base font-bold leading-6 tracking-[0.15px] text-white">
          {option.label}
        </span>
      </span>
    </button>
  );
}
