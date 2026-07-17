import { describe, it, expect } from "vitest";
import { sanitizeMessageHtml } from "./sanitize-message-html";

describe("sanitizeMessageHtml", () => {
  it("returns empty string for empty/falsy input", () => {
    expect(sanitizeMessageHtml("")).toBe("");
  });

  it("strips <script> blocks entirely, including their content", () => {
    const input = '<p>hello</p><script>alert("xss")</script><p>world</p>';
    expect(sanitizeMessageHtml(input)).toBe("<p>hello</p><p>world</p>");
  });

  it("strips <style> blocks entirely, including their content", () => {
    const input = "<p>a</p><style>body{color:red}</style><p>b</p>";
    expect(sanitizeMessageHtml(input)).toBe("<p>a</p><p>b</p>");
  });

  it("strips HTML comments", () => {
    const input = "<p>a</p><!-- evil comment --><p>b</p>";
    expect(sanitizeMessageHtml(input)).toBe("<p>a</p><p>b</p>");
  });

  it("strips onclick and other inline event handler attributes on allowed tags", () => {
    const input = '<p onclick="alert(1)">click me</p>';
    expect(sanitizeMessageHtml(input)).toBe("<p>click me</p>");
  });

  it("strips disallowed tags but preserves their inner text content", () => {
    const input = "<div>kept text</div>";
    expect(sanitizeMessageHtml(input)).toBe("kept text");
  });

  it("strips img tags (disallowed) but any text around it survives", () => {
    const input = '<p>before</p><img src="x" onerror="alert(1)" /><p>after</p>';
    expect(sanitizeMessageHtml(input)).toBe("<p>before</p><p>after</p>");
  });

  it.each([
    ["<strong>bold</strong>", "<strong>bold</strong>"],
    ["<b>bold</b>", "<b>bold</b>"],
    ["<em>em</em>", "<em>em</em>"],
    ["<i>i</i>", "<i>i</i>"],
    ["<s>s</s>", "<s>s</s>"],
    ["<ol><li>one</li></ol>", "<ol><li>one</li></ol>"],
    ["<blockquote>quote</blockquote>", "<blockquote>quote</blockquote>"],
    ["<br/>", "<br />"],
    ["<br>", "<br />"],
  ])("keeps allowlisted tag %s unchanged (structurally)", (input, expected) => {
    expect(sanitizeMessageHtml(input)).toBe(expected);
  });

  it("keeps <a href> with an http(s) protocol", () => {
    const input = '<a href="https://example.com">link</a>';
    expect(sanitizeMessageHtml(input)).toBe('<a href="https://example.com">link</a>');
  });

  it("keeps <a href> with mailto/relative/hash protocols", () => {
    expect(sanitizeMessageHtml('<a href="mailto:a@b.com">m</a>')).toBe(
      '<a href="mailto:a@b.com">m</a>',
    );
    expect(sanitizeMessageHtml('<a href="/path">rel</a>')).toBe('<a href="/path">rel</a>');
    expect(sanitizeMessageHtml('<a href="#anchor">hash</a>')).toBe('<a href="#anchor">hash</a>');
  });

  it("strips unsafe href protocols (javascript:, data:, vbscript:)", () => {
    expect(sanitizeMessageHtml('<a href="javascript:alert(1)">x</a>')).toBe("<a>x</a>");
    expect(sanitizeMessageHtml('<a href="data:text/html,evil">x</a>')).toBe("<a>x</a>");
    expect(sanitizeMessageHtml('<a href="vbscript:msgbox(1)">x</a>')).toBe("<a>x</a>");
  });

  it("strips protocol-relative hrefs (open-redirect/phishing vector) — MINOR-3", () => {
    // `//evil.com` inherits the page's own protocol and would otherwise pass
    // the bare `\/` alternative in the old regex, rendering as if it were an
    // internal link.
    expect(sanitizeMessageHtml('<a href="//evil.com">click</a>')).toBe("<a>click</a>");
    expect(sanitizeMessageHtml('<a href="//evil.com/path?x=1">click</a>')).toBe("<a>click</a>");
  });

  it("keeps span[data-mention] and span[data-id] with safe identifier values", () => {
    const input = '<span data-mention="user" data-id="abc-123">@user</span>';
    expect(sanitizeMessageHtml(input)).toBe(
      '<span data-mention="user" data-id="abc-123">@user</span>',
    );
  });

  it("drops span data attributes with unsafe (non-identifier) values", () => {
    const input = '<span data-mention="&quot;><script>alert(1)</script>">@user</span>';
    // The unsafe value fails the identifier allowlist and is dropped;
    // the (now-empty-attr) span tag itself remains, script content is
    // still stripped by the dangerous-block pass upstream in the pipeline.
    const result = sanitizeMessageHtml(input);
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("data-mention=");
  });

  it("drops attributes not on the allowlist for a given tag (e.g. style, class)", () => {
    const input = '<p style="color:red" class="foo">text</p>';
    expect(sanitizeMessageHtml(input)).toBe("<p>text</p>");
  });

  it("strips unknown/disallowed tags like <video> and <iframe>", () => {
    expect(sanitizeMessageHtml("<iframe src=\"evil\"></iframe>")).toBe("");
    expect(sanitizeMessageHtml("<video><source src=\"x\"></video>")).toBe("");
  });

  it("detects an empty-after-strip result (all markup removed, no text)", () => {
    const result = sanitizeMessageHtml('<img src="x"/>');
    const strippedOfTags = result.replace(/<[^>]*>/g, "").trim();
    expect(strippedOfTags).toBe("");
  });

  it("preserves plain text with no markup", () => {
    expect(sanitizeMessageHtml("just plain text")).toBe("just plain text");
  });
});
