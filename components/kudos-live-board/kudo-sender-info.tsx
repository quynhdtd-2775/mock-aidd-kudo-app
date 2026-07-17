import Image from "next/image";
import { KudoHeroBadge, type HeroBadgeVariant } from "./kudo-hero-badge";

// mm:256:4830 (component "Thông tin người gửi/nhận") — avatar + name + hero
// code + badge, reused for both the sender (C.3.1) and receiver (C.3.3) slot
// on a KUDO post card. Centered column layout, 235x123 in the design.
export interface KudoSenderInfoProps {
  name: string;
  heroCode: string;
  badgeVariant: HeroBadgeVariant;
  avatarSrc: string;
}

export function KudoSenderInfo({ name, heroCode, badgeVariant, avatarSrc }: KudoSenderInfoProps) {
  return (
    // mm:I3127:21871;256:4858 / I3127:21871;256:4860
    <div className="flex w-full max-w-[235px] flex-col items-center justify-center gap-[13px]">
      {/* mm:I3127:21871;256:4858;256:4734 — MM_MEDIA_Avatar */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-[1.87px] border-white">
        <Image src={avatarSrc} alt={name} fill className="object-cover" />
      </div>

      {/* mm:I3127:21871;256:4858;256:4737 — Frame 477 */}
      <div className="flex w-full flex-col items-start gap-[2px]">
        <p
          className="w-full text-center text-base font-bold leading-6 tracking-[0.15px] text-[#00101A]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {name}
        </p>

        {/* mm:I3127:21871;256:4858;256:4741 — Huy hiệu + Sao */}
        <div className="flex w-full items-center justify-center gap-[10px]">
          <span
            className="text-sm font-bold leading-5 tracking-[0.1px] text-[#999]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {heroCode}
          </span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#999]/40" />
          <KudoHeroBadge variant={badgeVariant} />
        </div>
      </div>
    </div>
  );
}
