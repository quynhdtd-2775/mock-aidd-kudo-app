"use client";

// mm:I520:11647;1688:10448 (Frame 552) — required "Danh hiệu" (award title)
// field with a helper hint line beneath the input.

import { useTranslations } from "next-intl";
import { FieldLabel } from "./field-label";
import { FieldErrorText } from "./field-error-text";
import { WRITE_KUDO_COLORS, MONTSERRAT } from "./write-kudo-tokens";

export interface AwardTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function AwardTitleField({ value, onChange, error }: AwardTitleFieldProps) {
  const t = useTranslations("WriteKudo");

  return (
    <div className="flex w-full items-start gap-4">
      <div className="pt-3">
        <FieldLabel text={t("awardTitleLabel")} required />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("awardTitlePlaceholder")}
          aria-label={t("awardTitleAriaLabel")}
          className="w-full rounded-lg px-6 py-4 outline-none"
          style={{
            border: `1px solid ${error ? WRITE_KUDO_COLORS.requiredMark : WRITE_KUDO_COLORS.border}`,
            background: WRITE_KUDO_COLORS.fieldBackground,
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "24px",
            color: WRITE_KUDO_COLORS.textPrimary,
          }}
        />
        <FieldErrorText message={error} />
        <p
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "0.15px",
            color: WRITE_KUDO_COLORS.textSecondary,
          }}
        >
          {t("awardTitleHintExample")}
          <br />
          {t("awardTitleHintUsage")}
        </p>
      </div>
    </div>
  );
}
