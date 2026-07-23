"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { WriteKudoModal } from "@/components/kudos/write-kudo/write-kudo-modal";

// mm:5022:15169 (mms_6_Widget Button) — floating "write kudos" pill, glow shadow

// mm:214:3812 (MM_MEDIA_Pen) — monochrome pen, color driven by currentColor
function PenIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20.8067 6.72951C21.1967 6.33951 21.1967 5.68951 20.8067 5.31951L18.4667 2.97951C18.0967 2.58951 17.4467 2.58951 17.0567 2.97951L15.2167 4.80951L18.9667 8.55951M3.09668 16.9395V20.6895H6.84668L17.9067 9.61951L14.1567 5.86951L3.09668 16.9395Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HeroWidgetButton() {
  const t = useTranslations("Hero");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* mm:I5022:15169;214:3839 (Button) — 106x64 pill at right:19 / page y:918 (desktop) */}
      <button
        type="button"
        aria-label={t("widgetButtonAriaLabel")}
        onClick={() => setIsOpen(true)}
        className="absolute right-4 top-[620px] z-[1] flex items-center gap-2 rounded-[100px] p-4 lg:right-[19px] lg:top-[918px]"
        style={{
          backgroundColor: "rgba(255, 234, 158, 1)",
          color: "rgba(0, 16, 26, 1)",
          boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 #FAE287",
        }}
      >
        {/* mm:I5022:15169;214:3839;186:1935 (icon viết kudos) */}
        <span className="flex items-center gap-2">
          <PenIcon />
          <span
            style={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 700,
              fontSize: 24,
              lineHeight: "32px",
            }}
          >
            /
          </span>
        </span>
        {/* mm:I5022:15169;214:3839;186:1766;214:3762 (MM_MEDIA_Kudos Logo) — multicolor asset */}
        <Image src="/home/Kudos_Logo.svg" alt="" width={20} height={18} />
      </button>
      <WriteKudoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
