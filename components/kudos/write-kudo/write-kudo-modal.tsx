"use client";

// mm:520:11602 (Viết Kudo) → root panel mm:520:11647 (Viết KUDO, instance
// 520:10673). Controlled via isOpen/onClose so the trigger (kudos-live-board's
// write-kudo-launcher) owns when it opens. Fully wired: recipient/hashtag
// autocomplete, Tiptap rich text + mentions, client-validated image upload,
// and submits through the createKudo server action (see use-write-kudo-form).

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { RecipientSelector } from "./recipient-selector";
import { AwardTitleField } from "./award-title-field";
import { KudoTextarea } from "./kudo-textarea";
import { HashtagField } from "./hashtag-field";
import { HashtagSuggestionPopover } from "./hashtag-suggestion-popover";
import { ImageUploadField } from "./image-upload-field";
import { AnonymousToggle } from "./anonymous-toggle";
import { ModalFooter } from "./modal-footer";
import { MONTSERRAT, WRITE_KUDO_COLORS } from "./write-kudo-tokens";
import { useWriteKudoForm } from "./use-write-kudo-form";

export interface WriteKudoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WriteKudoModal({ isOpen, onClose }: WriteKudoModalProps) {
  const t = useTranslations("WriteKudo");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useWriteKudoForm(onClose);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("heading")}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        className="flex w-full max-w-[752px] flex-col items-start gap-8 overflow-y-auto rounded-3xl p-6 sm:p-10"
        style={{ background: WRITE_KUDO_COLORS.modalBackground, maxHeight: "90vh" }}
      >
        <h2
          className="w-full text-center"
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 32,
            lineHeight: "40px",
            color: WRITE_KUDO_COLORS.textPrimary,
          }}
        >
          {t("heading")}
        </h2>

        <RecipientSelector
          value={form.recipientQuery}
          onQueryChange={form.setRecipientQuery}
          onSelect={form.selectRecipient}
          options={form.recipientOptions}
          error={form.fieldErrors.receiverId}
        />

        <AwardTitleField value={form.awardTitle} onChange={form.setAwardTitle} error={form.fieldErrors.awardTitle} />

        <div className="flex w-full flex-col gap-6">
          <KudoTextarea value={form.messageHtml} onChange={form.setMessageHtml} error={form.fieldErrors.message} />

          <div className="relative w-full">
            <HashtagField
              hashtags={form.hashtags}
              onAdd={() => form.setIsHashtagPickerOpen(true)}
              onRemove={form.handleRemoveHashtag}
              error={form.fieldErrors.hashtags}
            />
            {form.isHashtagPickerOpen && (
              <HashtagSuggestionPopover
                suggestions={form.hashtagSuggestions}
                existing={form.hashtags}
                onSelect={form.handleAddHashtag}
                onClose={() => form.setIsHashtagPickerOpen(false)}
                searchPlaceholder={t("hashtagSearchPlaceholder")}
                createLabel={(value) => t("hashtagCreateNew", { value })}
                noSuggestionsLabel={t("hashtagNoSuggestions")}
              />
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            className="hidden"
            onChange={(event) => {
              form.handleFilesSelected(event.target.files);
              event.target.value = "";
            }}
          />
          <ImageUploadField
            images={form.images}
            onAdd={() => fileInputRef.current?.click()}
            onRemove={form.handleRemoveImage}
            error={form.fieldErrors.images ?? form.imageClientError}
          />
        </div>

        <AnonymousToggle
          checked={form.isAnonymous}
          onCheckedChange={form.setIsAnonymous}
          displayName={form.anonymousDisplayName}
          onDisplayNameChange={form.setAnonymousDisplayName}
        />

        <ModalFooter
          onCancel={onClose}
          onSubmit={form.handleSubmit}
          canSubmit={form.canSubmit}
          isSubmitting={form.isSubmitting}
          submitError={form.submitError}
        />
      </div>
    </div>
  );
}
