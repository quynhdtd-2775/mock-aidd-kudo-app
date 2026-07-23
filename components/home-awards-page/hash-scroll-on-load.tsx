"use client";

import { useEffect } from "react";
import { scrollToAwardSection } from "./scroll-to-award-section";

/**
 * Pure on-load hash resolver: reads the current URL hash via an injected
 * getter and, if present, forwards it to an injected scroll fn. Injectable
 * deps keep this node-testable (no jsdom needed) — mirrors the
 * injectable-resolver seam in scroll-to-award-section.ts. Missing/empty hash
 * is a no-op (test case ID-62).
 */
export function readHashOnLoad(
  getHash: () => string,
  scroll: (hash: string) => void,
): void {
  const hash = getHash();
  if (!hash) return;
  scroll(hash);
}

/**
 * mm:313:8436 — mounted once in app/home-awards-page/page.tsx. On mount,
 * scrolls to the award section addressed by the URL hash (e.g. arriving from
 * a homepage award card link `/home-awards-page#top-talent`). Renders
 * nothing; reuses the existing scrollToAwardSection helper (DRY) which
 * already no-ops when the target id doesn't exist (ID-13).
 */
export function HashScrollOnLoad(): null {
  useEffect(() => {
    readHashOnLoad(
      () => window.location.hash,
      (hash) => scrollToAwardSection(hash),
    );
  }, []);

  return null;
}
