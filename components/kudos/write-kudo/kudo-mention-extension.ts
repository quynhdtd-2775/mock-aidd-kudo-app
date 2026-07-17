// Extends @tiptap/extension-mention to render `<span data-mention data-id>`
// instead of the default `data-type="mention"` markup, matching the allowlist
// in lib/kudos/sanitize-message-html.ts exactly so mentions survive
// server-side sanitization.

import { mergeAttributes } from "@tiptap/core";
import Mention from "@tiptap/extension-mention";

export const KudoMention = Mention.extend({
  renderHTML({ node, HTMLAttributes }) {
    const label = (node.attrs.label as string | null) ?? (node.attrs.id as string) ?? "";
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-mention": label, "data-id": node.attrs.id }),
      `@${label}`,
    ];
  },
});
