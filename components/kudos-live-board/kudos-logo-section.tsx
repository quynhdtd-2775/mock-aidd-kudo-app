import Image from "next/image";
import { getTranslations } from "next-intl/server";

// mm:2940:13436 (Frame 487 -> A_KV Kudos, node 2940:13437)
// Heading text + full "Kudos" wordmark logo asset.

const MONTSERRAT = "var(--font-montserrat)";

export async function KudosLogoSection() {
  const t = await getTranslations("LiveBoard");

  return (
    // mm:2940:13437 (A_KV Kudos)
    <div className="flex w-full max-w-[1152px] flex-col items-start gap-[10px]">
      {/* mm:2940:13439 (Group 424 heading text) */}
      <p
        className="w-full text-left"
        style={{
          fontFamily: MONTSERRAT,
          fontWeight: 700,
          fontSize: 36,
          lineHeight: "44px",
          color: "rgba(255, 234, 158, 1)",
        }}
      >
        {t("kudosHeading")}
      </p>

      {/* mm:2940:13440 (MM_MEDIA_Kudos logo) */}
      <div className="relative h-[104px] w-[593px] max-w-full">
        <Image
          src="/kudos-live-board/kudos-logo.svg"
          alt={t("kudosLogoAlt")}
          fill
          priority
          className="object-contain object-left"
        />
      </div>
    </div>
  );
}
