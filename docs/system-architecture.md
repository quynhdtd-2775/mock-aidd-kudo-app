# System Architecture

Stack: Next.js 16.2.10 (App Router) + React 19 + Supabase (local, via `@supabase/ssr`) + Tailwind CSS 4.

## Route Map

| Route | File | Auth |
|---|---|---|
| `/` | `app/page.tsx` | create-next-app scaffold, unmodified — not yet built out as the app's real landing page |
| `/login` | `app/login/page.tsx` | Public. Renders header/hero/footer; shows an error state when `?error=auth` is present |
| `/auth/callback` | `app/auth/callback/route.ts` | Public. OAuth code-exchange endpoint (GET) |

## Auth Flow (Google OAuth via Supabase, PKCE)

Google is the only sign-in method — there is no email/password path (a prior email/password
iteration was replaced by this flow).

1. User clicks **Login With Google** (`app/login/google-login-button.tsx`), a `<form>` that posts
   to the `loginWithGoogle` server action.
2. `loginWithGoogle` (`app/login/actions.ts`):
   - Builds `redirectTo` as `${origin}/auth/callback`, falling back to
     `x-forwarded-proto`/`host` headers when the `origin` header is absent.
   - Calls `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } })`.
   - On success, `redirect()`s the browser to the provider URL Supabase returns.
   - On failure (error or thrown exception), redirects to `/login?error=auth`.
3. Google redirects back to `/auth/callback?code=...`.
4. `app/auth/callback/route.ts` calls `supabase.auth.exchangeCodeForSession(code)`.
   - Success → redirect to `/`.
   - Failure/missing code → redirect to `/login?error=auth`.
5. Session cookies are set by the Supabase SSR client during the exchange and refreshed on every
   request afterward by the proxy/middleware layer below.

## Session Middleware (Next 16 `proxy.ts`)

Next 16 renamed the middleware convention to `proxy.ts` (see `AGENTS.md` — breaking change vs.
older Next.js). `proxy.ts` delegates to `updateSession()` in `lib/supabase/middleware.ts`, which
runs on every request matched by its `config.matcher` (excludes `_next/static`, `_next/image`,
`favicon.ico`, and static image extensions):

- Refreshes the Supabase session via `supabase.auth.getUser()`.
- `PUBLIC_PATHS = ["/login", "/auth"]` — anything else requires a signed-in user.
- No user + non-public path → redirect to `/login`.
- Signed-in user hitting `/login` → redirect to `/`.
- Refreshed session cookies are copied onto the redirect response in `withRefreshedCookies()`
  (a plain `NextResponse.redirect` is a new object and won't otherwise carry the rotated cookies).

Supabase client helpers: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server
components/actions, via `next/headers` cookies).

## Local Environment Setup

Copy `.env.local.example` to `.env.local` and fill in from `supabase status` after `supabase start`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Google provider must be configured on the **local Supabase project** (not in this app):

1. Create OAuth client credentials in Google Cloud Console (type: Web application).
   Authorized redirect URI: `http://127.0.0.1:54321/auth/v1/callback`.
2. In the Supabase project's `config.toml`:
   ```toml
   [auth.external.google]
   enabled = true
   client_id = "env(SUPABASE_AUTH_GOOGLE_CLIENT_ID)"
   secret = "env(SUPABASE_AUTH_GOOGLE_SECRET)"
   ```
   Export `SUPABASE_AUTH_GOOGLE_CLIENT_ID` / `SUPABASE_AUTH_GOOGLE_SECRET` before `supabase start`.
3. Also allow the app callback in `config.toml`:
   ```toml
   additional_redirect_urls = ["http://localhost:3000/auth/callback"]
   ```

## UI Source

Login screen UI (`app/login/{page,login-header,login-hero,google-login-button,login-footer}.tsx`,
`login-fonts.ts`, assets under `public/login/`) was implemented from a Figma design ("SAA 2025
Root Further"). Component comments reference Figma node IDs (e.g. `mms_C_Keyvisual`, `mms_B.3_Login
button`) — cross-check those against the source Figma file before restyling.

## Known Gaps (not yet addressed by this feature)

- `/` (`app/page.tsx`) is unchanged create-next-app boilerplate; middleware already gates it
  behind auth, but it has no real content yet.
- No sign-out action exists yet.
