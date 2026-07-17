/**
 * Pure countdown math: no React, no timers, no DOM — safe to unit test in
 * isolation (Phase 06). All values are derived from an absolute instant
 * (`launchAt - now`), never decremented locally, so repeated calls never
 * drift.
 */

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

/** Spec upper bound: DAYS display clamps to 99 when more than 99 days remain. */
const MAX_DISPLAY_DAYS = 99;

export interface CountdownParts {
  /** Zero-padded 2-digit days, clamped to "00"–"99". */
  days: string;
  /** Zero-padded 2-digit hours, "00"–"23". */
  hours: string;
  /** Zero-padded 2-digit minutes, "00"–"59". */
  minutes: string;
  /** True once `launchAt` is at or before `now` (countdown reached zero). */
  isComplete: boolean;
}

/** Left-pads a non-negative integer to 2 digits (e.g. 3 -> "03"). */
export function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

/**
 * Computes the display parts for a countdown from `launchAt` as observed at
 * `now`. Recomputed from the absolute difference each call — never decrement
 * a locally-held remaining value, or ticks will drift under event-loop jitter.
 *
 * - `remainingMs <= 0` (launch has passed, or is exactly now) → all "00",
 *   `isComplete: true`.
 * - Days above the 2-digit display range (> 99) clamp to "99" (confirmed
 *   product decision — out-of-range countdowns still read as "99" rather
 *   than overflowing the UI).
 */
export function computeCountdown(launchAt: Date, now: Date): CountdownParts {
  const remainingMs = launchAt.getTime() - now.getTime();

  if (remainingMs <= 0) {
    return { days: "00", hours: "00", minutes: "00", isComplete: true };
  }

  const rawDays = Math.floor(remainingMs / MS_PER_DAY);
  const hours = Math.floor(remainingMs / MS_PER_HOUR) % 24;
  const minutes = Math.floor(remainingMs / MS_PER_MINUTE) % 60;

  const days = Math.min(rawDays, MAX_DISPLAY_DAYS);

  return {
    days: pad2(days),
    hours: pad2(hours),
    minutes: pad2(minutes),
    isComplete: false,
  };
}
