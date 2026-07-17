// mm:2940:14174 (B.7_Spotlight) — the 1157x548 rounded photo panel: layered
// backdrop photos + dark overlay, live "388 KUDOS" counter, sunner search
// pill, scattered floating name particles, and a stacked notification feed.
// Static/presentational; no real photo asset was flagged in Figma for the
// two backdrop rectangles (image 24 / image 25), so the existing downloaded
// kv-background.png is reused as the backdrop photo per project convention.

import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SpotlightNameParticleTag } from "./spotlight-name-particle";
import { SPOTLIGHT_NAME_PARTICLES } from "./spotlight-name-particles-data";

const MONTSERRAT = "var(--font-montserrat)";
const KUDOS_NOTIFICATION = "08:30PM Nguyễn Bá Chức đã nhận được một Kudos mới";
const NOTIFICATION_COUNT = 6;

function PanZoomIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 4a6 6 0 1 0 3.76 10.68l4.28 4.28 1.42-1.42-4.28-4.28A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-1 1v2H7v2h2v2h2v-2h2V9h-2V7H9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SearchPillIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
        fill="currentColor"
      />
    </svg>
  );
}

export async function SpotlightBoardPanel() {
  const t = await getTranslations("LiveBoard");

  return (
    // mm:2940:14174
    <div
      className="relative aspect-[1157/548] w-full max-w-[1157px] overflow-hidden rounded-[47px] border"
      style={{ borderColor: "#998C5F" }}
    >
      {/* mm:2940:14178 / 2940:14181 (image 24 / image 25 backdrop photos) */}
      <Image
        src="/kudos-live-board/kv-background.png"
        alt=""
        fill
        aria-hidden="true"
        className="object-cover"
      />

      {/* mm:2940:14173 (Root further mo rong 1) — dark scrim over the photo */}
      <div className="absolute inset-0 bg-black/70" />

      {/* mm:3007:17482 (B.7.1_388 KUDOS) */}
      <p
        className="absolute text-white"
        style={{
          left: "40.6%",
          top: "2.6%",
          fontFamily: MONTSERRAT,
          fontWeight: 700,
          fontSize: 36,
          lineHeight: "44px",
        }}
      >
        {t("spotlightKudosCount")}
      </p>

      {/* mm:2940:14833 (B.7.3_Tìm kiếm sunner) */}
      <button
        type="button"
        className="absolute flex items-center gap-1.5 rounded-full px-[11px] py-[16px] text-white transition-colors duration-200 hover:bg-[rgba(255,234,158,0.18)]"
        style={{
          left: "2.2%",
          top: "4.7%",
          border: "1px solid #998C5F",
          background: "rgba(255, 234, 158, 0.10)",
        }}
      >
        <SearchPillIcon />
        <span
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 500,
            fontSize: 11,
            lineHeight: "16px",
          }}
        >
          {t("spotlightSearch")}
        </span>
      </button>

      {/* mm:2940:14186 etc. — scattered floating sunner-name particles */}
      {SPOTLIGHT_NAME_PARTICLES.map((particle, index) => (
        <SpotlightNameParticleTag key={`${particle.name}-${index}`} {...particle} />
      ))}

      {/* mm:2940:14230 / 3004:15995-15999 — stacked "new kudos" notification feed */}
      <div className="absolute" style={{ left: "4.2%", top: "74.8%" }}>
        {Array.from({ length: NOTIFICATION_COUNT }).map((_, index) => (
          <p
            key={index}
            className="whitespace-nowrap text-white"
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 700,
              fontSize: 14,
              lineHeight: "20px",
              letterSpacing: "0.1px",
              marginTop: index === 0 ? 0 : 3,
            }}
          >
            {KUDOS_NOTIFICATION}
          </p>
        ))}
      </div>

      {/* mm:3007:17479 (B.7.2_Pan zoom) */}
      <button
        type="button"
        aria-label={t("panZoomAriaLabel")}
        className="absolute flex h-[30px] w-[30px] items-center justify-center rounded bg-black/30 text-white transition-colors duration-200 hover:bg-black/50"
        style={{ left: "94.1%", top: "85.9%" }}
      >
        <PanZoomIcon />
      </button>
    </div>
  );
}
