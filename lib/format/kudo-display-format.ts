// Pure display-formatting helpers shared by lib/profile/profile-view-mappers.ts
// (profile page) and lib/kudos/kudo-feed-mapper.ts (kudos-live-board ALL KUDOS
// feed). Extracted verbatim from profile-view-mappers.ts — same input/output
// behavior — so values format identically across both screens. No deps
// beyond Intl; safe to import from any layer (pure, no I/O).

/** "1000" → "1.000" as rendered in the design. */
export function formatCount(value: number): string {
  return value.toLocaleString("vi-VN");
}

/** ISO timestamp → "10:00 - 10/30/2025" as rendered on the post cards. */
export function formatKudoTime(iso: string): string {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("hour")}:${get("minute")} - ${get("month")}/${get("day")}/${get("year")}`;
}
