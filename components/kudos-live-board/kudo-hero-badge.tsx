import Image from "next/image";
import { getTranslations } from "next-intl/server";

// mm:3007:17505 (component set "Hero badge") — small pill badge shown next to
// a sender/receiver name on a KUDO post or the gift-receiver sidebar list.
// Variants map 1:1 to the Figma instances actually used on this screen:
// "New Hero" (no exported background image asset), "Rising Hero",
// "Legend Hero" and "Super Hero" (each backed by its own badge artwork).
export type HeroBadgeVariant = "new" | "rising" | "legend" | "super";

const HERO_BADGE_IMAGE: Record<HeroBadgeVariant, string | null> = {
  new: null,
  rising: "/kudos-live-board/badge-rising-hero.png",
  legend: "/kudos-live-board/badge-legend-hero.png",
  super: "/kudos-live-board/badge-super-hero.png",
};

export async function KudoHeroBadge({ variant }: { variant: HeroBadgeVariant }) {
  const t = await getTranslations("LiveBoard");

  const HERO_BADGE_LABEL: Record<HeroBadgeVariant, string> = {
    new: t("heroBadgeNew"),
    rising: t("heroBadgeRising"),
    legend: t("heroBadgeLegend"),
    super: t("heroBadgeSuper"),
  };

  const label = HERO_BADGE_LABEL[variant];
  const imageSrc = HERO_BADGE_IMAGE[variant];

  return (
    // mm:3106:17694
    <div className="relative flex h-[19px] w-[109px] shrink-0 items-center justify-center overflow-hidden rounded-full border-[0.5px] border-[#FFEA9E]">
      {imageSrc ? (
        <Image src={imageSrc} alt="" fill className="object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[#FFF3C6]" />
      )}
      <span
        className="relative text-[11px] font-bold leading-[16px] tracking-[0.08px] text-white"
        style={{
          fontFamily: "var(--font-montserrat)",
          textShadow: "0 1px 2px rgba(0,0,0,0.6)",
        }}
      >
        {label}
      </span>
    </div>
  );
}
