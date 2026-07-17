# Clarifications — Profile Page (/profile)

Screen: Profile bản thân — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/3FoIx6ALVb

## Session 2026-07-14

- Q: No Supabase schema exists in repo and Docker is not running — how should the profile page get its data? → A: Init Supabase in repo — `supabase init`, migrations (profiles, kudos, hearts, secret boxes/icons) + seed data, queried via existing @supabase/ssr clients. Docker Desktop must be started for `supabase start`.
- Q: With DISABLE_AUTH=true, who is the "current user" on /profile? → A: Seeded demo user fallback when DISABLE_AUTH=true; real Supabase session user when auth is on.
- Q: How should interactive elements with unbuilt target screens behave (Mở quà, awards Xem tất cả, header/nav)? → A: Static placeholders per design; link to existing routes where one exists (e.g. header → /).
- Q: Which kudos posts does the profile "Post all" section show? → A: Posts received by the user (user is receiver).
