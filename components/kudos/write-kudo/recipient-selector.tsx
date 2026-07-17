"use client";

// mm:I520:11647;520:9871 (mms_B_Chọn người nhận) — required recipient
// autocomplete field. Label + search-style input, 56px tall, chevron-down.
// Selection happens via an explicit click on a suggestion (RecipientSuggestionList)
// rather than by resolving typed text against a display name afterwards —
// see use-recipient-search.ts for why (MAJOR-1 fix).

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FieldLabel } from "./field-label";
import { FieldErrorText } from "./field-error-text";
import { RecipientSuggestionList } from "./recipient-suggestion-list";
import { DownIcon } from "./write-kudo-icons";
import { WRITE_KUDO_COLORS, MONTSERRAT } from "./write-kudo-tokens";
import type { RecipientOption } from "./write-kudo-mock-data";

export interface RecipientSelectorProps {
  value: string;
  onQueryChange: (value: string) => void;
  onSelect: (option: RecipientOption) => void;
  options?: RecipientOption[];
  error?: string;
}

export function RecipientSelector({
  value,
  onQueryChange,
  onSelect,
  options = [],
  error,
}: RecipientSelectorProps) {
  const t = useTranslations("WriteKudo");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex w-full items-center gap-4">
        <FieldLabel text={t("recipientLabel")} required />
        <div ref={rootRef} className="relative flex-1">
          <div
            className="flex items-center justify-between gap-4 rounded-lg px-6 py-4"
            style={{
              border: `1px solid ${error ? WRITE_KUDO_COLORS.requiredMark : WRITE_KUDO_COLORS.border}`,
              background: WRITE_KUDO_COLORS.fieldBackground,
              minHeight: 56,
            }}
          >
            <input
              type="text"
              value={value}
              onChange={(event) => {
                onQueryChange(event.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={t("recipientPlaceholder")}
              aria-label={t("recipientAriaLabel")}
              autoComplete="off"
              className="w-full bg-transparent outline-none"
              style={{
                fontFamily: MONTSERRAT,
                fontWeight: 700,
                fontSize: 16,
                lineHeight: "24px",
                letterSpacing: "0.15px",
                color: WRITE_KUDO_COLORS.textPrimary,
              }}
            />
            <DownIcon className="h-6 w-6 shrink-0" style={{ color: WRITE_KUDO_COLORS.textSecondary }} />
          </div>
          {isOpen && options.length > 0 && (
            <RecipientSuggestionList
              options={options}
              onSelect={(option) => {
                onSelect(option);
                setIsOpen(false);
              }}
            />
          )}
        </div>
      </div>
      <FieldErrorText message={error} />
    </div>
  );
}
