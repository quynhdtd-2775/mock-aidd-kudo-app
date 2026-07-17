// Inline icons used only inside HighlightKudoCard (mm:335:9620). None of the
// source nodes are MM_MEDIA_-prefixed, so per project convention they are
// coded as inline SVG (currentColor) rather than rendered as image assets.

/** mm:I…;256:5140 (arrow icon between sender/receiver avatars) */
export function TransferArrowIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M18.6667 8L17.7867 8.88L23.24 14.3333H8V15.6667H23.24L17.7867 21.12L18.6667 22L26.6667 14L18.6667 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** mm:I…;256:5162 (heart icon next to like count) */
export function HeartIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 27.3333L14.16 25.6534C7.6 19.7067 3.33333 15.8267 3.33333 11.08C3.33333 7.2 6.36 4.16667 10.24 4.16667C12.4267 4.16667 14.5267 5.18667 16 6.79334C17.4733 5.18667 19.5733 4.16667 21.76 4.16667C25.64 4.16667 28.6667 7.2 28.6667 11.08C28.6667 15.8267 24.4 19.7067 17.84 25.6667L16 27.3333Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** mm:I…;256:5195 (copy-link icon) */
export function LinkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.9 12C3.9 10.29 5.29 8.9 7 8.9H11V7H7C4.24 7 2 9.24 2 12C2 14.76 4.24 17 7 17H11V15.1H7C5.29 15.1 3.9 13.71 3.9 12ZM8 13H16V11H8V13ZM17 7H13V8.9H17C18.71 8.9 20.1 10.29 20.1 12C20.1 13.71 18.71 15.1 17 15.1H13V17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** mm:I…;186:2691 — same arrow-up glyph reused by hero-cta.tsx UpIcon */
export function DetailArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.49945 18.3104L5.68945 15.5004L12.0595 9.12043H7.10945V5.69043H18.3095V16.8904H14.8895V11.9404L8.49945 18.3104Z"
        fill="currentColor"
      />
    </svg>
  );
}
