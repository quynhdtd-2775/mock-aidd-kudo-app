const MONTSERRAT = "var(--font-montserrat)";

/**
 * mm:3053:6061 (danh hiệu) — decorative rank/legend badge pill.
 * CSS approximation of the gradient art, same pattern as
 * kudos-live-board/highlight-person-info.tsx BadgePill, sized down to
 * match this screen's compact 109x19 instance.
 */
function LegendBadgePill({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center justify-center whitespace-nowrap rounded-[48px] px-2.5 py-0.5"
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
          fontSize: 12.8,
          lineHeight: "17px",
          letterSpacing: "0.09px",
          color: "#FFF",
          textShadow: "0 0 1.3px #FFF",
        }}
      >
        {label}
      </span>
    </span>
  );
}

export interface ProfileInfoCardProps {
  /** Full display name — mm:362:5055 */
  name: string;
  /** Department/team code shown next to the legend badge — mm:362:5057 */
  department: string;
  /** Legend/rank badge label — mm:3053:6061 */
  legendLabel: string;
  /** Avatar image URL. When omitted, a neutral initials placeholder renders instead. */
  avatarSrc?: string;
}

/** Derive up to 2 initials from a Vietnamese display name for the avatar placeholder. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * mm:362:5052 (mms_A_Info) — profile avatar + name + department + legend
 * badge block. No MM_MEDIA asset was resolved for the 200x200 avatar
 * (mm:362:5053) in assets.md, so it renders as a neutral initials
 * placeholder unless a real `avatarSrc` is supplied by the caller.
 */
export function ProfileInfoCard({
  name,
  department,
  legendLabel,
  avatarSrc,
}: ProfileInfoCardProps) {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      {/* mm:362:5053 (mms_A.1_Avatar) */}
      <div
        className="relative flex h-[200px] w-[200px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2E3940]"
        style={{ border: "4px solid #FFF" }}
      >
        {avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- fixed-size fill avatar, next/image not required here
          <img
            src={avatarSrc}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="text-5xl font-bold text-white"
            style={{ fontFamily: MONTSERRAT }}
          >
            {getInitials(name)}
          </span>
        )}
      </div>

      {/* mm:362:5054 (mms_A.2_Name) */}
      <div className="flex w-full flex-col items-center gap-2">
        {/* mm:362:5055 (A.2.1. Tên) */}
        <p
          className="text-center"
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 36,
            lineHeight: "44px",
            color: "#FFEA9E",
          }}
        >
          {name}
        </p>
        {/* mm:362:5056 (A.2.2. Thông tin chi tiết) */}
        <div className="flex items-center gap-2.5">
          {/* mm:362:5057 (Phong Ban) */}
          <span
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 700,
              fontSize: 22,
              lineHeight: "28px",
              color: "#FFF",
            }}
          >
            {department}
          </span>
          {/* mm:3053:6061 (danh hiệu) */}
          <LegendBadgePill label={legendLabel} />
        </div>
      </div>
    </div>
  );
}
