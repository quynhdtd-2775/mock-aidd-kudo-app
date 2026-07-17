"use server";

// Server action invoked by the locale switcher (phase 04 UI). Always sets
// the cookie; additionally persists to profiles.language for logged-in,
// non-mock users so the preference survives across devices/sessions.
import { cookies } from "next/headers";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, isLocale } from "@/lib/i18n/locale-config";
import { isMockAuthEnabled } from "@/lib/auth/mock-session";
import { resolveCurrentUserId } from "@/lib/profile/current-user";
import { createClient } from "@/lib/supabase/server";

export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) {
    throw new Error(`setLocale: unsupported locale "${locale}"`);
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: LOCALE_COOKIE_MAX_AGE,
  });

  // TODO(supabase): remove mock branch once Supabase auth is connected.
  if (isMockAuthEnabled()) return;

  const userId = await resolveCurrentUserId();
  if (!userId) return; // Guest: cookie only, no DB write.

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ language: locale })
    .eq("id", userId);

  if (error) {
    console.error("setLocale: failed to persist language preference", error);
  }
}
