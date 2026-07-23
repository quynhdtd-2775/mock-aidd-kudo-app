import { getTranslations } from "next-intl/server";
import { AwardMenuNav, type AwardMenuNavItem } from "./award-menu-nav";

/**
 * mm:313:8459 — menu item data (nodeId, target anchor, and the key used to
 * resolve the item's label). Labels are resolved from translations:
 * "multiline" items (with a designed "\n" line break) come from
 * AwardsPage.menu.*, "mvp" from AwardsPage.cards.mvp.badgeText (short
 * form), everything else reuses Awards.cards.*.title.
 *
 * Server half: resolves labels and hands them to the client AwardMenuNav,
 * which owns the click-driven active state (spec C).
 */
interface AwardMenuItemData {
  id: string;
  messageKey: string;
  href: string;
  multiline?: boolean;
}

const MENU_ITEM_DATA: AwardMenuItemData[] = [
  { id: "313:8460", messageKey: "topTalent", href: "#top-talent" },
  { id: "313:8461", messageKey: "topProject", href: "#top-project" },
  { id: "313:8462", messageKey: "topProjectLeader", href: "#top-project-leader", multiline: true },
  { id: "313:8463", messageKey: "bestManager", href: "#best-manager" },
  { id: "313:8464", messageKey: "signature2025Creator", href: "#signature-2025-creator", multiline: true },
  { id: "313:8465", messageKey: "mvp", href: "#mvp" },
];

export async function AwardMenu() {
  const tAwards = await getTranslations("Awards");
  const tPage = await getTranslations("AwardsPage");

  const items: AwardMenuNavItem[] = MENU_ITEM_DATA.map(
    ({ messageKey, multiline, ...item }) => ({
      ...item,
      label: multiline
        ? tPage(`menu.${messageKey}`)
        : messageKey === "mvp"
          ? tPage("cards.mvp.badgeText")
          : tAwards(`cards.${messageKey}.title`),
    }),
  );

  return <AwardMenuNav items={items} ariaLabel={tPage("menuAriaLabel")} />;
}
