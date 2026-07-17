# Clarifications — Countdown Prelaunch Page

## Session 2026-07-14

- Q: Where should the countdown target datetime come from? → A: Supabase table (e.g. `event_settings` with `launch_at timestamptz`), seeded via migration, read server-side
- Q: Who can access /count-down-prelaunch? → A: Public — no login required; middleware allowlists this route
- Q: How should the navigation lock work while countdown > 0? → A: Middleware redirect — before launch, every page (except login/auth) redirects to /count-down-prelaunch
- Q: What happens when the countdown reaches zero? → A: Auto-redirect to home page; nav lock lifts at the same time
