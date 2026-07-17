// mm:186:1426 (componentSet) — shared secondary button visuals used across
// Frame 532: the pill-shaped "ghi nhận" / "tìm kiếm" buttons and the
// rounded-4px hashtag / department dropdown filters. Static/presentational.

const MONTSERRAT = "var(--font-montserrat)";

const PILL_BORDER = "1px solid #998C5F";
const PILL_BG = "rgba(255, 234, 158, 0.10)";

/** mm:I2940:13449;186:2759 / I2940:13450;186:2759 (Pen / Search icons) */
export function PenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 20H5.425L16.2 9.225L14.775 7.8L4 18.575V20ZM2 22V17.75L16.2 3.575C16.4 3.39167 16.6208 3.25 16.8625 3.15C17.1042 3.05 17.3583 3 17.625 3C17.8917 3 18.15 3.05 18.4 3.15C18.65 3.25 18.8667 3.4 19.05 3.6L20.425 5C20.625 5.18333 20.7708 5.4 20.8625 5.65C20.9542 5.9 21 6.15 21 6.4C21 6.66667 20.9542 6.92083 20.8625 7.1625C20.7708 7.40417 20.625 7.625 20.425 7.825L6.25 22H2ZM15.475 8.525L14.775 7.8L16.2 9.225L15.475 8.525Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** mm:I2940:13459;186:2761 / I2940:13460;186:2761 (chevron-down) */
export function DownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
    </svg>
  );
}

/** mm:2940:13449 / 2940:13450 — full-width pill button, icon + label, 68px radius */
export function PillActionButton({
  icon,
  label,
  className = "",
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-[68px] px-4 py-6 text-white transition-colors duration-200 hover:bg-[rgba(255,234,158,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-2 active:translate-y-px ${className}`}
      style={{ border: PILL_BORDER, background: PILL_BG }}
    >
      {icon}
      <span
        className="text-center"
        style={{
          fontFamily: MONTSERRAT,
          fontWeight: 700,
          fontSize: 16,
          lineHeight: "24px",
          letterSpacing: "0.15px",
        }}
      >
        {label}
      </span>
    </button>
  );
}

/** mm:2940:13459 / 2940:13460 — small dropdown-style filter button, 4px radius */
export function DropdownFilterButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded p-4 text-white transition-colors duration-200 hover:bg-[rgba(255,234,158,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-2 active:translate-y-px"
      style={{ border: PILL_BORDER, background: PILL_BG }}
    >
      <span
        style={{
          fontFamily: MONTSERRAT,
          fontWeight: 700,
          fontSize: 16,
          lineHeight: "24px",
          letterSpacing: "0.15px",
        }}
      >
        {label}
      </span>
      <DownIcon className="h-6 w-6 shrink-0" />
    </button>
  );
}

/** mm:186:1425 — round arrow button used for slide prev/next (both header-level and per-card) */
export function ArrowNavButton({
  direction,
  size = 48,
  "aria-label": ariaLabel,
}: {
  direction: "left" | "right";
  size?: number;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="flex items-center justify-center rounded bg-transparent p-[10px] text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1 active:translate-y-px"
      style={{ width: size, height: size }}
    >
      {direction === "left" ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
