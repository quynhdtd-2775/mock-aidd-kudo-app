// Shared types for the countdown prelaunch feature's data-access layer
// (lib/countdown/event-settings-queries.ts, lib/countdown/launch-at-cache.ts).

/** Row shape of public.event_settings (see supabase/migrations/20260714080000_event_settings.sql). */
export interface EventSettings {
  launchAt: Date;
}
