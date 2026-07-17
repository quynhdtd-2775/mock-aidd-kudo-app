import { FunctionButtons } from "./function-buttons";
import { HighlightKudosSection } from "./highlight-kudos-section";
import { KudosLogoSection } from "./kudos-logo-section";

// mm:2940:13435 (Frame 532) — hero content section of "Sun* Kudos - Live
// board": Kudos wordmark + heading, ghi-nhận/search action pills, and the
// Highlight Kudos carousel. Static/presentational; root is width:100% with
// content capped at the 1152px Figma column, centered via mx-auto.

export function LiveBoardHero() {
  return (
    // mm:2940:13435 (Frame 532)
    <div className="flex w-full flex-col items-center gap-16 py-12 lg:py-16">
      {/* mm:2940:13436 (Frame 487) */}
      <div className="flex w-full justify-center px-4 sm:px-8 lg:px-[144px]">
        <KudosLogoSection />
      </div>

      {/* mm:2940:13448 (Button chuc nang) */}
      <div className="flex w-full justify-center px-4 sm:px-8 lg:px-[144px]">
        <FunctionButtons />
      </div>

      {/* mm:2940:13451 (B_Highlight) */}
      <HighlightKudosSection />
    </div>
  );
}
