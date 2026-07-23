"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { isMockAuthEnabled } from "@/lib/auth/mock-session";
import { createMockSession } from "@/lib/auth/mock-session-server";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  buildGoogleAuthUrl,
  isGoogleOAuthEnabled,
} from "@/lib/auth/google-oauth";

async function requestOrigin(): Promise<string> {
  const headerStore = await headers();
  // Origin is absent on some non-browser clients — fall back to Host so the
  // redirectTo never becomes the literal string "null/auth/callback".
  return (
    headerStore.get("origin") ??
    `${headerStore.get("x-forwarded-proto") ?? "http"}://${headerStore.get("host")}`
  );
}

export async function loginWithGoogle() {
  // DB-less demo with real Google identity: run the direct OAuth code flow
  // (lib/auth/google-oauth.ts) instead of stamping the anonymous mock session.
  if (isMockAuthEnabled() && isGoogleOAuthEnabled()) {
    const origin = await requestOrigin();
    const state = crypto.randomUUID();
    const cookieStore = await cookies();
    cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    redirect(buildGoogleAuthUrl(origin, state));
  }

  // TODO(supabase): remove mock branch once Supabase auth is connected —
  // the real OAuth flow below is untouched and takes over.
  if (isMockAuthEnabled()) {
    await createMockSession();
    redirect("/home-page-saa");
  }

  const origin = await requestOrigin();
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

export type EmailLoginState = { error: string | null };

export async function loginWithEmail(
  _prev: EmailLoginState,
  formData: FormData,
): Promise<EmailLoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const t = await getTranslations("Login");

  if (!email || !password) {
    return { error: t("missingCredentialsError") };
  }

  // TODO(supabase): remove mock branch once Supabase auth is connected.
  if (isMockAuthEnabled()) {
    await createMockSession();
    redirect("/home-page-saa");
  }

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Wrong email/password comes back as invalid_credentials — show a
      // specific message; anything else gets the generic failure text.
      if (error.code === "invalid_credentials") {
        return { error: t("invalidCredentialsError") };
      }
      console.error("loginWithEmail: signInWithPassword failed", error);
      return { error: t("loginFailedError") };
    }
  } catch (err) {
    console.error("loginWithEmail: signInWithPassword threw", err);
    return { error: t("loginFailedError") };
  }

  redirect("/home-page-saa");
}
