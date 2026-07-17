import { createClient } from "@/lib/supabase/server";

// Server-side query for the countdown prelaunch page. Returns a safe `null`
// on error so the site never bricks when the local Supabase stack is down
// (e.g. Docker not started) — mirrors lib/profile/profile-queries.ts.

/** Reads the single `event_settings` row's `launch_at`. Uncached — use
 * getCachedLaunchAt() (lib/countdown/launch-at-cache.ts) on hot paths like
 * the proxy that run on every request. */
export async function getLaunchAt(): Promise<Date | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("event_settings")
      .select("launch_at")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return null;
    return new Date(data.launch_at);
  } catch {
    return null;
  }
}
