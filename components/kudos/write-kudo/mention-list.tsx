"use client";

// Dropdown rendered by the Tiptap "@" mention suggestion plugin (see
// mention-suggestion.ts). Keyboard-navigable (Up/Down/Enter), mouse-clickable.

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { ProfileSuggestion } from "@/lib/kudos/kudos-types";
import { MONTSERRAT, WRITE_KUDO_COLORS } from "./write-kudo-tokens";

export interface MentionListProps {
  items: ProfileSuggestion[];
  command: (attrs: { id: string; label: string }) => void;
  noResultsLabel: string;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(function MentionList(
  { items, command, noResultsLabel },
  ref,
) {
  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(0), [items]);

  const select = (index: number) => {
    const item = items[index];
    if (item) command({ id: item.id, label: item.displayName });
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (items.length === 0) return false;
      if (event.key === "ArrowDown") {
        setSelected((prev) => (prev + 1) % items.length);
        return true;
      }
      if (event.key === "ArrowUp") {
        setSelected((prev) => (prev - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        select(selected);
        return true;
      }
      return false;
    },
  }));

  return (
    <div
      className="flex max-h-60 w-64 flex-col overflow-y-auto rounded-lg p-1 shadow-lg"
      style={{ background: WRITE_KUDO_COLORS.modalBackground, border: `1px solid ${WRITE_KUDO_COLORS.border}` }}
    >
      {items.length === 0 ? (
        <span
          className="px-3 py-2"
          style={{ fontFamily: MONTSERRAT, fontWeight: 700, fontSize: 14, color: WRITE_KUDO_COLORS.textSecondary }}
        >
          {noResultsLabel}
        </span>
      ) : (
        items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => select(index)}
            className="flex items-center rounded px-3 py-2 text-left"
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 700,
              fontSize: 14,
              background: index === selected ? "rgba(153,140,95,0.15)" : "transparent",
              color: WRITE_KUDO_COLORS.textPrimary,
            }}
          >
            {item.displayName}
          </button>
        ))
      )}
    </div>
  );
});
