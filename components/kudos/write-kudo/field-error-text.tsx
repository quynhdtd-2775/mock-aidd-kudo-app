// Shared inline error message shown under a field once a submit attempt
// returns a `CreateKudoErrorCode` mapped to this field. Reused by every
// write-kudo field to keep the "red border + message" treatment consistent.

import { MONTSERRAT, WRITE_KUDO_COLORS } from "./write-kudo-tokens";

export function FieldErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      style={{
        fontFamily: MONTSERRAT,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: "20px",
        color: WRITE_KUDO_COLORS.requiredMark,
      }}
    >
      {message}
    </p>
  );
}
