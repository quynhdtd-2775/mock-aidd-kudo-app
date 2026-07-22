# System Architecture

Stack: Next.js 16.2.10 (App Router) + React 19 + Supabase (local, via `@supabase/ssr`) + Tailwind CSS 4 + next-intl 4.13.2 (i18n).

## Route Map

| Route | File | Auth |
|---|---|---|
| `/` | `app/page.tsx` | Redirects to `/home-page-saa` (the real landing page lives there) |
| `/login` | `app/login/page.tsx` | Public. Renders header/hero/footer; shows an error state when `?error=auth` is present |
| `/auth/callback` | `app/auth/callback/route.ts` | Public. OAuth code-exchange endpoint (GET) |
| `/profile` | `app/profile/page.tsx` | Gated. Server component rendering "Profile bản thân" (keyvisual/header, user info card, icon collection, stats, awards header, received-kudos posts). Renders a safe empty state (no crash) when unauthenticated or when the local Supabase project is unreachable |
| `/count-down-prelaunch` | `app/count-down-prelaunch/page.tsx` | Public. Full-viewport LED-style countdown (DAYS/HOURS/MINUTES) to `event_settings.launch_at`. Before launch, the nav-lock (see Session Middleware below) redirects every other route here; after launch it redirects subpaths of itself to `/`. Degrades to a static "00 00 00" display when `launch_at` is unreadable (DB down) |
| `/kudos-live-board` | `app/kudos-live-board/page.tsx` | Gated. ALL KUDOS feed — real `kudos` data; see Kudos Feed section below. Highlight banner, spotlight, and the stats/gift-receivers sidebar are still mock |

Other gated routes exist under this branch (`/home-page-saa`, `/home-awards-page`) — out of scope for this doc pass; documented here only where they intersect `/profile` routing (the post-login redirect target).

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
   - Success → redirect to `/`, which itself redirects to `/home-page-saa`.
   - Failure/missing code → redirect to `/login?error=auth`.
5. Session cookies are set by the Supabase SSR client during the exchange and refreshed on every
   request afterward by the proxy/middleware layer below.

## Session Middleware (Next 16 `proxy.ts`)

Next 16 renamed the middleware convention to `proxy.ts` (see `AGENTS.md` — breaking change vs.
older Next.js). `proxy.ts` delegates to `updateSession()` in `lib/supabase/middleware.ts`, which
runs on every request matched by its `config.matcher` (excludes `_next/static`, `_next/image`,
`favicon.ico`, and static image extensions):

- **Countdown nav-lock (runs first, before any auth check).** `getCachedLaunchAt()`
  (`lib/countdown/launch-at-cache.ts`, 60s TTL module cache over
  `lib/countdown/event-settings-queries.ts`) reads `event_settings.launch_at`; the pure
  `resolveNavLock()` (`lib/countdown/nav-lock.ts`) decides the redirect:
  - Before launch: every path except `/count-down-prelaunch`, `/login`, `/auth` (and their
    subpaths) redirects to `/count-down-prelaunch`.
  - After launch: `/count-down-prelaunch` (and subpaths) redirects to `/`.
  - `launch_at === null` (DB down / no row) fails open — never locks the site.
- Refreshes the Supabase session via `supabase.auth.getUser()`.
- `PUBLIC_PATHS = ["/login", "/auth", "/count-down-prelaunch"]` — anything else requires a
  signed-in user.
- No user + non-public path → redirect to `/login`.
- Signed-in user hitting `/login` → redirect to `/home-page-saa`.
- Refreshed session cookies are copied onto the redirect response in `withRefreshedCookies()`
  (a plain `NextResponse.redirect` is a new object and won't otherwise carry the rotated cookies).
- **Dev-only mock auth** (replaced the earlier `DISABLE_AUTH` blanket bypass): when
  `AUTH_MODE=mock` in `.env.local` (and `NODE_ENV !== "production"`), a cookie-based mock session
  stands in for Supabase auth so login → home → logout is fully navigable without Supabase:
  - `lib/auth/mock-session.ts` (runtime-agnostic: cookie name, `MOCK_USER`, `isMockAuthEnabled()`)
    and `lib/auth/mock-session-server.ts` (`next/headers` half: get/create/clear the
    `mock_session` cookie). Both carry `TODO(supabase)` markers — delete them plus `AUTH_MODE`
    once Supabase auth is connected; the real Supabase code paths remain in place and take over.
  - `lib/auth/auth-service.ts` — `getCurrentUser()` facade used by the site headers: mock user
    when mock auth is on, Supabase session user otherwise.
  - `updateSession()` gates on the `mock_session` cookie exactly like a real session (redirect
    to `/login` without it, `/login` → `/home-page-saa` with it); `loginWithGoogle`/`loginWithEmail`
    create the cookie, `logout` clears it.
  - `MOCK_USER.id` equals `DEMO_USER_ID` (`00000000-0000-4000-8000-000000000001`, defined in
    `supabase/seed.sql`), so `/profile` resolves the seeded demo profile under mock auth.

Supabase client helpers: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server
components/actions, via `next/headers` cookies).

## Local Environment Setup

Copy `.env.local.example` to `.env.local` and fill in from `supabase status` after `supabase start`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — must match the currently-running local stack; a stale/demo
  JWT here fails as `PGRST301`, not a clear auth error.
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, never `NEXT_PUBLIC_*`) — required when
  `AUTH_MODE=mock` (see Dev-only mock auth above): mock auth has no real Supabase session, so
  kudo writes use the service-role client to bypass RLS. From the `supabase status`
  "service_role key" line.

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

Requires Docker. Bring up the local stack and load the schema/seed before `/profile` will show
real data (without this it renders its safe empty state):

```
pnpm dlx supabase start
pnpm dlx supabase db reset   # applies supabase/migrations/*.sql + supabase/seed.sql
```

`supabase/config.toml` has `[analytics] enabled = false` — the analytics container mounts the
Docker socket, which fails under Colima (`mount source path 'docker.sock': operation not
supported`). Local-dev workaround for Colima-based Docker; re-enable if running Docker Desktop.

## Database Schema (Supabase, local)

Defined in `supabase/migrations/20260714070000_profile_schema.sql`, seeded via `supabase/seed.sql`.
Backs the `/profile` route (`lib/profile/profile-queries.ts`). Extended by
`supabase/migrations/20260716090000_profile_language.sql` (adds `profiles.language`, see
Internationalization above) and `supabase/migrations/20260716100000_write_kudos.sql` (adds
`kudos.is_anonymous`/`anonymous_name`/`image_urls`, a sender-scoped insert policy, and the public
`kudos-images` Storage bucket used by the write-kudos modal's upload flow). Table-level
privileges — a separate layer from RLS — come from
`supabase/migrations/20260722070000_grant_table_privileges.sql`; see Kudos Feed below for why
that migration exists.

| Table | Purpose |
|---|---|
| `profiles` | One row per `auth.users` id — display name, hero code/badge, avatar, boxes opened/unopened, `language` (`'vi'` \| `'en'`, default `'vi'`) |
| `kudos` | Sender → receiver messages with hashtags, attachment count, `hearts_count`, `is_spam` flag, `is_anonymous`/`anonymous_name` (anonymous send), `image_urls` (uploaded to the `kudos-images` Storage bucket) |
| `secret_box_icons` | Catalog of unlockable icons (name, image, sort order) |
| `user_icon_unlocks` | Join table: which icons a user has unlocked, and when |

RLS is enabled on all four tables with permissive `SELECT` policies for `anon`/`authenticated`
(local-dev only). Two narrower write policies sit on top: the owner-scoped `UPDATE` policy on
`profiles` (`using (auth.uid() = id) with check (auth.uid() = id)`, added alongside the
`language` column) so a logged-in user can persist their own language preference, and the
sender-scoped `INSERT` policy on `kudos` (`with check (sender_id = auth.uid())`) from the
write-kudos migration. **Do not ship this RLS setup to production as-is.** RLS is necessary but
not sufficient for access — table-level `GRANT`s are a separate Postgres layer (see Kudos Feed
below); a table with RLS policies but no `GRANT` still rejects every query with `42501`.
`lib/profile/profile-queries.ts` returns safe empty results on query error rather than throwing.

Defined separately in `supabase/migrations/20260714080000_event_settings.sql`. Backs the
countdown nav-lock and `/count-down-prelaunch` (`lib/countdown/event-settings-queries.ts`).

| Table | Purpose |
|---|---|
| `event_settings` | Singleton row (`id = 1`, enforced via a `check` constraint). `launch_at timestamptz` is the absolute instant the countdown page counts down to; seeded `2026-07-21 09:00:00+07` |

RLS: permissive public `SELECT` (`anon`/`authenticated`), no write policies — same local-dev-only
convention as the profile tables above; **do not ship as-is to production**.

## Kudos Feed (ALL KUDOS on `/kudos-live-board`)

The ALL KUDOS feed renders real `kudos` rows (previously mock data):

- `lib/kudos/kudos-feed-queries.ts` (`getAllKudos`) — every `kudos` row, newest first, joined
  with sender + receiver `profiles` (display name, hero code/badge, avatar). Returns `[]` on any
  query error so the page still renders its empty state instead of crashing if the local
  Supabase stack is down or a permissions regression reintroduces the `42501` error below.
- `lib/kudos/kudo-feed-mapper.ts` (`toKudoFeedCards`) — pure, server-only mapper to
  `KudoPostData` (the feed card's prop shape). For `is_anonymous` rows, the joined `sender`
  profile is simply never read — real name/hero/avatar never reach the mapped card — and
  `anonymousName` (falling back to "Ẩn danh") is shown instead. `message` is also rendered via
  `sanitizeMessageHtml` (`lib/kudos/sanitize-message-html.ts`) as `messageHtml`; the write-kudos
  modal stores Tiptap output as sanitized HTML, and `kudo-post-card.tsx` renders it through
  `dangerouslySetInnerHTML` (pre-sanitized upstream), falling back to plain `message` text for
  any row without `messageHtml`.
- Display formatting (`formatCount`, `formatKudoTime`) was extracted to
  `lib/format/kudo-display-format.ts` out of `lib/profile/profile-view-mappers.ts`, so `/profile`
  and `/kudos-live-board` format counts/timestamps identically.
- Still mock: the highlight banner, spotlight panel, and the `StatsOverviewPanel` /
  `GiftReceiversPanel` sidebar (`kudo-posts-data.ts` mock arrays) — only the main feed column
  reads from the database.

**Local-dev permissions gotcha:** an RLS policy is not enough on its own — Postgres also
requires an explicit `GRANT` on the table for the querying role, and the original schema
migrations never issued one. Every feed read failed with `42501` until
`supabase/migrations/20260722070000_grant_table_privileges.sql` added
`grant select on all tables in schema public to anon, authenticated`,
`grant insert on public.kudos to authenticated`, and full grants (+ default privileges so future
migrations inherit them) to `service_role`. Re-run `supabase db reset` after pulling this
migration.

**Known gap:** anonymization currently happens only at the app's read layer — the real
`sender_id` on an anonymous row is still fetchable via a direct PostgREST call using the anon key
(e.g. `select=sender_id` on `kudos`), since RLS/GRANTs allow reading the column, only
`kudo-feed-mapper.ts` chooses not to surface it. Recommended production fix: a
`security_invoker` view (or column-level RLS) that nulls `sender_id` for anonymous rows at the
database layer, not just in application code.

## UI Source

Login screen UI (`app/login/{page,login-header,login-hero,google-login-button,login-footer}.tsx`,
`login-fonts.ts`, assets under `public/login/`) was implemented from a Figma design ("SAA 2025
Root Further"). Component comments reference Figma node IDs (e.g. `mms_C_Keyvisual`, `mms_B.3_Login
button`) — cross-check those against the source Figma file before restyling.

Countdown prelaunch UI (`app/count-down-prelaunch/{page,countdown-display,countdown-unit,
countdown-digit-box,countdown-fonts}.tsx`, asset `public/count-down-prelaunch/background.png`)
was implemented from MoMorph screen `mms 2268:35127` ("Countdown - Prelaunch page"), Montserrat
font. The Figma spec's "Digital Numbers" LED font is unavailable in this project and falls back
to monospace. Countdown tick/redirect logic lives in `lib/countdown/` (`countdown-math.ts` pure
math, `use-countdown.ts` client hook — ticks every second, redirects to `/` once at zero).

## Internationalization (i18n)

Cookie-based locale switching (VI/EN) via `next-intl` — **no URL prefix** (`/en/...` routes do not
exist; the same path serves either language based on the resolved locale).

- **Config**: `next.config.ts` wraps the config with `createNextIntlPlugin("./i18n/request.ts")`.
  `i18n/request.ts` (`getRequestConfig`) resolves the active locale via
  `loadPreferredLocale()` and loads the matching `messages/{locale}.json`.
- **Locale contract**: `lib/i18n/locale-config.ts` — `SUPPORTED_LOCALES = ["vi", "en"]`,
  `DEFAULT_LOCALE = "vi"`, cookie name `NEXT_LOCALE` (1-year max-age), and the `isLocale()` type
  guard used to validate any untrusted locale value before it reaches a file path or a DB write.
- **Resolution precedence** (`lib/i18n/load-preferred-locale.ts`): `NEXT_LOCALE` cookie →
  `profiles.language` (logged-in, non-mock users only) → `DEFAULT_LOCALE` ("vi"). When the cookie
  is absent but a DB preference exists, the resolver seeds the cookie so later requests don't
  re-query the DB. Guests (no session) are cookie-only — never touch the DB. Mock auth
  (`AUTH_MODE=mock`) always short-circuits to `DEFAULT_LOCALE`, matching the mock-auth pattern in
  Session Middleware above.
- **Switching locale**: `lib/i18n/set-locale-action.ts` (`setLocale` server action) always writes
  the `NEXT_LOCALE` cookie; for a logged-in, non-mock user it additionally persists to
  `profiles.language` so the preference follows the user across devices/sessions.
- **Messages**: `messages/{vi,en}.json`, one file per locale, namespaced top-level keys — `Home`,
  `Header`, `Footer`, `UserMenu`, `Hero`, `Awards`, `SunKudos`. `messages/message-keys.test.ts`
  guards key-set parity between the two locale files.
- **Provider**: `app/layout.tsx` resolves `getLocale()`/`getMessages()` server-side and wraps the
  tree in `<NextIntlClientProvider messages={messages}>`; `<html lang={locale}>` is set from the
  same resolved value.
- **UI**: `components/language-dropdown/*` (pixel-perfect MoMorph dropdown: `language-dropdown.tsx`,
  `language-dropdown-list.tsx`, `language-option-row.tsx`, `language-dropdown-data.ts`) is wired
  into the site header via `components/home/language-switcher.tsx`
  (`components/home/site-header.tsx`), which calls the `setLocale` action on selection.
- **DB column**: `profiles.language` (`text`, default `'vi'`, `check (language in ('vi','en'))`),
  added in `supabase/migrations/20260716090000_profile_language.sql`. That migration also adds the
  first non-SELECT RLS policy on `profiles` — an owner-scoped `UPDATE` policy
  (`using (auth.uid() = id) with check (auth.uid() = id)`) — see Database Schema below.

## Known Gaps (not yet addressed by this feature)

- No sign-out action exists yet.
- `supabase/migrations/*.sql` RLS policies are permissive-read for local dev, with two narrow
  write exceptions (`profiles` self-`UPDATE`, `kudos` sender-scoped `INSERT` — see Database
  Schema above); a production-safe RLS model (and the table `GRANT`s layered on top, see Kudos
  Feed above) is not defined yet. This includes `event_settings`, which still has no write
  policy at all.
- Anonymous kudos are anonymized only at the app's read layer, not the database layer — see
  "Known gap" under Kudos Feed above (direct PostgREST access with the anon key can still read
  `sender_id` on an anonymous row).
- The nav-lock's `launch_at` cache (`lib/countdown/launch-at-cache.ts`) is a module-level
  in-process cache — safe for a single server instance (local/dev); a multi-instance production
  deploy would need a shared cache or a shorter TTL to keep instances in sync.
