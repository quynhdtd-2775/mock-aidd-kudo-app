// mm:416:5550 (Title) — reused label pattern: 22px/28 bold Montserrat text,
// optional red asterisk (Noto Sans JP, 16px) for required fields.

import { MONTSERRAT, WRITE_KUDO_COLORS } from "./write-kudo-tokens";

export function FieldLabel({ text, required = false }: { text: string; required?: boolean }) {
  return (
    <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
      <span
        style={{
          fontFamily: MONTSERRAT,
          fontWeight: 700,
          fontSize: 22,
          lineHeight: "28px",
          color: WRITE_KUDO_COLORS.textPrimary,
        }}
      >
        {text}
      </span>
      {required && (
        <span
          style={{
            fontFamily: '"Noto Sans JP", sans-serif',
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "20px",
            color: WRITE_KUDO_COLORS.requiredMark,
          }}
        >
          *
        </span>
      )}
    </span>
  );
}
