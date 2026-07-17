// Session-start locale resolver. Precedence: cookie > profiles.language >
// DEFAULT_LOCALE. When a logged-in user has no cookie yet but a stored DB
// preference, seed the cookie so subsequent requests (and i18n/request.ts)
// stay consistent without re-querying the DB every render.
import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  isLocale,
  type Locale,
} from "@/lib/i18n/locale-config";
import { isMockAuthEnabled } from "@/lib/auth/mock-session";
import { resolveCurrentUserId } from "@/lib/profile/current-user";
import { createClient } from "@/lib/supabase/server";

export async function loadPreferredLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  // TODO(supabase): remove mock branch once Supabase auth is connected.
  if (isMockAuthEnabled()) return DEFAULT_LOCALE;

  const userId = await resolveCurrentUserId();
  if (!userId) return DEFAULT_LOCALE; // Guest, no cookie: default.

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("language")
    .eq("id", userId)
    .maybeSingle();

  const storedLanguage = (data as { language?: string | null } | null)?.language;
  if (error || !isLocale(storedLanguage)) return DEFAULT_LOCALE;

  try {
    cookieStore.set(LOCALE_COOKIE, storedLanguage, {
      path: "/",
      sameSite: "lax",
      maxAge: LOCALE_COOKIE_MAX_AGE,
    });
  } catch {
    // Called from a Server Component render — cookies are read-only there;
    // safe to ignore, the value is still returned for this request.
  }

  return storedLanguage;
}
