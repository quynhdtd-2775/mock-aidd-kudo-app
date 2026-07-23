import { createClient } from "@/lib/supabase/server";

// Server-side query for the header's account menu / admin route gate.
// Returns a safe `'user'` default on error so the app never bricks when the
// local Supabase stack is down (e.g. Docker not started) — mirrors
// lib/notifications/notifications-queries.ts / lib/countdown/event-settings-queries.ts.

export type UserRole = "user" | "admin";

/** Reads `profiles.role` for `userId`. Defaults to `'user'` on any error or missing row. */
export async function getCurrentUserRole(userId: string): Promise<UserRole> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return "user";
    return data.role === "admin" ? "admin" : "user";
  } catch {
    return "user";
  }
}
