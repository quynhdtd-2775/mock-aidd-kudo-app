import { getLaunchAt } from "./event-settings-queries";

// TTL-cached accessor for `launch_at`, meant for hot paths that run on every
// request (the proxy nav-lock, lib/countdown/nav-lock.ts) where a DB
// round-trip per request would be wasteful. Module-level cache is safe here:
// the proxy runs on the Node.js runtime, single server instance in local/dev
// (see phase-02 Risk Assessment for multi-instance prod caveat).
const TTL_MS = 60_000;

let cache: { value: Date | null; fetchedAt: number } | null = null;

/** Returns `launch_at`, refetching from the DB once the TTL window expires.
 * Failures fall through to `getLaunchAt()`'s own safe `null` — never throws. */
export async function getCachedLaunchAt(): Promise<Date | null> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < TTL_MS) {
    return cache.value;
  }
  const value = await getLaunchAt();
  cache = { value, fetchedAt: now };
  return value;
}

/** Test-only: clears the module-level cache so tests don't leak state across cases. */
export function _resetLaunchAtCacheForTests(): void {
  cache = null;
}
