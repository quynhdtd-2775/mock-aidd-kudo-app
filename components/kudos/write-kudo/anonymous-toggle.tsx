"use client";

// mm:I520:11647;520:14099 (mms_G_Gửi ẩn danh) — anonymous-send checkbox.
// When checked, reveals a text field for the anonymous display name
// (not present in the Figma static state; added per functional requirement).

import { useTranslations } from "next-intl";
import { MONTSERRAT, WRITE_KUDO_COLORS } from "./write-kudo-tokens";

export interface AnonymousToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
}

export function AnonymousToggle({
  checked,
  onCheckedChange,
  displayName,
  onDisplayNameChange,
}: AnonymousToggleProps) {
  const t = useTranslations("WriteKudo");

  return (
    <div className="flex w-full flex-col gap-3">
      <label className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          aria-label={t("anonymousLabel")}
          className="h-6 w-6 shrink-0 cursor-pointer"
          style={{
            border: `1px solid ${WRITE_KUDO_COLORS.textSecondary}`,
            borderRadius: 4,
            accentColor: WRITE_KUDO_COLORS.primaryButtonBackground,
          }}
        />
        <span
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 22,
            lineHeight: "28px",
            color: WRITE_KUDO_COLORS.textPrimary,
          }}
        >
          {t("anonymousLabel")}
        </span>
      </label>

      {checked && (
        <input
          type="text"
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          placeholder={t("anonymousNamePlaceholder")}
          aria-label={t("anonymousNameAriaLabel")}
          className="w-full max-w-md rounded-lg px-6 py-4 outline-none"
          style={{
            border: `1px solid ${WRITE_KUDO_COLORS.border}`,
            background: WRITE_KUDO_COLORS.fieldBackground,
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "24px",
            color: WRITE_KUDO_COLORS.textPrimary,
          }}
        />
      )}
    </div>
  );
}
