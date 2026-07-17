"use client";

// mm:I520:11647;520:9877 (mms_C_Chức năng) — rich-text formatting toolbar:
// Bold / Italic / Strikethrough / numbered list / link / quote, plus a
// "Tiêu chuẩn cộng đồng" (community standards) link on the trailing edge.
// Wired to a live Tiptap `Editor` instance owned by KudoTextarea.

import { useTranslations } from "next-intl";
import type { Editor } from "@tiptap/react";
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  NumberListIcon,
  QuoteIcon,
  StrikethroughIcon,
} from "./write-kudo-icons";
import { MONTSERRAT, WRITE_KUDO_COLORS } from "./write-kudo-tokens";

export type EditorFormatAction = "bold" | "italic" | "strikethrough" | "numberList" | "link" | "quote";

export interface EditorToolbarProps {
  editor: Editor | null;
  onOpenCommunityStandard?: () => void;
}

function runFormatAction(editor: Editor, action: EditorFormatAction, linkPromptLabel: string) {
  const chain = editor.chain().focus();
  switch (action) {
    case "bold":
      chain.toggleBold().run();
      break;
    case "italic":
      chain.toggleItalic().run();
      break;
    case "strikethrough":
      chain.toggleStrike().run();
      break;
    case "numberList":
      chain.toggleOrderedList().run();
      break;
    case "quote":
      chain.toggleBlockquote().run();
      break;
    case "link": {
      const previousUrl = (editor.getAttributes("link").href as string | undefined) ?? "";
      const url = window.prompt(linkPromptLabel, previousUrl);
      if (url === null) return;
      const range = editor.chain().focus().extendMarkRange("link");
      if (url.trim() === "") range.unsetLink().run();
      else range.setLink({ href: url.trim() }).run();
      break;
    }
  }
}

function isActionActive(editor: Editor | null, action: EditorFormatAction): boolean {
  if (!editor) return false;
  switch (action) {
    case "bold":
      return editor.isActive("bold");
    case "italic":
      return editor.isActive("italic");
    case "strikethrough":
      return editor.isActive("strike");
    case "numberList":
      return editor.isActive("orderedList");
    case "quote":
      return editor.isActive("blockquote");
    case "link":
      return editor.isActive("link");
  }
}

export function EditorToolbar({ editor, onOpenCommunityStandard }: EditorToolbarProps) {
  const t = useTranslations("WriteKudo");

  const buttons: { action: EditorFormatAction; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { action: "bold", label: t("toolbarBold"), icon: BoldIcon },
    { action: "italic", label: t("toolbarItalic"), icon: ItalicIcon },
    { action: "strikethrough", label: t("toolbarStrikethrough"), icon: StrikethroughIcon },
    { action: "numberList", label: t("toolbarNumberList"), icon: NumberListIcon },
    { action: "link", label: t("toolbarLink"), icon: LinkIcon },
    { action: "quote", label: t("toolbarQuote"), icon: QuoteIcon },
  ];

  return (
    <div className="flex w-full items-center justify-end" style={{ borderRadius: "8px 8px 0 0" }}>
      <div className="flex">
        {buttons.map(({ action, label, icon: Icon }, index) => {
          const active = isActionActive(editor, action);
          return (
            <button
              key={action}
              type="button"
              aria-label={label}
              aria-pressed={active}
              disabled={!editor}
              onClick={() => editor && runFormatAction(editor, action, t("linkPrompt"))}
              className="flex h-10 items-center justify-center px-4 py-2.5 transition-colors duration-200 hover:bg-[rgba(153,140,95,0.10)] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                border: `1px solid ${WRITE_KUDO_COLORS.border}`,
                borderLeftWidth: index === 0 ? 1 : 0,
                borderRadius: index === 0 ? "8px 0 0 0" : undefined,
                background: active ? "rgba(153,140,95,0.18)" : undefined,
              }}
            >
              <Icon className="h-6 w-6" />
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onOpenCommunityStandard}
        className="flex h-10 flex-1 items-center justify-center px-4 py-2.5 transition-colors duration-200 hover:bg-[rgba(153,140,95,0.10)]"
        style={{
          border: `1px solid ${WRITE_KUDO_COLORS.border}`,
          borderLeftWidth: 0,
          borderRadius: "0 8px 0 0",
        }}
      >
        <span
          className="text-right"
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "0.15px",
            color: WRITE_KUDO_COLORS.communityStandardLink,
          }}
        >
          {t("communityStandard")}
        </span>
      </button>
    </div>
  );
}
