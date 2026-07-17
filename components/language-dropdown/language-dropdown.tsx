"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LANGUAGE_OPTIONS, type Locale } from "./language-dropdown-data";
import { LanguageDropdownList } from "./language-dropdown-list";

export type LanguageDropdownProps = {
  /** Currently active locale, drives which row shows as selected. */
  value: Locale;
  /** Called with the newly picked locale; the menu closes right after. */
  onSelect: (code: Locale) => void;
  /** Localized accessible label for the trigger and menu. */
  ariaLabel?: string;
  className?: string;
};

/**
 * mm:I2167:9091;186:1696 (trigger badge) + mm:525:11713 (mms_A_Dropdown-List)
 * — header language selector. Click the current-language badge to reveal the
 * VN/EN options panel below it; picking an option updates the badge and
 * closes the menu. Presentational only — no i18n wiring, that's Track B.
 */
export function LanguageDropdown({
  value,
  onSelect,
  ariaLabel = "Chọn ngôn ngữ",
  className,
}: LanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current =
    LANGUAGE_OPTIONS.find((option) => option.code === value) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSelect = (code: Locale) => {
    onSelect(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-[108px] cursor-pointer items-center justify-between gap-[2px] rounded-[4px] bg-transparent p-4 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
      >
        <span className="flex items-center gap-1">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center">
            <Image src={current.flagSrc} alt={current.name} width={20} height={15} />
          </span>
          <span className="text-center text-base font-bold leading-6 tracking-[0.15px] text-white">
            {current.label}
          </span>
        </span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 shrink-0 text-white transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 top-[60px] z-10">
          <LanguageDropdownList value={value} onSelect={handleSelect} ariaLabel={ariaLabel} />
        </div>
      ) : null}
    </div>
  );
}
