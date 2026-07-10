# Code Review: /login Google OAuth (SAA 2025)

## Scope
- Files: app/login/{page,actions,login-header,login-hero,google-login-button,login-footer,login-fonts}.tsx/ts, app/auth/callback/route.ts, lib/supabase/{middleware,server,client}.ts, proxy.ts
- Focus: open-redirect risk, error handling, redirect loops, cookie propagation, secrets, dead code, UI-backend contract, Next 16 App Router correctness
- Verification: independent (not just re-reading tester's report) — ran `pnpm build`, `eslint`, and live curl/HTTP probes against the running dev server (Supabase intentionally down), including crafting real Server Action POST requests with the encoded `$ACTION_ID_...` field.

## Overall Assessment
Solid implementation. Build/lint clean, error paths verified end-to-end against a genuinely dead Supabase backend (not just the trivial "no code" case), no dead code left from the deleted email/password flow, no secrets. One real but non-critical robustness gap found in the OAuth redirect construction — see High Priority.

## Critical Issues
None.

## High Priority

**1. `loginWithGoogle` trusts a possibly-absent `Origin` header to build the OAuth `redirectTo`, with no fallback.**
`app/login/actions.ts:8`: `const origin = (await headers()).get("origin");` then `redirectTo: \`${origin}/auth/callback\``. If `Origin` is absent, `origin` is `null` and the template literal produces the literal string `"null/auth/callback"`.

Verified live:
```
curl -X POST http://localhost:3000/login -F '$ACTION_ID_...=' \
  # (no Origin header)
→ Location: http://127.0.0.1:54321/auth/v1/authorize?...&redirect_to=null%2Fauth%2Fcallback&...
```
vs. same request with `Origin: http://localhost:3000` → correct `redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback`.

Exploitability assessment (tested, not assumed): I also sent the same request with a forged cross-origin `Origin: https://evil.example.com`. Next.js's built-in Server Actions CSRF guard (Origin-vs-Host check) rejected it outright with a 500 "Invalid Server Actions request." — so this is **not** an open-redirect an attacker can steer via a forged Origin from a real browser (fetch/form-submit always sets Origin faithfully for same-origin JS-driven submissions, and Next blocks mismatches). The gap only bites clients that send no Origin at all (curl/scripts/very old no-JS browsers, or a proxy that strips it) — real browser+JS users (the actual product surface) are unaffected. So: real, verified, reachable-in-principle, but not exploitable for account/session takeover today, and doesn't break the 5 stated acceptance criteria under normal use.
- Fix: fall back to a canonical source when Origin is missing, e.g. an env var (`NEXT_PUBLIC_SITE_URL`) or `headers().get("host")` + inferred protocol, rather than silently building a malformed URL.

## Medium Priority

**2. Silent catch in `loginWithGoogle` (actions.ts:22-24) and callback route (route.ts:15-17) swallow the underlying Supabase error with no server-side log.**
Correct from a data-leak standpoint (no stack trace reaches the client — verified: hitting `/auth/callback?code=fake` with Supabase down returns a clean 307 to `/login?error=auth`, not a 500 or stack trace). But zero observability means a misconfigured Google provider or Supabase outage in production will look identical to "user typed nothing" — worth at least a `console.error` server-side.

## Low Priority
- `hasError` in `page.tsx:17` is `typeof params.error !== "undefined"` — treats any `?error=` value as the same message. Fine today (only one error value is ever generated), but slightly loose; not worth fixing unless more error states are added.
- The 6 `@next/next/no-img-element` warnings are the accepted trade-off per task brief — not re-flagging.

## Edge Cases Found (via live probing, not just static read)
- Confirmed Next's Server Action CSRF (Origin/Host mismatch → 500) is active and would block a forged cross-origin attempt to invoke `loginWithGoogle` — this closes off the open-redirect angle the task asked me to hunt for.
- Confirmed `signInWithOAuth` (PKCE) builds the Google authorize URL client-side without needing a live Supabase network round-trip — this is why the happy path works even with local Supabase down; the actual network dependency on Supabase only shows up at `exchangeCodeForSession` in the callback route, which I tested directly with a fake code against the dead Supabase instance and confirmed it fails closed to `/login?error=auth` with no leaked exception detail.
- No infinite redirect loop: `/` → `/login` (307), `/login` → 200, `/auth/callback` (no code) → `/login?error=auth` (307), and following `/` with `-L` terminates cleanly at `/login` (200).

## Regression / Blast-Radius Checked
- `git status`/`git diff` confirms `app/layout.tsx`, `app/page.tsx`, `lib/supabase/{client,server}.ts`, `proxy.ts` are untouched, matching the plan's stated blast radius.
- `grep -rn "LoginState\|login-form"` across the repo (excluding node_modules) returns zero hits — the deleted `app/login/login-form.tsx` and its `LoginState` export have no remaining references anywhere.
- `lib/supabase/middleware.ts` PUBLIC_PATHS now includes `/auth`; verified this doesn't create a loop and doesn't affect other routes (only `/` and `/login` behavior tested/relevant; matcher in `proxy.ts` unchanged).
- `.env.local.example` documents the Google provider setup without embedding any real secret — no credentials committed.

## Positive Observations
- `withRefreshedCookies` in middleware.ts correctly copies rotated cookies from `supabaseResponse` onto the redirect `NextResponse` — a commonly-missed step with `@supabase/ssr` that would otherwise silently drop refreshed session tokens on a redirect hop.
- `searchParams` correctly typed and awaited as a `Promise` in `page.tsx` (Next 16 App Router contract).
- Server Action → external redirect (`redirect(providerUrl)`) verified working with a real absolute URL, correct PKCE `code_challenge`/`code_challenge_method=s256`, and the `sb-*-code-verifier` cookie correctly set for later exchange.
- No secrets, no leaked stack traces on any failure path tested.

## Recommended Actions
1. (High, non-blocking) Add a fallback for missing `Origin` header in `app/login/actions.ts` before building `redirectTo`.
2. (Medium, non-blocking) Add server-side logging in the two silent catch blocks (actions.ts, callback route.ts) for operability.

## Metrics
- `pnpm build`: 0 TS errors
- `eslint app lib proxy.ts`: 0 errors, 6 warnings (accepted `no-img-element`, per brief)
- Tester: 16/16 pass (independently re-verified the redirect/error/loop claims live, plus one case the tester didn't cover: `exchangeCodeForSession` failing against a genuinely dead Supabase, not just "no code")

## Unresolved Questions
None blocking. Origin-header fallback (High) and error logging (Medium) are recommended follow-ups, not gates.

**Status:** DONE_WITH_CONCERNS
**Summary:** Login page implementation is correct and production-viable for its stated acceptance criteria; found one real but non-exploitable robustness gap (missing-Origin fallback in OAuth redirect construction) worth a follow-up fix, plus a minor observability gap. No critical issues.
**Score:** 8 | **Critical issues:** 0
**Concerns/Blockers:** See High Priority #1 (Origin header fallback) — recommended, not blocking.

---

## Addendum 2026-07-09 16:42 — Re-verification of applied fixes

Coordinator applied both recommended fixes. Re-read both diffs and re-tested live rather than trusting the coordinator's own tsc/eslint/build re-run at face value (independently re-ran `npx tsc --noEmit` — clean — and `npx eslint app/login/actions.ts app/auth/callback/route.ts` — clean).

**Fix 1 (`app/login/actions.ts`) — Origin fallback.** New logic: `headerStore.get("origin") ?? \`${x-forwarded-proto ?? "http"}://${host}\``.

Live re-test, 4 cases:
1. No `Origin` header at all → `redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback` — the literal `"null/auth/callback"` bug is gone. **High finding #1 from the original review is resolved.**
2. Same-origin `Origin: http://localhost:3000` present → happy path unchanged, correct `redirect_to` + PKCE `code_challenge`/`code_challenge_method=s256`.
3. Forged cross-origin `Origin: https://evil.example.com` → still `500 "Invalid Server Actions request."` — Next's Server Action CSRF (Origin-vs-Host) guard is untouched by this change and still blocks the exact vector this review was asked to hunt for.
4. **New case I tested that the fix didn't anticipate:** no `Origin` header + spoofed `Host: evil.example.com` (raw curl, not something a real browser can produce — `Host` is a forbidden header name browsers won't let JS override) → server happily emits `redirect_to=http%3A%2F%2Fevil.example.com%2Fauth%2Fcallback`. The fallback trusts `Host`/`x-forwarded-proto` without validation.

Assessment of case 4: not a new *exploitable* hole for the threat model this feature actually faces. To weaponize it against a third party, an attacker needs a real victim browser to submit the request — but a browser's `Host` header always reflects the actual connection target (can't be independently forged apart from `Origin` via JS), so the only way `Host` could carry an attacker's domain in a genuine browser request is if the app's own infra is Host-header-injectable (accepts any Host on the same IP) — a deployment/infra concern that predates and is broader than this diff, not something introduced by it. Even in that scenario, the resulting `redirect_to` still has to survive Supabase GoTrue's own server-side `additional_redirect_urls` allowlist (documented as user-owned config in `.env.local.example`) before any code is actually delivered anywhere — that allowlist, not this app code, is the authoritative gate against OAuth redirect-URI hijacking, exactly as it was before this fix. Net: real bug (the "null" string) is fixed; the fallback source (`Host` header) is a defense-in-depth nitpick, not a new critical hole. Downgrading from High to Low and recommending as a nice-to-have: prefer an explicit `NEXT_PUBLIC_SITE_URL` env var over `Host` for the fallback, or at minimum validate `Host` against a known allowlist.

**Fix 2 (`app/login/actions.ts` + `app/auth/callback/route.ts`) — `console.error` logging.**
- `console.error("loginWithGoogle: signInWithOAuth failed", error)` / `"...threw", err` — logs the Supabase `AuthError` object (message/status), no tokens, no PII, no secrets. Server-side only, never reaches the client response. Fine.
- `console.error("auth callback: exchangeCodeForSession failed", error)` / `"...threw", err` — same shape, same verdict. Confirmed the client-visible behavior is unchanged (still a clean 307 to `/login?error=auth`, no stack trace exposed) — re-tested `GET /auth/callback?code=fake-test-code` against the still-dead local Supabase, got the same clean redirect as before.
- Medium Priority finding #2 (missing logging) from the original review is resolved.

**Verdict: fixes are correct. Seal stands, upgraded.** Score moves 8 → 9 (both flagged items addressed; one new Low-severity, non-blocking observation surfaced during re-verification). `criticalCount` remains 0.
