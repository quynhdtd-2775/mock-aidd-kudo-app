# Clarifications — Homepage SAA (/home-page-saa)

Screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM (fileKey 9ypp4enmFmdK3YAFJLIu6C, screenId i87tDx10uM)

## Session 2026-07-23

- Q: Notification bell (A1.6) — no notification system exists; how to implement panel + unread badge? → A: Minimal real system — `notifications` table in local Supabase (user_id, title, body, read_at) + seed rows; bell opens dropdown panel; badge only when unread exist.
- Q: Account menu admin option (A1.8, ID-5/37) — no `profiles.role` column, no admin page? → A: Add `profiles.role` column (default 'user', seed one admin) + Profile link + "Admin Dashboard" item for admins linking to a placeholder route.
- Q: Countdown source — spec says env var ISO-8601 (ID-56/57), codebase has `event_settings.launch_at` in Supabase? → A: Use Supabase `event_settings` via existing getCachedLaunchAt() + useCountdown; one source of truth with /count-down-prelaunch.
- Q: Widget button (item 6, ID-54) — quick-action menu options unspecified? → A: Open WriteKudoModal directly, reusing the kudos-live-board launcher pattern.
- Q: Event info text — design mock ("26/12/2025", "Âu Cơ Art Center", "qua sóng Livestream") conflicts with spec B2/ID-14 ("18h30", "Nhà hát nghệ thuật quân đội", "Tường thuật trực tiếp tại Group Facebook Sun* Family")? → A: Follow spec/test values (design authoritative for visuals, spec for content) — orchestrator decision.
- Q: "Sun* Kudos page" destination for ABOUT KUDOS / nav / footer? → A: /kudos-live-board (only kudos page in app) — orchestrator decision.
- Q: Award card click behavior (C2)? → A: Whole card + title + Chi tiết link to /home-awards-page#<slug> using existing CARD_ANCHORS slugs; add hash-scroll-on-load to awards page — per spec.
- Q: Footer "Tiêu chuẩn chung" (7.5) — no such page exists? → A: Leave unwired (logged under Unresolved Questions).

## Unresolved Questions
- Footer "Tiêu chuẩn chung" destination page does not exist; link left dead until the page is commissioned.
- Admin Dashboard is a placeholder route only; real dashboard out of scope.
