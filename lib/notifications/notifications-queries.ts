import { createClient } from "@/lib/supabase/server";
import type { Notification } from "./notifications-types";

// Server-side query for the header's notification bell. Returns a safe `[]`
// on error so the header never bricks when the local Supabase stack is down
// (e.g. Docker not started) — mirrors lib/countdown/event-settings-queries.ts.

/** Reads notifications for `userId`, newest first. Self-scoped by RLS. */
export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("id, user_id, title, body, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      body: row.body,
      readAt: row.read_at,
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}
