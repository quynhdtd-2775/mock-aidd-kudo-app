"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { computeCountdown, type CountdownParts } from "./countdown-math";

/**
 * Ticks a countdown to `launchAt` every second and redirects to `/` exactly
 * once when it reaches zero.
 *
 * - Recomputes from `Date.now()` on every tick (never decrements a local
 *   counter), so timer drift from event-loop jitter never accumulates.
 * - Single `setInterval`, cleared on unmount.
 * - The at-zero redirect is guarded by a ref so `router.replace("/")` fires
 *   at most once, even though the interval keeps recomputing (already-zero)
 *   parts until unmount.
 */
/** Static fallback when no launch instant is available (e.g. DB down):
 * renders "00 00 00" without ever marking complete or redirecting. */
const FALLBACK_PARTS: CountdownParts = {
  days: "00",
  hours: "00",
  minutes: "00",
  isComplete: false,
};

export function useCountdown(launchAt: Date | null): CountdownParts {
  const router = useRouter();
  const hasRedirectedRef = useRef(false);
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

      if (next.isComplete && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        router.replace("/");
      }
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [launchAt, router]);

  return parts;
}
