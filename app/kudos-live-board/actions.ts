"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isMockAuthEnabled } from "@/lib/auth/mock-session";
import { resolveCurrentUserId } from "@/lib/profile/current-user";
import { createServiceRoleClient } from "@/lib/kudos/kudos-service-client";
import { getHashtagSuggestions, searchProfiles } from "@/lib/kudos/kudos-queries";
import { sanitizeMessageHtml } from "@/lib/kudos/sanitize-message-html";
import { removeKudoImages, uploadKudoImages, validateImages } from "@/lib/kudos/upload-kudo-images";
import type {
  CreateKudoInput,
  CreateKudoResult,
  ProfileSuggestion,
} from "@/lib/kudos/kudos-types";

const MIN_HASHTAGS = 1;
const MAX_HASHTAGS = 5;

// Defense-in-depth: these two actions only serve data an authenticated user
// should see. They currently rely on proxy.ts's matcher to keep unauthed
// requests from ever reaching here, but that matcher is a single point of
// failure — an explicit guard means a narrowed matcher can't silently turn
// these into open, unauthenticated data-leak endpoints.
export async function searchProfilesAction(query: string): Promise<ProfileSuggestion[]> {
  const userId = await resolveCurrentUserId();
  if (!userId) return [];
  return searchProfiles(query);
}

export async function getHashtagSuggestionsAction(): Promise<string[]> {
  const userId = await resolveCurrentUserId();
  if (!userId) return [];
  return getHashtagSuggestions();
}

/**
 * Mock-auth dev path has no real Supabase session, so RLS
 * (`sender_id = auth.uid()` on kudos, storage RLS on kudos-images) would
 * reject every write. Use the service-role client there; production always
 * keeps the anon + RLS server client.
 */
async function getWriteClient(): Promise<SupabaseClient> {
  if (isMockAuthEnabled()) return createServiceRoleClient();
  return createClient();
}

export async function createKudo(input: CreateKudoInput): Promise<CreateKudoResult> {
  const senderId = await resolveCurrentUserId();
  if (!senderId) {
    redirect("/login");
  }

  const receiverId = input.receiverId?.trim() ?? "";
  if (!receiverId) {
    return { ok: false, error: "receiver_required", fieldErrors: { receiverId: "receiver_required" } };
  }

  const awardTitle = input.awardTitle?.trim() ?? "";
  if (!awardTitle) {
    return { ok: false, error: "award_title_required", fieldErrors: { awardTitle: "award_title_required" } };
  }

  const sanitizedMessage = sanitizeMessageHtml(input.message ?? "");
  const strippedMessage = sanitizedMessage.replace(/<[^>]*>/g, "").trim();
  if (!strippedMessage) {
    return { ok: false, error: "message_required", fieldErrors: { message: "message_required" } };
  }

  const hashtags = (input.hashtags ?? []).map((tag) => tag.trim()).filter(Boolean);
  // hashtags is stored as a single comma-joined text column (see kudos-queries.ts),
  // so a tag containing a comma would silently split into multiple tags on
  // read and could smuggle extra tags past the MAX_HASHTAGS cap below.
  if (hashtags.some((tag) => tag.includes(","))) {
    return { ok: false, error: "invalid_hashtag", fieldErrors: { hashtags: "invalid_hashtag" } };
  }
  if (hashtags.length < MIN_HASHTAGS || hashtags.length > MAX_HASHTAGS) {
    return { ok: false, error: "hashtags_count", fieldErrors: { hashtags: "hashtags_count" } };
  }

  const images = input.images ?? [];
  const imageValidationError = validateImages(images);
  if (imageValidationError) {
    return { ok: false, error: imageValidationError, fieldErrors: { images: imageValidationError } };
  }

  let supabase: SupabaseClient;
  try {
    supabase = await getWriteClient();
  } catch (err) {
    console.error("createKudo: failed to obtain write client", err);
    return { ok: false, error: "insert_failed" };
  }

  const { data: receiverProfile, error: receiverLookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", receiverId)
    .maybeSingle();
  if (receiverLookupError || !receiverProfile) {
    return { ok: false, error: "receiver_not_found", fieldErrors: { receiverId: "receiver_not_found" } };
  }

  const uploadResult = await uploadKudoImages(supabase, senderId, images);
  if (!uploadResult.ok) {
    return { ok: false, error: uploadResult.error, fieldErrors: { images: uploadResult.error } };
  }

  const anonymousName =
    input.isAnonymous && input.anonymousName?.trim() ? input.anonymousName.trim() : null;

  const { error: insertError } = await supabase.from("kudos").insert({
    sender_id: senderId,
    receiver_id: receiverId,
    hashtag_title: awardTitle,
    message: sanitizedMessage,
    hashtags: hashtags.join(","),
    image_urls: uploadResult.urls,
    attachment_count: uploadResult.urls.length,
    is_anonymous: input.isAnonymous,
    anonymous_name: anonymousName,
  });

  if (insertError) {
    console.error("createKudo: insert failed", insertError);
    await removeKudoImages(supabase, uploadResult.paths);
    return { ok: false, error: "insert_failed" };
  }

  return { ok: true };
}
