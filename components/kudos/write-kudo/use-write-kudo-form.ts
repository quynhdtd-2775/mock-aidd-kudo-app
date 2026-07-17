"use client";

// Write-kudo form state + submit orchestration, kept out of
// write-kudo-modal.tsx so that file stays a thin presentational assembly.
// Recipient search and image handling are split into their own hooks
// (use-recipient-search.ts, use-pending-images.ts) to keep this file focused.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { useTranslations } from "next-intl";
import { createKudo, getHashtagSuggestionsAction } from "@/app/kudos-live-board/actions";
import type { CreateKudoFieldErrors } from "@/lib/kudos/kudos-types";
import { mapCreateKudoErrorCode } from "./map-create-kudo-error";
import { useRecipientSearch } from "./use-recipient-search";
import { usePendingImages } from "./use-pending-images";

type FieldName = keyof CreateKudoFieldErrors;
type FieldErrorMessages = Partial<Record<FieldName, string>>;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function useWriteKudoForm(onClose: () => void) {
  const t = useTranslations("WriteKudo");
  const router = useRouter();
  const recipient = useRecipientSearch();
  const pendingImages = usePendingImages();

  const [awardTitle, setAwardTitle] = useState("");
  const [messageHtml, setMessageHtml] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<string[]>([]);
  const [isHashtagPickerOpen, setIsHashtagPickerOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousDisplayName, setAnonymousDisplayName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMessages>({});
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getHashtagSuggestionsAction().then((tags) => {
      if (!cancelled) setHashtagSuggestions(tags);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddHashtag = useCallback((hashtag: string) => {
    const tag = hashtag.trim();
    if (!tag) return;
    setHashtags((prev) => (prev.includes(tag) || prev.length >= 5 ? prev : [...prev, tag]));
    setIsHashtagPickerOpen(false);
  }, []);

  const handleRemoveHashtag = useCallback((hashtag: string) => {
    setHashtags((prev) => prev.filter((tag) => tag !== hashtag));
  }, []);

  const canSubmit = useMemo(
    () =>
      Boolean(recipient.selectedReceiverId) &&
      awardTitle.trim() !== "" &&
      stripHtml(messageHtml) !== "" &&
      hashtags.length > 0 &&
      !isSubmitting,
    [recipient.selectedReceiverId, awardTitle, messageHtml, hashtags, isSubmitting],
  );

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitError(undefined);

    try {
      const result = await createKudo({
        receiverId: recipient.selectedReceiverId ?? "",
        awardTitle: awardTitle.trim(),
        message: messageHtml,
        hashtags,
        isAnonymous,
        anonymousName: anonymousDisplayName.trim() || undefined,
        images: pendingImages.files,
      });

      if (result.ok) {
        onClose();
        router.refresh();
        return;
      }

      const entries = Object.entries(result.fieldErrors ?? {}) as [FieldName, CreateKudoFieldErrors[FieldName]][];
      if (entries.length > 0) {
        const mapped: FieldErrorMessages = {};
        for (const [field, code] of entries) {
          if (code) mapped[field] = mapCreateKudoErrorCode(code, t);
        }
        setFieldErrors(mapped);
      } else {
        setSubmitError(mapCreateKudoErrorCode(result.error, t));
      }
    } catch (err) {
      unstable_rethrow(err);
      console.error("WriteKudoModal: submit failed", err);
      setSubmitError(t("errorInsertFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canSubmit,
    isSubmitting,
    recipient.selectedReceiverId,
    awardTitle,
    messageHtml,
    hashtags,
    isAnonymous,
    anonymousDisplayName,
    pendingImages.files,
    onClose,
    router,
    t,
  ]);

  return {
    recipientQuery: recipient.recipientQuery,
    setRecipientQuery: recipient.setRecipientQuery,
    selectRecipient: recipient.selectRecipient,
    recipientOptions: recipient.recipientOptions,
    awardTitle,
    setAwardTitle,
    messageHtml,
    setMessageHtml,
    hashtags,
    hashtagSuggestions,
    isHashtagPickerOpen,
    setIsHashtagPickerOpen,
    handleAddHashtag,
    handleRemoveHashtag,
    images: pendingImages.images,
    handleFilesSelected: pendingImages.handleFilesSelected,
    handleRemoveImage: pendingImages.handleRemoveImage,
    imageClientError: pendingImages.imageClientError,
    isAnonymous,
    setIsAnonymous,
    anonymousDisplayName,
    setAnonymousDisplayName,
    fieldErrors,
    submitError,
    isSubmitting,
    canSubmit,
    handleSubmit,
  };
}
