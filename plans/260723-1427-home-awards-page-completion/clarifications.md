# Clarifications — Hệ thống giải page (/home-awards-page)

## Session 2026-07-23

- Q: Where should award card content come from? → A: Keep static i18n content (next-intl); Supabase stays auth-only
- Q: Where should the Sun* Kudos "Chi tiết" button navigate? → A: /kudos-live-board, same tab
- Q: Test cases use /he-thong-giai but route is /home-awards-page — reconcile? → A: Keep /home-awards-page only, no alias
- Q: Menu active (gold + underline) state behavior? → A: Active on click only (smooth scroll + move active); no scroll-spy
