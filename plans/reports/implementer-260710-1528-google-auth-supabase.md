# Google Auth (Supabase) — gap-fill report

Most requirements already existed from the login feature (branch feat.login). This session audited + filled gaps only.

## Already existed (verified, untouched)
- Google OAuth via `signInWithOAuth` server action (`app/login/actions.ts`) + PKCE `exchangeCodeForSession` callback (`app/auth/callback/route.ts`)
- Route protection: `proxy.ts` → `lib/supabase/middleware.ts` (`updateSession`): unauthenticated → `/login`; authenticated on `/login` → `/`
- Session persistence + restore: `@supabase/ssr` cookie clients (`lib/supabase/client.ts`, `server.ts`), middleware refreshes token every request
- No-flicker: protection is server-side (middleware), protected pages never render unauthenticated
- Login failure message on `/login?error=...`

## Added this session
- `app/auth/actions.ts` — `logout` server action: `signOut()` + redirect `/login`, try/catch
- `components/home/user-menu.tsx` — client dropdown on header profile icon: shows email, "Đăng xuất" button (form → server action); Escape/outside-click close, aria menu semantics
- `components/home/site-header.tsx` — now async server component, fetches `user` via server client, renders `UserMenu`
- `components/auth/auth-state-listener.tsx` — client `onAuthStateChange` → `router.refresh()` on SIGNED_IN/SIGNED_OUT (cross-tab sync); mounted in `app/layout.tsx`; renders null
- `app/auth/callback/route.ts` — `error=access_denied` (user cancelled consent) → `/login?error=cancelled`
- `app/login/login-hero.tsx` + `page.tsx` — error kind passed through; cancelled gets softer message, `role="alert"`

Types: only SDK types (`User` inferred from `getUser()`, no custom auth types). No context provider added — server-side auth via middleware is the canonical @supabase/ssr App Router pattern; a client context would duplicate cookie state (YAGNI).

## Verification
- `tsc --noEmit` clean; `eslint app components lib` 0 errors (6 pre-existing `<img>` warnings in login files)
- Browser: `/` → 307 `/login` ✓; `/auth/callback?error=access_denied` → `/login?error=cancelled` ✓; cancelled + failure messages render ✓; login button present ✓
- Not e2e-verified: actual Google consent + logout click (needs real Google account; can't OAuth in Playwright). Logout action mirrors the proven login-action pattern and compiles clean.

## Unresolved questions
- Logout e2e needs a manual login once to confirm (click profile icon → Đăng xuất → lands on /login).
