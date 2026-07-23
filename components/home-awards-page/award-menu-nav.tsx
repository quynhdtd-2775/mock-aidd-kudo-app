"use client";

import { useState } from "react";
import { IconTarget } from "./icon-target";
import { scrollToAwardSection } from "./scroll-to-award-section";

const GOLD = "rgba(255, 234, 158, 1)";

export interface AwardMenuNavItem {
  /** Figma nodeId of the menu item instance */
  id: string;
  label: string;
  href: string;
}

interface AwardMenuNavProps {
  items: AwardMenuNavItem[];
  ariaLabel: string;
}

/**
 * mm:313:8459 — client half of the award menu. Holds the single-active
 * click state (spec C: gold + underline moves to the clicked item) and
 * smooth-scrolls to the target card. Labels are resolved server-side in
 * award-menu.tsx and passed down. Anchor hrefs are kept for no-JS/a11y.
 */
export function AwardMenuNav({ items, ariaLabel }: AwardMenuNavProps) {
  const [activeHref, setActiveHref] = useState(items[0]?.href);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    setActiveHref(href);
    scrollToAwardSection(href);
  }

  return (
    // mm:313:8459 — 178px-wide column, 16px gap at lg; wraps horizontally on mobile/tablet
    <nav
      aria-label={ariaLabel}
      className="flex flex-row flex-wrap items-start gap-2 lg:w-[178px] lg:shrink-0 lg:flex-col lg:gap-4"
    >
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          // mm:{item.id} — 16px padding, 4px gap; active gets gold text + gold bottom border + glow
          <a
            key={item.id}
            href={item.href}
            onClick={(event) => handleClick(event, item.href)}
            className={
              "flex items-center gap-1 p-4 transition-colors duration-200 hover:text-[#FFEA9E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]" +
              (active ? " border-b" : " rounded")
            }
            style={{
              color: active ? GOLD : "rgba(255, 255, 255, 1)",
              borderColor: active ? GOLD : undefined,
            }}
            aria-current={active ? "true" : undefined}
          >
            {/* mm:I313:8460;186:1745 — MM_MEDIA_Target 24x24 */}
            <IconTarget className="h-6 w-6 shrink-0" />
            {/* mm:I313:8460;186:1502 */}
            <span
              className="whitespace-pre-line"
              style={{
                fontFamily: "var(--font-montserrat)",
                fontWeight: 700,
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: "0.25px",
                textShadow: active
                  ? "0 4px 4px rgba(0, 0, 0, 0.25), 0 0 6px #FAE287"
                  : undefined,
              }}
            >
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
