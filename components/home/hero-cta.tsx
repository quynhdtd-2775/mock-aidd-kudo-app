import { getTranslations } from "next-intl/server";

// mm:2167:9062 (mms_B3_Call-To-Action) — ABOUT AWARDS / ABOUT KUDOS buttons

const MONTSERRAT = "var(--font-montserrat)";

// mm:186:2691 (MM_MEDIA_Up) — monochrome arrow, color driven by currentColor
function UpIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.49945 18.3104L5.68945 15.5004L12.0595 9.12043H7.10945V5.69043H18.3095V16.8904H14.8895V11.9404L8.49945 18.3104Z"
        fill="currentColor"
      />
    </svg>
  );
}

const LABEL_STYLE = {
  fontFamily: MONTSERRAT,
  fontWeight: 700,
  fontSize: 22,
  lineHeight: "28px",
} as const;

export async function HeroCta() {
  const t = await getTranslations("Hero");

  return (
    // mm:2167:9062
    <div className="flex flex-wrap items-start gap-6 lg:gap-10">
      {/* mm:2167:9063 mms_B3.1_Button-IC About */}
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg px-6 py-4"
        style={{
          backgroundColor: "rgba(255, 234, 158, 1)",
          color: "rgba(0, 16, 26, 1)",
        }}
      >
        <span style={LABEL_STYLE}>{t("ctaAboutAwards")}</span>
        <UpIcon />
      </button>

      {/* mm:2167:9064 mms_B3.2_Button-IC Kudos */}
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg px-6 py-4"
        style={{
          border: "1px solid #998C5F",
          background: "rgba(255, 234, 158, 0.10)",
          color: "rgba(255, 255, 255, 1)",
        }}
      >
        <span style={LABEL_STYLE}>{t("ctaAboutKudos")}</span>
        <UpIcon />
      </button>
    </div>
  );
}
