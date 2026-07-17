"use client";

// mm:I520:11647;520:9875 (Nhập kudo) — the content editor: toolbar + Tiptap
// rich-text area + mention hint line beneath. Owns the Tiptap `Editor`
// instance; emits sanitizable HTML via onChange (server re-sanitizes on submit).

import { useState } from "react";
import { useTranslations } from "next-intl";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { EditorToolbar } from "./editor-toolbar";
import { KudoMention } from "./kudo-mention-extension";
import { createMentionSuggestion } from "./mention-suggestion";
import { FieldErrorText } from "./field-error-text";
import { MONTSERRAT, WRITE_KUDO_COLORS } from "./write-kudo-tokens";

export interface KudoTextareaProps {
  value: string;
  onChange: (html: string) => void;
  onOpenCommunityStandard?: () => void;
  error?: string;
}

export function KudoTextarea({ value, onChange, onOpenCommunityStandard, error }: KudoTextareaProps) {
  const t = useTranslations("WriteKudo");
  const [isEmpty, setIsEmpty] = useState(true);

  const editor = useEditor({
    extensions: [
      // StarterKit bundles its own Link extension — disable it so the
      // customized one below (no auto-link, no open-on-click) wins instead
      // of colliding on the "link" extension name.
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: false }),
      KudoMention.configure({ suggestion: createMentionSuggestion(t("mentionNoResults")) }),
    ],
    content: value,
    immediatelyRender: false,
    onCreate: ({ editor: created }) => setIsEmpty(created.isEmpty),
    onUpdate: ({ editor: updated }) => {
      onChange(updated.getHTML());
      setIsEmpty(updated.isEmpty);
    },
    editorProps: {
      attributes: {
        "aria-label": t("contentAriaLabel"),
        class: "kudo-editor-content w-full min-h-[200px] outline-none px-6 py-4",
      },
    },
  });

  return (
    <div className="flex w-full flex-col items-end gap-1">
      <div className="flex w-full flex-col items-start">
        <EditorToolbar editor={editor} onOpenCommunityStandard={onOpenCommunityStandard} />
        <div
          className="relative w-full"
          style={{
            border: `1px solid ${error ? WRITE_KUDO_COLORS.requiredMark : WRITE_KUDO_COLORS.border}`,
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            background: WRITE_KUDO_COLORS.fieldBackground,
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "0.15px",
            color: WRITE_KUDO_COLORS.textPrimary,
          }}
        >
          {isEmpty && (
            <p
              aria-hidden="true"
              className="pointer-events-none absolute left-6 top-4"
              style={{ color: WRITE_KUDO_COLORS.textSecondary }}
            >
              {t("contentPlaceholder")}
            </p>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
      <FieldErrorText message={error} />
      <p
        style={{
          fontFamily: MONTSERRAT,
          fontWeight: 700,
          fontSize: 16,
          lineHeight: "24px",
          letterSpacing: "0.5px",
          color: WRITE_KUDO_COLORS.textPrimary,
        }}
      >
        {t("mentionHint")}
      </p>
    </div>
  );
}
