// mm:2940:14170 (Frame 552) — the Awards / Spotlight Board section of the
// Sun* Kudos live board: dark full-bleed background, header, and the photo
// spotlight panel. Static/presentational only.

import { SpotlightBoardPanel } from "./spotlight-board-panel";
import { SpotlightHeader } from "./spotlight-header";

export function SpotlightSection() {
  return (
    // mm:2940:14170 / mm:2940:14169 (Rectangle 60 background)
    <section
      className="flex w-full flex-col items-center gap-8 px-4 py-8 sm:px-8 lg:px-36"
      style={{ backgroundColor: "rgba(0, 16, 26, 1)" }}
    >
      <SpotlightHeader />
      <SpotlightBoardPanel />
    </section>
  );
}
