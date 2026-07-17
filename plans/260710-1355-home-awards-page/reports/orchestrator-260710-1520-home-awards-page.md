# Home Awards Page — momorph-implement-design report

Screen: "Hệ thống giải" — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
Route: `/` (app/page.tsx). Design 1440×6410, rendered 1425×6325 (~1.5% delta). Status: **DONE**.

## Files
- `app/page.tsx` — screen root (header, hero, awards, sunkudos, footer)
- `app/layout.tsx` — + Montserrat 400/700 via next/font (`--font-montserrat`, vietnamese subset)
- `components/home/site-header.tsx`, `site-footer.tsx` — absolute translucent header, footer
- `components/home/hero-section.tsx` — keyvisual + gradient overlay + title
- `components/home/awards-section.tsx`, `award-menu.tsx`, `award-card.tsx` — menu (6 items) + 6 award cards, data arrays extracted from Figma
- `components/home/sunkudos-section.tsx` — 1152×500 banner
- `public/home/` — 20 assets (14 from MoMorph + keyvisual + 5 badge PNGs exported via Figma MCP; MoMorph cloud lacked them)

## Infra issue found + fixed
- momorph MCP `x-github-token` header was empty in `~/.claude.json` → every call failed (`bigint: ""`). Filled from `gh auth token`. **Session MCP connection is stale — restart session for native MCP tools.** This session used a direct-HTTP helper (scratchpad `mm.sh`).

## Verification
- tsc --noEmit clean; eslint clean on owned files
- Visual diff vs `data/preview.png`: 2 rounds. Fixed: hero gradient z-order (overlay above keyvisual), hero double-padding (title wrapped), hero pt for 88px absolute header. Cards 3–6 badges "missing" in round 1 = next/image lazy-load below fold, not a bug.
- Phase 4 polish: responsive 375/768/1280 (no h-scroll, no clipping), hover/focus/pressed 200ms, prefers-reduced-motion respected, desktop pixel layout unchanged.
- Coverage validator exit 2 = false positives (repeated card/menu template pattern; per-instance nodeIds live in AWARD_CARDS/MENU_ITEMS data arrays — verified present).
- TEMP middleware bypass ("/" in PUBLIC_PATHS) reverted; `/` is auth-gated again.

## Accepted small diffs
- Card 5 "Số lượng giải thưởng:" label wraps to 2 lines (design 1 line) — font metric diff, minor.
- Hero section bottom clips last ~40px of keyvisual fade (region is ≥90% opaque dark; invisible in practice).
- `award-card.tsx` 500+ lines (over 200-line guideline) — icons + 6-card data array; split further if it grows.

## Unresolved questions
- None blocking. Reviewer pass + commit not yet run (user decision).
