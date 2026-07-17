import { AwardCard, AWARD_CARDS } from "./award-card";
import { AwardMenu } from "./award-menu";

// Anchor slugs for the side menu (see award-menu.tsx hrefs), keyed by card nodeId
const CARD_ANCHORS: Record<string, string> = {
  "313:8467": "top-talent",
  "313:8468": "top-project",
  "313:8469": "top-project-leader",
  "313:8470": "best-manager",
  "313:8471": "signature-2025-creator",
  "313:8510": "mvp",
};

export function AwardsSection() {
  return (
    // mm:313:8458 — "mms_B_Hệ thống giải thưởng": menu column + card list, 80px gap at lg
    <section className="flex w-full flex-col items-start gap-10 lg:flex-row lg:gap-20">
      {/* mm:313:8459 */}
      <AwardMenu />

      {/* mm:313:8466 — "D.Danh sách giải thưởng": 6 award cards stacked, 80px gap */}
      <div className="flex min-w-0 flex-1 flex-col items-start gap-12 lg:gap-20">
        {AWARD_CARDS.map((card) => (
          <div
            key={card.id}
            id={CARD_ANCHORS[card.id]}
            className="w-full scroll-mt-28"
          >
            <AwardCard card={card} />
          </div>
        ))}
      </div>
    </section>
  );
}
