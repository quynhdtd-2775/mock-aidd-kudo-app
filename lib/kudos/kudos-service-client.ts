import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS entirely.
 *
 * Used ONLY on the local AUTH_MODE=mock dev path (see
 * app/kudos-live-board/actions.ts), where there is no real Supabase auth
 * session to satisfy `sender_id = auth.uid()` / storage RLS checks.
 * Production always keeps the anon-key + RLS client from
 * lib/supabase/server.ts — this client must never be reachable there.
 *
 * Requires env var SUPABASE_SERVICE_ROLE_KEY (server-side only, never
 * NEXT_PUBLIC_*) in addition to the existing NEXT_PUBLIC_SUPABASE_URL.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "createServiceRoleClient: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set",
    );
  }
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
