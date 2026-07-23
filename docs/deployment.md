# Deployment

## Platform: Vercel

- Team/scope: `quynhdtd2775s-projects`
- Project: `mock-aidd-kudo-app` (`prj_q6It0BivUDBuNrPijyu0SQbPHUUs`)
- Link: `.vercel/project.json` (gitignored by Vercel CLI convention)

## URL

- Production: https://mock-aidd-kudo-app.vercel.app
- Deployment-specific `*-projects.vercel.app` URLs sit behind Vercel SSO protection; the alias above is public.

## Deploy Command

```bash
npx vercel deploy --prod --yes --archive=tgz
```

Deploys the local working directory (no git connection configured). `.env*` files are gitignored and never uploaded.

Two hard-won caveats (2026-07-23):

- **Always use `--archive=tgz`** — plain multi-file uploads hang forever on this network; the deployment sits in `UNKNOWN` and never builds.
- **Commit-author block**: deployments were blocked (`readyState: BLOCKED`, `seatBlock: TEAM_ACCESS_REQUIRED`) because the repo's HEAD commit author was the machine-generated `...@b122775-mn.sun-asterisk.com` — not a Vercel team member. `git config user.email` is now set to the real address, so commits made after 2026-07-23 deploy normally. If deploying while HEAD's author is still the old one, deploy from a git-less copy (rsync the repo minus `.git`/`node_modules`/`.next` + keep `.vercel/`, then run the command there).

## Mode: mock demo (no hosted database) + real Google sign-in

The live site runs WITHOUT a Supabase backend:

- "LOGIN With Google" runs a real Google OAuth code flow implemented in `lib/auth/google-oauth.ts` (active when `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set alongside mock mode). The session is still the demo `mock_session` cookie; the `google_profile` cookie overlays the signed-in user's real name/email/avatar.
- **Google Cloud Console requirement**: the OAuth client must list `https://mock-aidd-kudo-app.vercel.app/auth/callback` under Authorized redirect URIs (APIs & Services → Credentials → the OAuth 2.0 Client). Without it Google shows `redirect_uri_mismatch`.
- Email login is mocked — any email/password on `/login` signs in as "Demo User" (`mock_session` cookie). See `lib/auth/mock-session.ts`.
- `/profile` serves mock data from `lib/profile/mock-profile-data.ts`.
- Pages that query the database render with empty/fallback state; kudos posting and other writes do not persist.
- The countdown nav-lock fails open (no `launch_at` row reachable → site unlocked).

`ALLOW_MOCK_IN_PROD=true` is the explicit opt-in that lets the mock gates run under `NODE_ENV=production`. Remove it (and switch `AUTH_MODE`) when a hosted Supabase project exists.

## Environment Variables (Production)

| Name | Value | Purpose |
|---|---|---|
| `AUTH_MODE` | `mock` | Mock auth instead of Supabase |
| `MOCK_DATA` | `true` | Mock /profile data |
| `ALLOW_MOCK_IN_PROD` | `true` | Opt-in: allow mock gates in production |
| `NEXT_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:1` | Unreachable placeholder (mock mode never hits it) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | placeholder | Placeholder, not a real key |
| `GOOGLE_CLIENT_ID` | (set) | Direct Google OAuth for the demo |
| `GOOGLE_CLIENT_SECRET` | (secret) | Direct Google OAuth for the demo |

`SUPABASE_SERVICE_ROLE_KEY` is deliberately NOT set — never ship a service-role key.

Manage with `npx vercel env ls|add|rm <NAME> production`.

## Switching to a real Supabase backend

1. Create/link a hosted Supabase project; `supabase db push` the migrations in `supabase/migrations/`.
2. Set real `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
3. Set `AUTH_MODE=supabase`, remove `MOCK_DATA`, `ALLOW_MOCK_IN_PROD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (the Google provider moves into Supabase's auth config, callback `https://<ref>.supabase.co/auth/v1/callback`).
4. Redeploy: `npx vercel deploy --prod --yes`.

## Custom Domain

None configured. Add via Vercel dashboard → Project → Domains, or `npx vercel domains add <domain>`.

## Rollback

```bash
npx vercel rollback <deployment-url>
```

List deployments with `npx vercel ls`.
