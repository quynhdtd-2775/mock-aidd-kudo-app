# Clarifications — Like/Hearts on /kudos-live-board (screen MaZUn5xHXZ, spec C.4.1)

## Session 2026-07-22

- Q: Scope of this run for the live-board screen? → A: User directive: "Implement like kudos in /kudos-live-board" — hearts/like system only
- Q: Special-day +2 hearts (admin config, no schema exists)? → A: +1 only this run; kudo_hearts stores hearts_value per like so doubling can land later without remigration (default, not re-asked)
- Q: Where do functional hearts apply? → A: ALL KUDOS feed (real data). Highlight carousel stays mock per 2026-07-22 feed-scope decision (default, not re-asked)
- Q: 'Xem chi tiết'/detail navigation, hashtag/department filters? → A: Out of scope (user narrowed scope after seeing gap list)
- Q: Who receives credited hearts? → A: Per spec C.4.1 the kudo's SENDER account gains the heart; kudos.hearts_count stays the display counter, kept in sync
- Q: Sender self-like? → A: Disabled in UI AND rejected server-side; enforced in RLS insert policy too
- Q: Cross-viewer freshness of counts? → A: Optimistic client reconcile only; other viewers see new counts on reload (KISS, spec asks no realtime) (default, not re-asked)
- Q: Unauthenticated toggle path? → A: Keep redirect("/login") defense-in-depth mirroring createKudo (default, not re-asked)
