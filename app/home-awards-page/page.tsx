import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/home-awards-page/site-header";
import { HeroSection } from "@/components/home-awards-page/hero-section";
import { AwardsSection } from "@/components/home-awards-page/awards-section";
import { SunKudosSection } from "@/components/home-awards-page/sunkudos-section";
import { SiteFooter } from "@/components/home-awards-page/site-footer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AwardsPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

// mm:313:8436 — screen "Hệ thống giải" (fileKey 9ypp4enmFmdK3YAFJLIu6C, screenId zFYDgyj_pD)
export default function HomeAwardsPage() {
  return (
    <div className="flex min-h-full w-full flex-col bg-[#00101A]">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        {/* mm:313:8449 — "Bìa" content column: 144px gutters, 120px section gap, 96px bottom padding (scaled down on mobile/tablet) */}
        <div className="flex w-full flex-col gap-12 px-4 pt-12 pb-12 sm:gap-16 sm:px-8 sm:pt-16 sm:pb-16 lg:gap-30 lg:px-36 lg:pt-30 lg:pb-24">
          <AwardsSection />
          <SunKudosSection />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
