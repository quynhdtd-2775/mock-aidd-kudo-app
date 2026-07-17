import { createClient } from "@/lib/supabase/server";
import { isMockAuthEnabled } from "@/lib/auth/mock-session";
import { getMockUser } from "@/lib/auth/mock-session-server";

// Mirrors DEMO_USER_ID in supabase/seed.sql — the seed file is the source of
// truth; keep the two in sync.
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

/**
 * Resolves the current user's id for the profile page.
 * Returns null when unauthenticated.
 */
export async function resolveCurrentUserId(): Promise<string | null> {
  // TODO(supabase): remove mock branch once Supabase auth is connected.
  // MOCK_USER.id === DEMO_USER_ID, so the mock session resolves to the
  // seeded demo profile.
  if (isMockAuthEnabled()) {
    return (await getMockUser())?.id ?? null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
