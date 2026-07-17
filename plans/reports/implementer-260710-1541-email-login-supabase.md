# Email + password login (Supabase) — report

User decisions: email+password (not magic link); login only, NO sign-up (users provisioned elsewhere).

## Changes
- `app/login/actions.ts` — added `loginWithEmail` server action (`useActionState` signature): validates fields, `signInWithPassword`, maps `invalid_credentials` → "Email hoặc mật khẩu không đúng.", other errors → generic message; `redirect("/")` on success
- `app/login/email-login-form.tsx` — NEW client form: email + password inputs (dark/gold theme), pending state ("Đang đăng nhập…", disabled), inline `role="alert"` error
- `app/login/login-hero.tsx` — email form added under Google button with "hoặc" divider

Reuses existing infra: middleware protection, cookie session persistence, AuthStateListener, logout — no duplication.

## Verification
- tsc clean; eslint 0 errors (6 pre-existing img warnings)
- Browser e2e: form renders, submit with bad creds → inline error shown, no crash
- **Environment finding:** `.env.local` points to LOCAL Supabase (`127.0.0.1:54321`) which is NOT running (no docker/supabase CLI on this machine) → auth backend currently down; form failed gracefully (generic message — network-error path verified). Google login equally unavailable until `supabase start`.

## Unresolved questions
- Start local Supabase (or point .env.local at a hosted project) to e2e the success + invalid-credentials paths. Test user must be created manually (login-only, no sign-up UI).
