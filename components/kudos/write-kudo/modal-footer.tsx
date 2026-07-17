"use client";

// mm:I520:11647;520:9905 (mms_H_Frame 538) — footer actions: "Hủy" secondary
// button + "Gửi" primary button (disabled until required fields are filled,
// or while a submit is in flight).

import { useTranslations } from "next-intl";
import { CloseIcon, SendIcon } from "./write-kudo-icons";
import { FieldErrorText } from "./field-error-text";
import { MONTSERRAT, WRITE_KUDO_COLORS } from "./write-kudo-tokens";

export interface ModalFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting?: boolean;
  submitError?: string;
}

export function ModalFooter({ onCancel, onSubmit, canSubmit, isSubmitting = false, submitError }: ModalFooterProps) {
  const t = useTranslations("WriteKudo");

  return (
    <div className="flex w-full flex-col gap-2">
      <FieldErrorText message={submitError} />
      <div className="flex w-full items-stretch gap-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex items-center gap-2 self-stretch rounded px-10 py-4 transition-colors duration-200 hover:bg-[rgba(255,234,158,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ border: `1px solid ${WRITE_KUDO_COLORS.border}`, background: WRITE_KUDO_COLORS.secondaryButtonBackground }}
        >
          <span
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 700,
              fontSize: 16,
              lineHeight: "24px",
              letterSpacing: "0.15px",
              color: WRITE_KUDO_COLORS.textPrimary,
            }}
          >
            {t("cancel")}
          </span>
          <CloseIcon className="h-6 w-6" style={{ color: WRITE_KUDO_COLORS.textPrimary }} />
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-4 transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: WRITE_KUDO_COLORS.primaryButtonBackground, height: 60 }}
        >
          <span
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 700,
              fontSize: 22,
              lineHeight: "28px",
              color: WRITE_KUDO_COLORS.textPrimary,
            }}
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </span>
          {!isSubmitting && <SendIcon className="h-6 w-6" style={{ color: WRITE_KUDO_COLORS.textPrimary }} />}
        </button>
      </div>
    </div>
  );
}
