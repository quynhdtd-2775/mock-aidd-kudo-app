"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isMockAuthEnabled } from "@/lib/auth/mock-session";
import { clearMockSession } from "@/lib/auth/mock-session-server";

export async function logout() {
  // TODO(supabase): remove mock branch once Supabase auth is connected.
  if (isMockAuthEnabled()) {
    await clearMockSession();
    redirect("/login");
  }

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("logout: signOut failed", error);
    }
  } catch (err) {
    console.error("logout: signOut threw", err);
    // Session cookies may already be gone — still send the user to /login.
  }
  redirect("/login");
}
