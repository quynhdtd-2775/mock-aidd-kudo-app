import { createClient } from "@/lib/supabase/server";
import type { ProfileSuggestion } from "./kudos-types";

const SEARCH_LIMIT = 8;

/**
 * Autocomplete over profiles.display_name for the recipient picker.
 * Returns [] for an empty/whitespace-only query instead of erroring.
 */
export async function searchProfiles(query: string): Promise<ProfileSuggestion[]> {
  const q = query.trim();
  if (q.length < 1) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .ilike("display_name", `%${q}%`)
      .limit(SEARCH_LIMIT);
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
    }));
  } catch (err) {
    console.error("searchProfiles: query failed", err);
    return [];
  }
}

/**
 * Distinct non-empty hashtags already used across kudos, for the hashtag
 * suggestion list. `kudos.hashtags` stores a comma-joined string per row.
 */
export async function getHashtagSuggestions(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("kudos").select("hashtags");
    if (error || !data) return [];

    const unique = new Set<string>();
    for (const row of data) {
      (row.hashtags ?? "")
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean)
        .forEach((tag: string) => unique.add(tag));
    }
    return Array.from(unique).sort();
  } catch (err) {
    console.error("getHashtagSuggestions: query failed", err);
    return [];
  }
}
