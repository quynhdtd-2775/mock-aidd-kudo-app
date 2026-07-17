// Auth facade — the single place pages, actions and headers get the current
// user from. Backed by the mock session while Supabase auth is not connected.
//
// TODO(supabase): once Supabase is connected, remove the mock branches below
// (and delete lib/auth/mock-session.ts + AUTH_MODE from .env.local); the
// Supabase paths already in place keep working unchanged.
import { createClient } from "@/lib/supabase/server";
import type { AuthUser } from "./auth-types";
import { isMockAuthEnabled } from "./mock-session";
import { getMockUser } from "./mock-session-server";

/** Current signed-in user, or null. Safe to call from server components. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  // TODO(supabase): remove mock branch.
  if (isMockAuthEnabled()) {
    return getMockUser();
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email ?? "",
      name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        user.email ??
        "",
      avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? "",
    };
  } catch {
    return null;
  }
}
