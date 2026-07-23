# Phase A1 — Homepage UI copy & visual fixes (Track A)

**Status:** in-progress (parallel UI agent) · **MoMorph:** screen i87tDx10uM

Owned by the running Track A UI agent. **Files off-limits to Track B.**

## Goal
Spec event-info copy + awards grid/clamp visuals on the homepage.

## Owned files
- `messages/vi.json`, `messages/en.json`
- `components/home/award-card.tsx`
- `components/home/awards-section.tsx`

## Scope (satisfies ID-14, ID-15, ID-16, ID-47..52)
- Event info spec values: `18h30` / `Nhà hát nghệ thuật quân đội` / `Tường thuật trực tiếp tại Group Facebook Sun* Family` (ID-14).
- Awards grid 2-col mobile+tablet, 3-col desktop (ID-15).
- Card description clamped to 2 lines w/ ellipsis (ID-16).
- Award card image/title/"Chi tiết" → `/home-awards-page#<CARD_ANCHORS slug>` (ID-47..52).

## Out of scope
- Countdown tiles, notifications, account menu, widget modal, awards-page scroll (Track B).

## Integration contract (for Track B)
- Award-card links emit the `CARD_ANCHORS` slugs consumed by phase B6.
- Track B phases B3/B4/B5 require new message keys added here at integration (see those phases).
