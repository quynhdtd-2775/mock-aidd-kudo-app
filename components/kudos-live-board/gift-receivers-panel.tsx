import { getTranslations } from "next-intl/server";
import { GiftReceiverRow } from "./gift-receiver-row";
import { GIFT_RECEIVERS } from "./gift-receivers-data";

// mm:2940:13510 "D.3_10 SUNNER nhận quà" — title + the list of most-recent
// gift receivers (5 rows visible, from GIFT_RECEIVERS mock data).
export async function GiftReceiversPanel() {
  const t = await getTranslations("LiveBoard");

  return (
    // mm:2940:13510
    <section className="flex w-full flex-col items-start gap-4 rounded-[17px] border border-[#998C5F] bg-[#00070C] py-6 pl-6 pr-4">
      {/* mm:2940:13512 — Frame 517 */}
      <div className="flex w-full flex-col items-center justify-center gap-4">
        {/* mm:2940:13513 — D.3.1_title */}
        <h3
          className="w-full whitespace-pre-line text-center text-[22px] font-bold leading-7 text-[#FFEA9E]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {t("giftReceiversTitle")}
        </h3>

        {/* mm:2940:13514 — Frame 547 */}
        <div className="flex w-full items-start gap-4">
          {/* mm:2940:13515 — Frame 548 */}
          <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
            {GIFT_RECEIVERS.map((receiver) => (
              <GiftReceiverRow key={receiver.id} receiver={receiver} />
            ))}
          </div>

          {/* mm:2940:13521 — Frame 545 (vertical divider) */}
          <div className="h-[245px] w-[2px] shrink-0 rounded-lg bg-[#999]" />
        </div>
      </div>
    </section>
  );
}
