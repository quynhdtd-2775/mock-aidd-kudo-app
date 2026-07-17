import Image from "next/image";
import { getTranslations } from "next-intl/server";

// mm:2940:13489 "D.1_Thống kê tổng quat" — user's personal kudos/secret-box
// counters plus the "Mở Secret Box" CTA. Values (25 / x2 / 25 / 25 / 25) are
// copied verbatim from the Figma instances D.1.2 .. D.1.7.
interface StatRowProps {
  label: string;
  value: string;
  multiplier?: string;
}

function StatRow({ label, value, multiplier }: StatRowProps) {
  return (
    // mm:256:6756 (component "Chỉ số thống kê")
    <div className="flex w-full items-center justify-between gap-2">
      <p
        className="text-lg font-bold leading-7 text-white"
        style={{ fontFamily: "var(--font-montserrat)" }}
      >
        {label}
      </p>
      <div className="flex items-center gap-1">
        {multiplier ? (
          <span
            className="text-sm font-bold leading-[23px] text-white"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {multiplier}
          </span>
        ) : null}
        <span
          className="text-right text-3xl font-bold leading-10 text-[#FFEA9E]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export async function StatsOverviewPanel() {
  const t = await getTranslations("LiveBoard");

  return (
    // mm:2940:13489
    <section className="flex w-full flex-col items-start gap-4 rounded-[17px] border border-[#998C5F] bg-[#00070C] p-6">
      {/* mm:2940:13490 — Nội dung */}
      <div className="flex w-full flex-col items-center justify-center gap-4">
        {/* mm:2940:13491 — D.1.2_Số kudos nhận được */}
        <StatRow label={t("statKudosReceived")} value="25" />
        {/* mm:2940:13492 — D.1.3_Số kudos đã gửi */}
        <StatRow label={t("statKudosSent")} value="25" />
        {/* mm:3241:14882 — D.1.4_Số tim (fire badge with "x2" overlay, mm:3241:14931) */}
        <StatRow label={t("statHeartsReceived")} value="25" multiplier="🔥x2" />

        {/* mm:2940:13494 — D.1.5_phân cách nội dung */}
        <div className="h-px w-full bg-[#2E3940]" />

        {/* mm:2940:13495 — D.1.6_Số secret box đã mở */}
        <StatRow label={t("statSecretBoxOpened")} value="25" />
        {/* mm:2940:13496 — D.1.7_Số secret box chưa mở */}
        <StatRow label={t("statSecretBoxUnopened")} value="25" />

        {/* mm:2940:13497 — D.1.8_Button mở quà */}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFEA9E] px-4 py-4 text-[#00101A] transition-colors duration-200 hover:bg-[#ffdf78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 active:translate-y-px"
        >
          <span
            className="text-center text-xl font-bold leading-7"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {t("openSecretBox")}
          </span>
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
