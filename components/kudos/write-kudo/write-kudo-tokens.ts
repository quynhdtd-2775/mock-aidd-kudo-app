// mm:520:11647 (Viết KUDO) — shared design tokens for the write-kudo modal.
// Values pulled verbatim from Figma node styles; do not hardcode elsewhere.

export const MONTSERRAT = "var(--font-montserrat), sans-serif";

export const WRITE_KUDO_COLORS = {
  modalBackground: "#FFF8E1",
  border: "#998C5F",
  textPrimary: "#00101A",
  textSecondary: "#999999",
  fieldBackground: "#FFFFFF",
  primaryButtonBackground: "#FFEA9E",
  secondaryButtonBackground: "rgba(255, 234, 158, 0.10)",
  requiredMark: "#CF1322",
  communityStandardLink: "#E46060",
  chipRemoveBackground: "#D4271D",
  imageThumbnailBorder: "#FFEA9E",
} as const;
