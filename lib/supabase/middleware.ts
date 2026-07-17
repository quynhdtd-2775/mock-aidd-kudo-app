import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  hasMockSessionCookie,
  isMockAuthEnabled,
} from "@/lib/auth/mock-session";
import { getCachedLaunchAt } from "@/lib/countdown/launch-at-cache";
import { COUNTDOWN_PATH, resolveNavLock } from "@/lib/countdown/nav-lock";

// COUNTDOWN_PATH is public: the prelaunch countdown must render for
// anonymous visitors (clarifications.md — "Public, no login required").
const PUBLIC_PATHS = ["/login", "/auth", COUNTDOWN_PATH];

export async function updateSession(request: NextRequest) {
  // ── COUNTDOWN NAV-LOCK (runs before all auth logic) ─────────────────────
  // Before launch, every route except the allowlist (countdown page, login,
  // auth) redirects here. Fail-open: a null launch_at (DB down / no row)
  // never locks the site. See lib/countdown/nav-lock.ts for the pure
  // decision matrix.
  const launchAt = await getCachedLaunchAt();
  const navLock = resolveNavLock(request.nextUrl.pathname, launchAt, new Date());
  if (navLock) {
    const url = request.nextUrl.clone();
    url.pathname = navLock.redirectTo;
    return NextResponse.redirect(url);
  }
  // ──────────────────────────────────────────────────────────────────────

  // ── TEMPORARY MOCK AUTH (development only) ──────────────────────────────
  // AUTH_MODE=mock in .env.local: the mock_session cookie stands in for a
  // Supabase session so login → home → logout is navigable without Supabase.
  // TODO(supabase): remove this block once Supabase auth is connected.
  if (isMockAuthEnabled()) {
    const hasSession = hasMockSessionCookie(request.cookies);
    const isPublic = PUBLIC_PATHS.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );
    if (!hasSession && !isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (hasSession && request.nextUrl.pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/home-page-saa";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }
  // ────────────────────────────────────────────────────────────────────────

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return withRefreshedCookies(NextResponse.redirect(url), supabaseResponse);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/home-page-saa";
    return withRefreshedCookies(NextResponse.redirect(url), supabaseResponse);
  }

  return supabaseResponse;
}

// A redirect Response is a fresh object — copy over any cookies that
// setAll() rotated onto supabaseResponse, or a refreshed session token
// is silently dropped on the redirect hop.
function withRefreshedCookies(
  redirectResponse: NextResponse,
  supabaseResponse: NextResponse,
) {
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}
