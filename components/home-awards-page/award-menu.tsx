import { getTranslations } from "next-intl/server";
import { IconTarget } from "./award-card";

const GOLD = "rgba(255, 234, 158, 1)";

interface AwardMenuItem {
  /** Figma nodeId of the menu item instance */
  id: string;
  label: string;
  href: string;
  active?: boolean;
}

/**
 * mm:313:8459 — menu item data (nodeId, target anchor, active state, and the
 * key used to resolve the item's label). Labels are resolved from
 * translations: "multiline" items (with a designed "\n" line break) come
 * from AwardsPage.menu.*, "mvp" from AwardsPage.cards.mvp.badgeText (short
 * form), everything else reuses Awards.cards.*.title.
 */
interface AwardMenuItemData {
  id: string;
  messageKey: string;
  href: string;
  active?: boolean;
  multiline?: boolean;
}

const MENU_ITEM_DATA: AwardMenuItemData[] = [
  { id: "313:8460", messageKey: "topTalent", href: "#top-talent", active: true },
  { id: "313:8461", messageKey: "topProject", href: "#top-project" },
  { id: "313:8462", messageKey: "topProjectLeader", href: "#top-project-leader", multiline: true },
  { id: "313:8463", messageKey: "bestManager", href: "#best-manager" },
  { id: "313:8464", messageKey: "signature2025Creator", href: "#signature-2025-creator", multiline: true },
  { id: "313:8465", messageKey: "mvp", href: "#mvp" },
];

function AwardMenuLink({ item }: { item: AwardMenuItem }) {
  return (
    // mm:{item.id} — 16px padding, 4px gap; active gets gold text + gold bottom border + glow
    <a
      href={item.href}
      className={
        "flex items-center gap-1 p-4 transition-colors duration-200 hover:text-[#FFEA9E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]" +
        (item.active ? " border-b" : " rounded")
      }
      style={{
        color: item.active ? GOLD : "rgba(255, 255, 255, 1)",
        borderColor: item.active ? GOLD : undefined,
      }}
      aria-current={item.active ? "true" : undefined}
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
          textShadow: item.active
            ? "0 4px 4px rgba(0, 0, 0, 0.25), 0 0 6px #FAE287"
            : undefined,
        }}
      >
        {item.label}
      </span>
    </a>
  );
}

export async function AwardMenu() {
  const tAwards = await getTranslations("Awards");
  const tPage = await getTranslations("AwardsPage");

  const items: AwardMenuItem[] = MENU_ITEM_DATA.map(({ messageKey, multiline, ...item }) => ({
    ...item,
    label: multiline
      ? tPage(`menu.${messageKey}`)
      : messageKey === "mvp"
        ? tPage("cards.mvp.badgeText")
        : tAwards(`cards.${messageKey}.title`),
  }));

  return (
    // mm:313:8459 — 178px-wide column, 16px gap at lg; wraps horizontally on mobile/tablet
    <nav
      aria-label={tPage("menuAriaLabel")}
      className="flex flex-row flex-wrap items-start gap-2 lg:w-[178px] lg:shrink-0 lg:flex-col lg:gap-4"
    >
      {items.map((item) => (
        <AwardMenuLink key={item.id} item={item} />
      ))}
    </nav>
  );
}
