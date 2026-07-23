import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MOCK_SESSION_COOKIE, isMockAuthEnabled } from "@/lib/auth/mock-session";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_PROFILE_COOKIE,
  exchangeGoogleCode,
  isGoogleOAuthEnabled,
} from "@/lib/auth/google-oauth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Provider sends error=access_denied (no code) when the user cancels the
  // Google consent screen — treat it as a cancellation, not a failure.
  if (searchParams.get("error") === "access_denied") {
    return NextResponse.redirect(`${origin}/login?error=cancelled`);
  }

  // Direct Google OAuth (DB-less demo) — our flow is identified by the state
  // param matching the state cookie set in loginWithGoogle.
  const state = searchParams.get("state");
  if (isMockAuthEnabled() && isGoogleOAuthEnabled() && state) {
    const stateCookie = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
    if (!code || !stateCookie || stateCookie !== state) {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
    const profile = await exchangeGoogleCode(code, `${origin}/auth/callback`);
    if (!profile) {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
    const response = NextResponse.redirect(`${origin}/home-page-saa`);
    response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
    // Same session cookie as mock login, so middleware gating is unchanged;
    // the profile cookie overlays the real Google identity on that session.
    response.cookies.set(MOCK_SESSION_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    response.cookies.set(GOOGLE_PROFILE_COOKIE, JSON.stringify(profile), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return response;
  }

  if (code) {
    const supabase = await createClient();
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}/home-page-saa`);
      }
      console.error("auth callback: exchangeCodeForSession failed", error);
    } catch (err) {
      console.error("auth callback: exchangeCodeForSession threw", err);
      // fall through to the error redirect
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
