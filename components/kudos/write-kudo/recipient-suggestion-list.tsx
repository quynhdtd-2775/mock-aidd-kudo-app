"use client";

// Custom dropdown for RecipientSelector (MAJOR-1 fix) — replaces the native
// <datalist>, which only ever fills the input's text and left the id
// resolved after the fact by matching that text against a display name.
// Clicking an option here stores { id, name } explicitly, so two profiles
// sharing a display name can never be confused. Mirrors the click-to-select
// pattern used by hashtag-suggestion-popover.tsx / mention-list.tsx.

import { MONTSERRAT, WRITE_KUDO_COLORS } from "./write-kudo-tokens";
import type { RecipientOption } from "./write-kudo-mock-data";

export interface RecipientSuggestionListProps {
  options: RecipientOption[];
  onSelect: (option: RecipientOption) => void;
}

export function RecipientSuggestionList({ options, onSelect }: RecipientSuggestionListProps) {
  return (
    <div
      className="absolute left-0 right-0 top-full z-50 mt-2 flex max-h-60 flex-col gap-1 overflow-y-auto rounded-lg p-1 shadow-lg"
      style={{ background: WRITE_KUDO_COLORS.modalBackground, border: `1px solid ${WRITE_KUDO_COLORS.border}` }}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option)}
          className="flex items-center rounded px-3 py-2 text-left hover:bg-[rgba(153,140,95,0.10)]"
          style={{ fontFamily: MONTSERRAT, fontWeight: 700, fontSize: 14, color: WRITE_KUDO_COLORS.textPrimary }}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
}
