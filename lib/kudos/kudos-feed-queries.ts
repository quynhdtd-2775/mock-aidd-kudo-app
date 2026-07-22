import { createClient } from "@/lib/supabase/server";
import type { HeroBadgeVariant } from "@/components/kudos-live-board/kudo-hero-badge";
import type { KudoFeedItem, KudoFeedProfile } from "./kudos-types";

const FEED_LIMIT = 100;

type JoinedProfileRow = {
  display_name: string;
  hero_code: string;
  hero_badge: string;
  avatar_url: string | null;
};

/** Supabase types to-one joins as an array in some client versions. */
function toFeedProfile(
  row: JoinedProfileRow | JoinedProfileRow[] | null,
): KudoFeedProfile | null {
  const profile = Array.isArray(row) ? row[0] : row;
  if (!profile) return null;
  return {
    displayName: profile.display_name,
    heroCode: profile.hero_code,
    heroBadge: (profile.hero_badge || "new") as HeroBadgeVariant,
    avatarUrl: profile.avatar_url,
  };
}

/**
 * ALL KUDOS feed for /kudos-live-board — every kudos row (any receiver),
 * newest first, joined with sender + receiver profiles. Returns [] on error
 * so the page still renders when the local Supabase stack is down.
 */
export async function getAllKudos(): Promise<KudoFeedItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("kudos")
      .select(
        `id, hashtag_title, message, attachment_count, hashtags, hearts_count, image_urls,
         is_anonymous, anonymous_name, created_at,
         sender:profiles!kudos_sender_id_fkey (display_name, hero_code, hero_badge, avatar_url),
         receiver:profiles!kudos_receiver_id_fkey (display_name, hero_code, hero_badge, avatar_url)`,
      )
      .order("created_at", { ascending: false })
      .limit(FEED_LIMIT);
    if (error || !data) {
      // A permission/schema regression (e.g. the missing-GRANT 42501 this
      // fixed once) must not silently render as "no kudos yet".
      if (error) console.error("getAllKudos: query error", error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      hashtagTitle: row.hashtag_title,
      message: row.message,
      attachmentCount: row.attachment_count,
      hashtags: row.hashtags,
      heartsCount: row.hearts_count,
      imageUrls: row.image_urls ?? [],
      isAnonymous: row.is_anonymous,
      anonymousName: row.anonymous_name,
      createdAt: row.created_at,
      sender: toFeedProfile(row.sender),
      receiver: toFeedProfile(row.receiver),
    }));
  } catch (err) {
    console.error("getAllKudos: query failed", err);
    return [];
  }
}
