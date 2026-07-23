/**
 * Smooth-scrolls to an award card section addressed by a menu anchor href
 * (e.g. "#top-talent"). The element resolver is injectable so the missing-
 * target guard (test case ID-13) is unit-testable in the node vitest env.
 */
export type ElementResolver = (id: string) => Pick<HTMLElement, "scrollIntoView"> | null;

const domResolver: ElementResolver = (id) => document.getElementById(id);

export function scrollToAwardSection(
  href: string,
  resolve: ElementResolver = domResolver,
): void {
  const id = href.replace(/^#/, "");
  const element = resolve(id);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}
