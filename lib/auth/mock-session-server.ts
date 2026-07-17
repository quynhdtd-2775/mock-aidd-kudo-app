// TODO(supabase): TEMPORARY mock auth (server-side half) — delete together
// with mock-session.ts once Supabase authentication is connected.
// Uses next/headers, so ONLY import from server components/actions —
// never from the middleware/proxy (that side uses mock-session.ts).
import { cookies } from "next/headers";
import type { AuthUser } from "./auth-types";
import { MOCK_SESSION_COOKIE, MOCK_USER } from "./mock-session";

/** Server components/actions: read the mock session. */
export async function getMockUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  return cookieStore.get(MOCK_SESSION_COOKIE)?.value === "1" ? MOCK_USER : null;
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

/** Server action: simulate logout. */
export async function clearMockSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MOCK_SESSION_COOKIE);
}
