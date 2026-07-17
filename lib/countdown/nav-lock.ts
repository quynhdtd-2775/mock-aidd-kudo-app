// Pure nav-lock decision for the countdown prelaunch gate. Kept side-effect
// free and unit-testable — lib/supabase/middleware.ts calls this at the top
// of updateSession() and turns a non-null result into a redirect.

export const COUNTDOWN_PATH = "/count-down-prelaunch";

// Reachable before launch without being redirected to the countdown page.
const ALLOWLIST = [COUNTDOWN_PATH, "/login", "/auth"];

export interface NavLockResult {
  redirectTo: string;
}

/**
 * Decides whether a request should be redirected by the countdown nav-lock.
 *
 * - `launchAt === null` (DB down / no row) → fail-open: never lock.
 * - `now < launchAt` (before launch) → redirect to the countdown page unless
 *   the path is allowlisted.
 * - `now >= launchAt` (after launch) → lock lifts; the countdown page itself
 *   forwards visitors to `/`.
 */
export function resolveNavLock(
  pathname: string,
  launchAt: Date | null,
  now: Date,
): NavLockResult | null {
  if (launchAt === null) return null;

  const isBeforeLaunch = now.getTime() < launchAt.getTime();

  if (isBeforeLaunch) {
    const isAllowed = ALLOWLIST.some(
      (allowedPath) => pathname === allowedPath || pathname.startsWith(`${allowedPath}/`),
    );
    return isAllowed ? null : { redirectTo: COUNTDOWN_PATH };
  }

  // Prefix match, mirroring the allowlist: subpaths of the countdown page
  // are also forwarded home once the launch instant has passed.
  if (pathname === COUNTDOWN_PATH || pathname.startsWith(`${COUNTDOWN_PATH}/`)) {
    return { redirectTo: "/" };
  }

  return null;
}
