"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginWithGoogle() {
  const headerStore = await headers();
  // Origin is absent on some non-browser clients — fall back to Host so the
  // redirectTo never becomes the literal string "null/auth/callback".
  const origin =
    headerStore.get("origin") ??
    `${headerStore.get("x-forwarded-proto") ?? "http"}://${headerStore.get("host")}`;
  const supabase = await createClient();

  let providerUrl: string | null = null;
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("loginWithGoogle: signInWithOAuth failed", error);
    } else {
      providerUrl = data.url;
    }
  } catch (err) {
    console.error("loginWithGoogle: signInWithOAuth threw", err);
    providerUrl = null;
  }

  if (!providerUrl) {
    redirect("/login?error=auth");
  }

  redirect(providerUrl);
}
