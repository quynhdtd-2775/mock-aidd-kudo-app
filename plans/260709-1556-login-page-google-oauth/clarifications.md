# Clarifications — Login Page (/login)

## Session 2026-07-09

- Q: Design shows only "LOGIN With Google" but code has email/password — which auth method? → A: Google OAuth only, per design (signInWithOAuth + /auth/callback)
- Q: Local Supabase Google provider config — scaffold supabase/config.toml? → A: Code only; user configures Supabase themselves; document required setup in .env.local.example
- Q: Language handling for VN header dropdown + Vietnamese copy? → A: Static VN copy hardcoded from design; dropdown is non-functional UI
- Q: MoMorph MCP server returns `[GraphQL] invalid input syntax for type bigint: ""` on every call — how to get design data? → A: Fallback to Figma MCP directly (fileKey 9ypp4enmFmdK3YAFJLIu6C, Login frame node 662:14387); specs/test-cases CSV unavailable this session
- Q: Post-login redirect target? → A: `/` (existing middleware behavior, unchanged)
- Q: OAuth failure handling? → A: Callback redirects to /login?error=auth; login page renders error message
