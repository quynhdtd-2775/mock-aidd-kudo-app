const MONTSERRAT = "var(--font-montserrat)";

/**
 * mm:362:5066..5071 (mms_B2_Huy hiệu .. mms_B7_Huy hiệu) — badge component
 * instances (`3053:10045`) whose icon slot has no filled artwork in this
 * Figma revision (no MM_MEDIA_* asset resolved for them). Renders a shared
 * inline SVG ribbon placeholder inside the same 64x64 dark circle shell —
 * per project rules, no unique per-badge assets are invented.
 */
function BadgeIconPlaceholder({ unlocked = false }: { unlocked?: boolean }) {
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#323231]"
      style={{ border: unlocked ? "2px solid #FFEA9E" : "2px solid #FFF" }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill={unlocked ? "#FFEA9E" : "none"}
        aria-hidden="true"
      >
        <path
          d="M12 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L12 14.27l-4.77 2.44.91-5.32L4.27 7.62l5.34-.78L12 2z"
          stroke="#FFEA9E"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** Spec (mms_A_Info): icons unlocked via Secret box render highlighted; locked stay gray. */
export interface BadgeIconSlot {
  id: string;
  unlocked: boolean;
}

export interface ProfileBadgesRowProps {
  /** Number of badge placeholders to render — mm:362:5065 has 6 (5066..5071) */
  badgeCount?: number;
  /** Icon collection slots; when provided, overrides badgeCount. */
  icons?: BadgeIconSlot[];
  /** Link/label under the badges row — mm:3053:10052 */
  collectionLinkLabel: string;
  onCollectionLinkClick?: () => void;
}

/**
 * mm:362:5064 (mms_A.3_Huy Hiệu) — row of badge icons plus the
 * "Bộ sưu tập icon của tôi" link label beneath it.
 */
export function ProfileBadgesRow({
  badgeCount = 6,
  icons,
  collectionLinkLabel,
  onCollectionLinkClick,
}: ProfileBadgesRowProps) {
  const slots: BadgeIconSlot[] =
    icons ??
    Array.from({ length: badgeCount }, (_, index) => ({
      id: String(index),
      unlocked: false,
    }));
  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* mm:362:5065 (Danh hiệu) */}
      <div className="flex items-start gap-4">
        {slots.map((slot) => (
          // mm:362:5066..5071 (mms_B2_Huy hiệu..mms_B7_Huy hiệu)
          <BadgeIconPlaceholder key={slot.id} unlocked={slot.unlocked} />
        ))}
      </div>

      {/* mm:3053:10052 (A.2.1. Tên — collection link) */}
      <button
        type="button"
        onClick={onCollectionLinkClick}
        className="text-center transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        style={{
          fontFamily: MONTSERRAT,
          fontWeight: 700,
          fontSize: 22,
          lineHeight: "28px",
          color: "#FFF",
        }}
      >
        {collectionLinkLabel}
      </button>
    </div>
  );
}
