// TODO(supabase): TEMPORARY mock auth (server-side half) — delete together
// with mock-session.ts once Supabase authentication is connected.
// Uses next/headers, so ONLY import from server components/actions —
// never from the middleware/proxy (that side uses mock-session.ts).
import { cookies } from "next/headers";
import type { AuthUser } from "./auth-types";
import { MOCK_SESSION_COOKIE, MOCK_USER } from "./mock-session";
import { GOOGLE_PROFILE_COOKIE, type GoogleProfile } from "./google-oauth";

/** Server components/actions: read the mock session.
 * When the direct Google OAuth flow (lib/auth/google-oauth.ts) stamped a
 * profile cookie, that real identity overlays the anonymous demo user —
 * the id stays DEMO_USER_ID so seeded-DB pages keep resolving. */
export async function getMockUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  if (cookieStore.get(MOCK_SESSION_COOKIE)?.value !== "1") return null;

  const rawProfile = cookieStore.get(GOOGLE_PROFILE_COOKIE)?.value;
  if (rawProfile) {
    try {
      const profile = JSON.parse(rawProfile) as GoogleProfile;
      return { ...MOCK_USER, ...profile };
    } catch {
      // Malformed cookie — fall back to the anonymous demo user.
    }
  }
  return MOCK_USER;
}

/** Server action: simulate a successful login. */
export async function createMockSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(MOCK_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

/** Server action: simulate logout. Also drops the Google identity overlay. */
export async function clearMockSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MOCK_SESSION_COOKIE);
  cookieStore.delete(GOOGLE_PROFILE_COOKIE);
}
