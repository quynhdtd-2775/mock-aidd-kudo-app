"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { computeCountdown, type CountdownParts } from "./countdown-math";

/**
 * Ticks a countdown to `launchAt` every second and, by default, redirects to
 * `/` exactly once when it reaches zero.
 *
 * - Recomputes from `Date.now()` on every tick (never decrements a local
 *   counter), so timer drift from event-loop jitter never accumulates.
 * - Single `setInterval`, cleared on unmount.
 * - The at-zero redirect is guarded by a ref so `router.replace("/")` fires
 *   at most once, even though the interval keeps recomputing (already-zero)
 *   parts until unmount.
 */
export interface UseCountdownOptions {
  /** Whether to `router.replace("/")` once the countdown reaches zero.
   * Defaults to `true` (prelaunch page behavior). Pass `false` for
   * consumers — like the homepage — that must stay on the page at zero. */
  redirectOnZero?: boolean;
}

/** Static fallback when no launch instant is available (e.g. DB down):
 * renders "00 00 00" without ever marking complete or redirecting. */
const FALLBACK_PARTS: CountdownParts = {
  days: "00",
  hours: "00",
  minutes: "00",
  isComplete: false,
};

/** Pure decision for the at-zero redirect, extracted from the tick effect so
 * the opt-out branch is testable in node without rendering the hook. */
export function shouldRedirectAtZero(
  isComplete: boolean,
  redirectOnZero: boolean,
  hasRedirected: boolean
): boolean {
  return isComplete && redirectOnZero && !hasRedirected;
}

export function useCountdown(
  launchAt: Date | null,
  options?: UseCountdownOptions
): CountdownParts {
  const router = useRouter();
  const hasRedirectedRef = useRef(false);
  const redirectOnZero = options?.redirectOnZero !== false;
  const [parts, setParts] = useState<CountdownParts>(() =>
    launchAt ? computeCountdown(launchAt, new Date()) : FALLBACK_PARTS
  );

  useEffect(() => {
    if (!launchAt) {
      setParts(FALLBACK_PARTS);
      return;
    }

    const tick = () => {
      const next = computeCountdown(launchAt, new Date());
      setParts(next);

      if (shouldRedirectAtZero(next.isComplete, redirectOnZero, hasRedirectedRef.current)) {
        hasRedirectedRef.current = true;
        router.replace("/");
      }
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [launchAt, router, redirectOnZero]);

  return parts;
}
