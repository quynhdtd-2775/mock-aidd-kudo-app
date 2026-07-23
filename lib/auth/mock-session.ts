// TODO(supabase): TEMPORARY mock auth — delete this file (and its sibling
// mock-session-server.ts) once Supabase authentication is connected.
// Enabled via AUTH_MODE=mock in .env.local; never active in production.
//
// This module is runtime-agnostic (no next/headers) so the middleware/proxy
// can import it. Server actions/components use mock-session-server.ts.
import type { AuthUser } from "./auth-types";

export const MOCK_SESSION_COOKIE = "mock_session";

// id reuses DEMO_USER_ID from supabase/seed.sql / lib/profile/current-user.ts
// so pages that query the seeded database (e.g. /profile) resolve the same user.
export const MOCK_USER: AuthUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "demo@example.com",
  name: "Demo User",
  avatarUrl: "https://via.placeholder.com/150",
};

export function isMockAuthEnabled(): boolean {
  // ALLOW_MOCK_IN_PROD=true is the explicit opt-in for demo deployments
  // (no hosted database); without it, mock auth stays dev-only.
  return (
    process.env.AUTH_MODE === "mock" &&
    (process.env.NODE_ENV !== "production" ||
      process.env.ALLOW_MOCK_IN_PROD === "true")
  );
}

/** Middleware/proxy: check the mock session straight off the request cookies. */
export function hasMockSessionCookie(requestCookies: {
  get(name: string): { value: string } | undefined;
}): boolean {
  return requestCookies.get(MOCK_SESSION_COOKIE)?.value === "1";
}
