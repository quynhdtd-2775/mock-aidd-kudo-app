# Plan: Login Page (/login) — SAA 2025 Google OAuth

MoMorph screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
(MoMorph MCP down this session — design fetched via Figma MCP, node 662:14387)
Clarifications: ./clarifications.md
Design reference: ./design-reference.md

## Context

- Next.js 16.2.10 App Router, Tailwind v4, @supabase/ssr against local Supabase.
- Prior session built email/password auth: lib/supabase/{client,server,middleware}.ts, proxy.ts, app/login/{page,login-form,actions}.
- Design is Google-OAuth-only: dark keyvisual, SAA 2025 "Root Further" branding, header (logo + static VN dropdown), tagline, "LOGIN With Google" button, footer.

## Tracks (parallel, no shared files)

### Track A — UI (implementer subagent, background)
- Status: [x] done
- Owns: app/login/page.tsx, app/login/* UI components, public/login/* assets.
- Rebuilt /login UI per Figma design (Figma MCP fallback): page.tsx, login-header.tsx, login-hero.tsx, google-login-button.tsx, login-footer.tsx, login-fonts.ts; 6 assets in public/login/; deleted app/login/login-form.tsx.

### Track B — Backend (orchestrator, main thread)
- Status: [x] done
- Owns: app/login/actions.ts, app/auth/callback/route.ts, lib/supabase/middleware.ts, .env.local.example.
- Rewrote `loginWithGoogle` server action → signInWithOAuth(google, PKCE, Origin fallback) → redirect to provider URL.
- app/auth/callback/route.ts: exchangeCodeForSession, redirect `/` on success, /login?error=auth on failure; console.error logging added.
- middleware.ts: /auth added to PUBLIC_PATHS (no callback loop).
- .env.local.example documents Google provider setup.

### Integration + verification
- Status: [x] done
- UI form wired to `loginWithGoogle` action; dead email/password code deleted.
- Fixes applied: z-index paint bug (background artwork layer-order), VN flag asset (node 178:1019 export), Origin-header fallback + console.error logging.
- Tester: 16/16 pass (build, tsc, eslint, HTTP behavior, assets). Reviewer: score 9, 0 critical.

## Risks
- Google provider not configured in local Supabase → runtime works up to provider redirect; documented, user-owned.
- Figma asset URLs expire in 7 days → downloaded to public/login/ now.
- node_modules/next/dist/docs unreadable (kit guard) → conventions inferred from existing Next-16 code + verified by build.
