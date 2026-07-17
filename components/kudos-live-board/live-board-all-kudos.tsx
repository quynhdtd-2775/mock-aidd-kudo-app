import { AllKudosHeader } from "./all-kudos-header";
import { KudoPostCard } from "./kudo-post-card";
import { KUDO_POSTS } from "./kudo-posts-data";
import { StatsOverviewPanel } from "./stats-overview-panel";
import { GiftReceiversPanel } from "./gift-receivers-panel";

// mm:2940:13475 "C_All kudos" — the main kudos feed section: header (title +
// "ALL KUDOS"), a scrolling column of thank-you post cards on the left
// (C.2_Danh sách lời cảm ơn) and a fixed-width sidebar with the personal
// stats panel + latest gift receivers on the right (D_Thống menu phải).
// Presentational only — mock data lives in kudo-posts-data.ts /
// gift-receivers-data.ts, both extracted verbatim from the Figma design.
export function LiveBoardAllKudos() {
  return (
    // mm:2940:13475
    <section className="flex w-full flex-col items-start gap-10 px-4 py-12 sm:px-8 lg:px-36">
      <AllKudosHeader />

      {/* mm:2940:13481 — Frame 502 */}
      <div className="flex w-full flex-col items-start gap-10 lg:flex-row lg:justify-between lg:gap-20">
        {/* mm:2940:13482 — C.2_Danh sách lời cảm ơn */}
        <div className="flex w-full flex-col items-start gap-6 lg:max-w-[680px]">
          {KUDO_POSTS.map((post) => (
            <KudoPostCard key={post.id} post={post} />
          ))}
        </div>

        {/* mm:2940:13488 — D_Thống menu phải */}
        <div className="flex w-full flex-col items-start gap-6 lg:w-[422px] lg:shrink-0">
          <StatsOverviewPanel />
          <GiftReceiversPanel />
        </div>
      </div>
    </section>
  );
}
