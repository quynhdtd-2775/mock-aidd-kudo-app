---
name: project_docs-bootstrap
description: docs/ was bootstrapped with a single system-architecture.md for the login/auth feature — decision on doc scope for this small app
metadata:
  type: project
---

`mock-aidd-kudo-app` had no `docs/` directory before 2026-07-09. First real feature (Google OAuth
login via Supabase, Next.js 16.2.10) shipped `docs/system-architecture.md` (~85 lines) covering:
route map, OAuth/PKCE flow (`app/login/actions.ts` → `app/auth/callback/route.ts`), session
middleware (`proxy.ts` — Next 16 renamed `middleware.ts` to `proxy.ts`, see project's `AGENTS.md`),
and local Supabase env setup.

**Why:** app is a one-page app beyond create-next-app scaffold; per YAGNI, chose one lean
consolidated doc over a full doc suite (roadmap/changelog/code-standards per
`.claude/rules/documentation-management.md` would be premature for this size).

**How to apply:** For the next feature in this repo, extend `system-architecture.md` (append a
section) rather than spinning up new doc files, until the app grows enough to justify splitting
(e.g. a dedicated `docs/auth.md` if auth grows past OAuth — MFA, roles, etc.). Also worth noting:
`app/page.tsx` (`/`) was left as unmodified create-next-app boilerplate — flagged as a "Known Gap"
in the doc; check if still true before citing it in future work.
