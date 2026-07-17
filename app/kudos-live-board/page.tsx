import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LiveBoardHeader } from "@/components/kudos-live-board/live-board-header";
import { LiveBoardKeyvisual } from "@/components/kudos-live-board/live-board-keyvisual";
import { LiveBoardHero } from "@/components/kudos-live-board/live-board-hero";
import { SpotlightSection } from "@/components/kudos-live-board/spotlight-section";
import { LiveBoardAllKudos } from "@/components/kudos-live-board/live-board-all-kudos";
import { LiveBoardFooter } from "@/components/kudos-live-board/live-board-footer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("LiveBoard");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

// mm:2940:13431 "Sun* Kudos - Live board" — page root composing the sections
// in design order: keyvisual (behind), header (pinned on top), hero content,
// spotlight/awards board, all-kudos feed, footer.
export default function KudosLiveBoardPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#00101A]">
      {/* Keyvisual sits behind the header + hero content */}
      <div className="absolute inset-x-0 top-0">
        <LiveBoardKeyvisual />
      </div>

      <LiveBoardHeader />

      <div className="relative flex w-full flex-col pt-[88px]">
        <LiveBoardHero />
        <SpotlightSection />
        <LiveBoardAllKudos />
        <LiveBoardFooter />
      </div>
    </main>
  );
}
