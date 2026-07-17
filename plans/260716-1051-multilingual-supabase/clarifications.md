# Clarifications — Multilingual (đa ngôn ngữ) with Supabase

## Session 2026-07-16

- Q: How should locale switching work architecturally? → A: Cookie-based via next-intl, no URL locale prefix — existing routes unchanged
- Q: What is Supabase's role in the multilingual feature? → A: Persist user language preference (language column on profiles, local migration); translation strings live in static JSON in repo; guests use cookie only
- Q: Which pages should be translated (VN/EN) in this task? → A: Home page + shared header/footer only (app/page.tsx + components/home/*); infra ready for other pages later
- Q: What is the default language for first-time visitors? → A: Vietnamese (VN)
