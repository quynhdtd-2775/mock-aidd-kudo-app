# Phase B4 — Account menu admin item + Profile link + /admin route

## Context Links
- Depends on: [phase-B1](phase-B1-db-migrations-seed.md) (profiles.role), [phase-B3](phase-B3-notifications-bell.md) (shares site-header.tsx)
- Current: `components/home/user-menu.tsx` (dropdown: email + Sign out), `components/home/site-header.tsx`
- Refs: `lib/profile/current-user.ts` (`resolveCurrentUserId`), `lib/auth/auth-service.ts` (`getCurrentUser`)

## Overview
- **Priority:** P2 · **Status:** pending · **Blocked by:** B1, B3
- Add always-visible **Profile** link + **Sign out** (existing), plus an **Admin Dashboard** item shown
  only for `role=admin`, linking to a placeholder `/admin` route.

## Key Insights
- `profiles.role` (B1) is the gate. site-header resolves role server-side and passes `isAdmin` to UserMenu.
- `/admin` is a **placeholder only** (clarified) — real dashboard out of scope. Middleware already
  auth-gates all non-public paths; add a server-side role check on the page for defense-in-depth.
- B3 already edits site-header.tsx → B4 runs after (serialized), extends the same header edit.
- Profile destination: reuse existing profile route (verify path during impl; the profile screen exists).
- New i18n strings → **integration contract** (Track A owns messages).

## Data Flow
`SiteHeader` (server) → resolve userId + role via a small `getCurrentUserRole(userId)` query →
`<UserMenu isAdmin profileHref adminHref>` (client) → conditionally renders Admin Dashboard item.

## Requirements
- **Functional:** menu always shows Profile + Sign out; Admin Dashboard item appears only when
  `role=admin`, linking to `/admin` (ID-5/6, ID-36..38). `/admin` renders a placeholder page.
- **Non-functional:** non-admin hitting `/admin` directly is redirected (role check server-side).

## Related Code Files
- **Create:** `app/admin/page.tsx` (placeholder; server-side role check → redirect non-admins),
  `lib/profile/profile-role-query.ts` (`getCurrentUserRole(userId): Promise<'user'|'admin'>`, safe default `'user'`)
- **Modify:** `components/home/user-menu.tsx` (add Profile link + conditional Admin Dashboard item),
  `components/home/site-header.tsx` (resolve role, pass `isAdmin`/hrefs to UserMenu)

## Implementation Steps
1. `profile-role-query.ts`: read `role` from `profiles` for userId; try/catch → `'user'`.
2. `site-header.tsx`: after resolving userId, `const role = userId ? await getCurrentUserRole(userId) : 'user'`; pass `isAdmin={role === 'admin'}` + profile/admin hrefs to `<UserMenu>`.
3. `user-menu.tsx`: add a Profile `<Link>` menuitem (always) above Sign out; add Admin Dashboard `<Link>` menuitem rendered only when `isAdmin`.
4. `app/admin/page.tsx`: placeholder content; resolve current user role server-side, `redirect('/home-page-saa')` if not admin.

## Todo List
- [ ] `getCurrentUserRole` safe query
- [ ] site-header resolves role, passes isAdmin/hrefs
- [ ] UserMenu: Profile link (always) + Admin Dashboard (admin only)
- [ ] `/admin` placeholder page with server-side role guard

## Success Criteria
- Admin (…0001) sees Profile + Admin Dashboard + Sign out; non-admin sees Profile + Sign out only.
- `/admin` reachable by admin, redirects non-admins. Satisfies ID-5/6, ID-36..38.

## Risk Assessment
- **Shared site-header.tsx with B3** (Med/High): serialized (blockedBy B3) — extend, don't overwrite B3's bell edit.
- **Profile route path unknown** (Low/Low): grep for the profile page route during impl; fall back to the existing profile screen path.

## Integration
- **i18n contract (add to Track A `messages/{vi,en}.json` at merge):** `UserMenu.profile`, `UserMenu.adminDashboard`.

## Security Considerations
- Menu visibility is cosmetic; the real gate is the `/admin` server-side role check + auth middleware.

## Next Steps
- None downstream except B7 (no unit-testable pure logic here beyond role default; optional).
