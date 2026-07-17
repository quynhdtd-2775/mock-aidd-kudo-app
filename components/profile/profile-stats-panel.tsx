import Image from "next/image";
import { getTranslations } from "next-intl/server";

const MONTSERRAT = "var(--font-montserrat)";

interface StatRowProps {
  label: string;
  value: string;
}

/** mm:256:6756 (component "Chỉ số thống kê") — one label/value stat line. */
function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <p
        style={{
          fontFamily: MONTSERRAT,
          fontWeight: 700,
          fontSize: 22,
          lineHeight: "28px",
          color: "#FFF",
        }}
      >
        {label}
      </p>
      <span
        className="text-right"
        style={{
          fontFamily: MONTSERRAT,
          fontWeight: 700,
          fontSize: 32,
          lineHeight: "40px",
          color: "#FFEA9E",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export interface ProfileStatsPanelProps {
  /** mm:362:5076 */
  kudosReceived: string;
  /** mm:362:5077 */
  kudosSent: string;
  /** mm:362:5078 */
  heartsReceived: string;
  /** mm:362:5080 */
  secretBoxesOpened: string;
  /** mm:362:5081 */
  secretBoxesUnopened: string;
  /** mm:362:5082 (mms_B.6_Button mở quà) label */
  openBoxButtonLabel: string;
  onOpenBoxClick?: () => void;
}

/**
 * mm:362:5073 (mms_B_Thống kê) — user's personal stats card: 5 counter
 * rows plus the "Mở Secret Box" CTA. Container styling (border/bg) mirrors
 * kudos-live-board/stats-overview-panel.tsx for visual consistency across
 * the app's dark theme.
 */
export async function ProfileStatsPanel({
  kudosReceived,
  kudosSent,
  heartsReceived,
  secretBoxesOpened,
  secretBoxesUnopened,
  openBoxButtonLabel,
  onOpenBoxClick,
}: ProfileStatsPanelProps) {
  const t = await getTranslations("Profile");

  return (
    // mm:362:5074 (Thống kê)
    <section className="flex w-full max-w-[680px] flex-col items-start gap-2.5 rounded-[17px] border border-[#998C5F] bg-[#00070C] p-10">
      {/* mm:362:5075 (Nội dung) */}
      <div className="flex w-full flex-col items-center gap-4">
        {/* mm:362:5076 (mms_B.1_Số kudos bạn nhận được) */}
        <StatRow label={t("kudosStatReceived")} value={kudosReceived} />
        {/* mm:362:5077 (mms_B.2_Số kudos bạn đã gửi) */}
        <StatRow label={t("kudosStatSent")} value={kudosSent} />
        {/* mm:362:5078 (mms_B.3_Số tim bạn nhận được) */}
        <StatRow label={t("heartsStatReceived")} value={heartsReceived} />

        {/* mm:362:5079 (Rectangle 14 — divider) */}
        <div className="h-px w-full bg-[#2E3940]" />

        {/* mm:362:5080 (mms_B.4_Số box đã mở) */}
        <StatRow label={t("secretBoxOpened")} value={secretBoxesOpened} />
        {/* mm:362:5081 (mms_B.5_Số box chưa mở) */}
        <StatRow
          label={t("secretBoxUnopened")}
          value={secretBoxesUnopened}
        />

        {/* mm:362:5082 (mms_B.6_Button mở quà) */}
        <button
          type="button"
          onClick={onOpenBoxClick}
          className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#FFEA9E] px-4 py-4 text-[#00101A] transition-colors duration-200 hover:bg-[#ffdf78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 active:translate-y-px"
        >
          <span
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 700,
              fontSize: 22,
              lineHeight: "28px",
              textAlign: "center",
            }}
          >
            {openBoxButtonLabel}
          </span>
          {/* mm:256:6801 (IC) — reuses the existing gift icon asset shared
              with kudos-live-board's identical "Mở Secret Box" CTA */}
          <Image
            src="/kudos-live-board/icon-open-gift.svg"
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
          />
        </button>
      </div>
    </section>
  );
}
