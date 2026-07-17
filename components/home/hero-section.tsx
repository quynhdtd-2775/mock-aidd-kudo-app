import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { HeroCountdown } from "./hero-countdown";
import { HeroCta } from "./hero-cta";
import { HeroThemeIntro } from "./hero-theme-intro";
import { HeroWidgetButton } from "./hero-widget-button";

/**
 * mm:2167:9030 "Bìa" — screen "Homepage SAA" (fileKey 9ypp4enmFmdK3YAFJLIu6C,
 * screenId i87tDx10uM). Hero scope: Frame 487 (2167:9031), Frame 486
 * (3204:10152), widget button (5022:15169) + background layers 2167:9027/9029.
 */
export async function HeroSection() {
  const t = await getTranslations("Hero");

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "rgba(0, 16, 26, 1)" }}
    >
      {/* mm:2167:9027 mms_3.5_Keyvisual — full-bleed 1512x1392 background */}
      <div className="absolute inset-x-0 top-0 h-[1392px] w-full">
        {/* mm:2167:9028 MM_MEDIA_Keyvisual BG */}
        <Image
          src="/home/Keyvisual_BG.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* mm:2167:9029 Cover — dark fade so text reads over the keyvisual */}
      <div
        className="absolute inset-x-0 top-0 h-[1480px] w-full"
        style={{
          background:
            "linear-gradient(12deg, #00101A 23.7%, rgba(0, 18, 29, 0.46) 38.34%, rgba(0, 19, 32, 0.00) 48.92%)",
        }}
      />

      {/* Entrance fade-in for above-the-fold hero content; respects prefers-reduced-motion */}
      <style>{`
        @keyframes heroFadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-in-up { animation: heroFadeInUp 0.6s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade-in-up { animation: none; }
        }
      `}</style>

      {/* Content column: 1224px at 1512 design width; lg:pt-46 = 88px absolute header + 96px design padding-top */}
      <div className="hero-fade-in-up relative mx-auto flex w-full max-w-[1512px] flex-col px-4 pt-24 sm:px-8 sm:pt-32 lg:px-36 lg:pt-46">
        {/* mm:2167:9031 (Frame 487) */}
        <div className="flex w-full flex-col items-start gap-6 lg:gap-10">
          {/* mm:2167:9032 (Frame 482) / mm:2788:12911 MM_MEDIA_Root Further Logo */}
          <Image
            src="/home/Root_Further_Logo.png"
            alt={t("rootFurtherLogoAlt")}
            width={451}
            height={200}
            className="h-auto w-[260px] sm:w-[340px] lg:w-[451px]"
          />

          {/* mm:2167:9034 (Frame 523) — countdown + event info */}
          <HeroCountdown />

          {/* mm:2167:9062 mms_B3_Call-To-Action */}
          <HeroCta />
        </div>

        {/* mm:3204:10152 (Frame 486) — 102px below Frame 487 per measured design */}
        <div className="mt-12 sm:mt-16 lg:mt-[102px]">
          <HeroThemeIntro />
        </div>
      </div>

      {/* mm:5022:15169 mms_6_Widget Button */}
      <HeroWidgetButton />
    </section>
  );
}
