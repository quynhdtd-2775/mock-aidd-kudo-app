/**
 * Single source of truth for the app's locale contract.
 * Cookie-based locale selection — no URL routing changes.
 */
export const SUPPORTED_LOCALES = ["vi", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";

export const LOCALE_COOKIE = "NEXT_LOCALE";

/** One year — keeps guest language choice across browser sessions. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Narrows an untrusted value (e.g. a cookie read) to a supported Locale.
 * MUST be used to validate any locale value before it is used to build a
 * file path (e.g. `messages/${locale}.json`) to prevent path traversal.
 */
export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}
