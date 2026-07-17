import { createClient } from "@/lib/supabase/server";
import type {
  HeroBadge,
  IconCollectionItem,
  ProfileData,
  ProfileStats,
  ReceivedKudo,
} from "./profile-types";

// Server-side queries for the /profile page. Every function returns a safe
// empty value on error so the page still renders when the local Supabase
// stack is down (e.g. Docker not started).
import {
  isMockProfileDataEnabled,
  MOCK_ICON_COLLECTION,
  MOCK_PROFILE,
  MOCK_PROFILE_STATS,
  MOCK_RECEIVED_KUDOS,
} from "./mock-profile-data";

export async function getProfile(userId: string): Promise<ProfileData | null> {
  // TODO(api): remove mock branch once the backend is ready.
  if (isMockProfileDataEnabled()) return MOCK_PROFILE;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, display_name, hero_code, avatar_url, hero_badge, boxes_opened, boxes_unopened",
      )
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      displayName: data.display_name,
      heroCode: data.hero_code,
      avatarUrl: data.avatar_url,
      heroBadge: data.hero_badge as HeroBadge,
      boxesOpened: data.boxes_opened,
      boxesUnopened: data.boxes_unopened,
    };
  } catch {
    return null;
  }
}

export async function getReceivedKudos(userId: string): Promise<ReceivedKudo[]> {
  // TODO(api): remove mock branch once the backend is ready.
  if (isMockProfileDataEnabled()) return MOCK_RECEIVED_KUDOS;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("kudos")
      .select(
        `id, hashtag_title, message, attachment_count, hashtags, hearts_count, is_spam, created_at,
         sender:profiles!kudos_sender_id_fkey (display_name, hero_code, hero_badge, avatar_url)`,
      )
      .eq("receiver_id", userId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((row) => {
      // Supabase types to-one joins as an array in some client versions.
      const sender = Array.isArray(row.sender) ? row.sender[0] : row.sender;
      return {
        id: row.id,
        senderName: sender?.display_name ?? "",
        senderHeroCode: sender?.hero_code ?? "",
        senderBadge: (sender?.hero_badge ?? "new") as HeroBadge,
        senderAvatarUrl: sender?.avatar_url ?? null,
        hashtagTitle: row.hashtag_title,
        message: row.message,
        attachmentCount: row.attachment_count,
        hashtags: row.hashtags,
        heartsCount: row.hearts_count,
        isSpam: row.is_spam,
        createdAt: row.created_at,
      };
    });
  } catch {
    return [];
  }
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const empty: ProfileStats = {
    kudosReceived: 0,
    kudosSent: 0,
    heartsReceived: 0,
    boxesOpened: 0,
    boxesUnopened: 0,
  };
  // TODO(api): remove mock branch once the backend is ready.
  if (isMockProfileDataEnabled()) return MOCK_PROFILE_STATS;
  try {
    const supabase = await createClient();
    const [received, sent, hearts, profile] = await Promise.all([
      supabase
        .from("kudos")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", userId),
      supabase
        .from("kudos")
        .select("id", { count: "exact", head: true })
        .eq("sender_id", userId),
      // No SUM in supabase-js; dataset is tiny, reduce in JS.
      supabase.from("kudos").select("hearts_count").eq("receiver_id", userId),
      supabase
        .from("profiles")
        .select("boxes_opened, boxes_unopened")
        .eq("id", userId)
        .maybeSingle(),
    ]);
    return {
      kudosReceived: received.count ?? 0,
      kudosSent: sent.count ?? 0,
      heartsReceived: (hearts.data ?? []).reduce(
        (sum, row) => sum + (row.hearts_count ?? 0),
        0,
      ),
      boxesOpened: profile.data?.boxes_opened ?? 0,
      boxesUnopened: profile.data?.boxes_unopened ?? 0,
    };
  } catch {
    return empty;
  }
}

export async function getIconCollection(
  userId: string,
): Promise<IconCollectionItem[]> {
  // TODO(api): remove mock branch once the backend is ready.
  if (isMockProfileDataEnabled()) return MOCK_ICON_COLLECTION;
  try {
    const supabase = await createClient();
    const [catalog, unlocks] = await Promise.all([
      supabase
        .from("secret_box_icons")
        .select("id, name, image_url, sort_order")
        .order("sort_order", { ascending: true }),
      supabase.from("user_icon_unlocks").select("icon_id").eq("user_id", userId),
    ]);
    if (catalog.error || !catalog.data) return [];
    const unlockedIds = new Set(
      (unlocks.data ?? []).map((row) => row.icon_id as string),
    );
    return catalog.data.map((icon) => ({
      id: icon.id,
      name: icon.name,
      imageUrl: icon.image_url,
      sortOrder: icon.sort_order,
      unlocked: unlockedIds.has(icon.id),
    }));
  } catch {
    return [];
  }
}
