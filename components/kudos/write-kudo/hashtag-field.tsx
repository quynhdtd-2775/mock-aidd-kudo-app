"use client";

// mm:I520:11647;520:9890 (mms_E_Frame 536) — required Hashtag field: chips
// with removable "x", "+ Hashtag" add button, "Tối đa 5" cap note.

import { useTranslations } from "next-intl";
import { FieldLabel } from "./field-label";
import { FieldErrorText } from "./field-error-text";
import { PlusIcon, CloseTinyIcon } from "./write-kudo-icons";
import { MONTSERRAT, WRITE_KUDO_COLORS } from "./write-kudo-tokens";
import { MAX_HASHTAGS } from "./write-kudo-mock-data";

export interface HashtagFieldProps {
  hashtags: string[];
  onAdd: () => void;
  onRemove: (hashtag: string) => void;
  error?: string;
}

export function HashtagField({ hashtags, onAdd, onRemove, error }: HashtagFieldProps) {
  const t = useTranslations("WriteKudo");
  const atMax = hashtags.length >= MAX_HASHTAGS;

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex w-full items-center gap-4">
        <FieldLabel text={t("hashtagLabel")} required />
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {hashtags.map((hashtag) => (
            <span
              key={hashtag}
              className="flex items-center gap-2 rounded-lg px-3 py-1"
              style={{
                border: `1px solid ${WRITE_KUDO_COLORS.border}`,
                background: WRITE_KUDO_COLORS.fieldBackground,
                fontFamily: MONTSERRAT,
                fontWeight: 700,
                fontSize: 14,
                lineHeight: "20px",
                color: WRITE_KUDO_COLORS.textPrimary,
              }}
            >
              #{hashtag}
              <button
                type="button"
                aria-label={t("hashtagRemoveAriaLabel", { hashtag })}
                onClick={() => onRemove(hashtag)}
                className="flex h-4 w-4 items-center justify-center rounded-full"
                style={{ background: WRITE_KUDO_COLORS.chipRemoveBackground, color: "#FFFFFF" }}
              >
                <CloseTinyIcon className="h-2 w-2" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onAdd}
            disabled={atMax}
            aria-label={t("hashtagAddAriaLabel")}
            className="flex items-center gap-1 rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-[rgba(153,140,95,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ border: `1px solid ${WRITE_KUDO_COLORS.border}`, background: WRITE_KUDO_COLORS.fieldBackground }}
          >
            <PlusIcon className="h-6 w-6 shrink-0" style={{ color: WRITE_KUDO_COLORS.textSecondary }} />
            <span
              className="flex flex-col"
              style={{
                fontFamily: MONTSERRAT,
                fontWeight: 700,
                fontSize: 11,
                lineHeight: "16px",
                letterSpacing: "0.5px",
                color: WRITE_KUDO_COLORS.textSecondary,
              }}
            >
              <span>{t("hashtagAddLabel")}</span>
              <span>{t("hashtagMax", { max: MAX_HASHTAGS })}</span>
            </span>
          </button>
        </div>
      </div>
      <FieldErrorText message={error} />
    </div>
  );
}
