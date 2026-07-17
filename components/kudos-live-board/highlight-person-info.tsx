import Image from "next/image";

// mm:256:4830 (Infor) — avatar + name + badge pill, used for both the
// sender and receiver side of HighlightKudoCard.

const MONTSERRAT = "var(--font-montserrat)";

/** mm:3007:17509 (danh hiệu) — decorative badge pill, CSS approximation of the gradient art */
function BadgePill({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center justify-center whitespace-nowrap rounded-[48px] px-3 py-0.5"
      style={{
        border: "0.5px solid #FFEA9E",
        background:
          "linear-gradient(90deg, rgba(255,234,158,0.35) 0%, rgba(255,234,158,0.1) 100%)",
      }}
    >
      <span
        style={{
          fontFamily: MONTSERRAT,
          fontWeight: 700,
          fontSize: 13,
          lineHeight: "17px",
          letterSpacing: "0.1px",
          color: "#FFF",
          textShadow: "0 0 1.3px #FFF",
        }}
      >
        {label}
      </span>
    </span>
  );
}

export function HighlightPersonInfo({
  name,
  avatar,
  badge,
}: {
  name: string;
  avatar: string;
  badge: string;
}) {
  return (
    // mm:256:4830 (Infor)
    <div className="flex w-full max-w-[235px] flex-col items-center justify-center gap-3">
      {/* mm:256:4734 (Avatar) */}
      <div
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full"
        style={{ border: "1.869px solid #FFF" }}
      >
        <Image src={avatar} alt={name} fill className="object-cover" />
      </div>
      {/* mm:256:4737 (Frame 477) */}
      <div className="flex w-full flex-col items-start gap-0.5">
        <p
          className="w-full truncate text-center"
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "0.15px",
            color: "#00101A",
          }}
        >
          {name}
        </p>
        {/* mm:256:4741 (Huy hiệu + Sao) */}
        <div className="flex w-full items-center justify-center gap-2.5">
          <BadgePill label={badge} />
        </div>
      </div>
    </div>
  );
}
