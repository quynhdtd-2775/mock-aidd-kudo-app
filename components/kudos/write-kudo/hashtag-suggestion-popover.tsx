"use client";

// Popover opened by HashtagField's "+ Hashtag" button — lists existing
// hashtags (from getHashtagSuggestionsAction) filtered by a free-text query,
// plus a "create new" option when the query doesn't match an existing tag.

import { useEffect, useMemo, useRef, useState } from "react";
import { MONTSERRAT, WRITE_KUDO_COLORS } from "./write-kudo-tokens";

export interface HashtagSuggestionPopoverProps {
  suggestions: string[];
  existing: string[];
  onSelect: (hashtag: string) => void;
  onClose: () => void;
  searchPlaceholder: string;
  createLabel: (value: string) => string;
  noSuggestionsLabel: string;
}

export function HashtagSuggestionPopover({
  suggestions,
  existing,
  onSelect,
  onClose,
  searchPlaceholder,
  createLabel,
  noSuggestionsLabel,
}: HashtagSuggestionPopoverProps) {
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suggestions.filter((tag) => !existing.includes(tag) && (q === "" || tag.toLowerCase().includes(q)));
  }, [suggestions, existing, query]);

  const trimmedQuery = query.trim();
  const canCreate = trimmedQuery !== "" && !existing.includes(trimmedQuery) && !suggestions.includes(trimmedQuery);

  return (
    <div
      ref={rootRef}
      className="absolute z-50 mt-2 flex w-64 flex-col gap-2 rounded-lg p-3 shadow-lg"
      style={{ background: WRITE_KUDO_COLORS.modalBackground, border: `1px solid ${WRITE_KUDO_COLORS.border}` }}
    >
      <input
        autoFocus
        type="text"
        value={query}
        // Hashtags are stored comma-joined server-side; stripping commas as
        // they're typed keeps a free-text tag like "a,b" from silently
        // becoming two tags on the round trip (server re-validates too).
        onChange={(event) => setQuery(event.target.value.replace(/,/g, ""))}
        onKeyDown={(event) => {
          if (event.key === "Enter" && canCreate) {
            event.preventDefault();
            onSelect(trimmedQuery);
          }
        }}
        placeholder={searchPlaceholder}
        className="w-full rounded-lg px-3 py-2 outline-none"
        style={{
          border: `1px solid ${WRITE_KUDO_COLORS.border}`,
          background: WRITE_KUDO_COLORS.fieldBackground,
          fontFamily: MONTSERRAT,
          fontWeight: 700,
          fontSize: 14,
          color: WRITE_KUDO_COLORS.textPrimary,
        }}
      />
      <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
        {canCreate && (
          <button
            type="button"
            onClick={() => onSelect(trimmedQuery)}
            className="rounded px-3 py-2 text-left hover:bg-[rgba(153,140,95,0.10)]"
            style={{ fontFamily: MONTSERRAT, fontWeight: 700, fontSize: 14, color: WRITE_KUDO_COLORS.textPrimary }}
          >
            {createLabel(trimmedQuery)}
          </button>
        )}
        {filtered.length === 0 && !canCreate ? (
          <span
            className="px-3 py-2"
            style={{ fontFamily: MONTSERRAT, fontWeight: 700, fontSize: 14, color: WRITE_KUDO_COLORS.textSecondary }}
          >
            {noSuggestionsLabel}
          </span>
        ) : (
          filtered.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSelect(tag)}
              className="rounded px-3 py-2 text-left hover:bg-[rgba(153,140,95,0.10)]"
              style={{ fontFamily: MONTSERRAT, fontWeight: 700, fontSize: 14, color: WRITE_KUDO_COLORS.textPrimary }}
            >
              #{tag}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
