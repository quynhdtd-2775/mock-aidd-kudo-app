// Server-side allowlist HTML sanitizer for kudos messages, backed by the
// `sanitize-html` package. Covers exactly the tags the Tiptap editor output
// needs and nothing more. Never trust client-submitted HTML without running
// it through this (or an equivalent) allowlist first.

import sanitizeHtmlLib from "sanitize-html";

const ALLOWED_TAGS = ["p", "br", "strong", "b", "em", "i", "s", "ol", "li", "a", "blockquote", "span"];

// `\/(?!\/)` allows a single leading slash (relative path) but rejects a
// protocol-relative URL like `//evil.com` — that second alternative used to
// be the bare `\/`, which also matched the first `/` of `//`, letting an
// open-redirect/phishing link through as a "safe" href.
const SAFE_HREF_PROTOCOL = /^(https?:|mailto:|#|\/(?!\/))/i;
const SAFE_DATA_ATTR_VALUE = /^[\w-]*$/;
const MENTION_DATA_ATTRS = ["data-mention", "data-id"] as const;

export function sanitizeMessageHtml(html: string): string {
  if (!html) return "";

  return sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href"],
      span: [...MENTION_DATA_ATTRS],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href;
        const kept: Record<string, string> = {};
        if (href && SAFE_HREF_PROTOCOL.test(href.trim())) kept.href = href;
        return { tagName: "a", attribs: kept };
      },
      span: (tagName, attribs) => {
        const kept: Record<string, string> = {};
        for (const name of MENTION_DATA_ATTRS) {
          const value = attribs[name];
          if (value !== undefined && SAFE_DATA_ATTR_VALUE.test(value)) kept[name] = value;
        }
        return { tagName: "span", attribs: kept };
      },
    },
  }).trim();
}
