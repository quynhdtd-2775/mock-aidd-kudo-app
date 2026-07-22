"use client";

// mm:I3127:21871;256:5175 (C.4.1_Hearts) — interactive heart/like control for
// a real ALL KUDOS feed card. Optimistically flips color (gray → red) and
// count on click, then reconciles with the server via toggleKudoHeart;
// reverts on any error/exception. Disabled for the sender's own kudo (the
// action rejects self-like server-side too — this is UX-only, not the guard).

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toggleKudoHeart } from "@/app/kudos-live-board/actions";
import { formatCount } from "@/lib/format/kudo-display-format";

const MONTSERRAT = "var(--font-montserrat)";
const COLOR_LIKED = "#D4271D";
const COLOR_UNLIKED = "#999999";

export interface HeartButtonProps {
  kudoId: string;
  initialLiked: boolean;
  initialCount: number;
  disabled: boolean;
}

export function HeartButton({ kudoId, initialLiked, initialCount, disabled }: HeartButtonProps) {
  const t = useTranslations("LiveBoard");
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();

  const isDisabled = disabled || pending;

  function handleClick() {
    if (isDisabled) return;

    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !prevLiked;
    setLiked(nextLiked);
    setCount(nextLiked ? prevCount + 1 : Math.max(prevCount - 1, 0));

    startTransition(async () => {
      try {
        const result = await toggleKudoHeart(kudoId);
        if (result.ok) {
          setLiked(result.liked);
          setCount(result.heartsCount);
        } else {
          setLiked(prevLiked);
          setCount(prevCount);
        }
      } catch (err) {
        // redirect("/login") surfaces as a thrown NEXT_REDIRECT signal — let
        // it propagate to the framework instead of swallowing it here.
        setLiked(prevLiked);
        setCount(prevCount);
        throw err;
      }
    });
  }

  const ariaLabel = disabled
    ? t("ownKudoHeartDisabled")
    : liked
      ? t("unlikeKudo")
      : t("likeKudo");

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-pressed={liked}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      title={ariaLabel}
      className="flex items-center gap-1 rounded p-1 transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        className="text-2xl font-bold leading-8 text-[#00101A]"
        style={{ fontFamily: MONTSERRAT }}
      >
        {formatCount(count)}
      </span>
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12.3364 21.1076L10.8864 19.7876C5.73643 15.1176 2.33643 12.0276 2.33643 8.25757C2.33643 5.16757 4.75643 2.75757 7.83643 2.75757C9.57643 2.75757 11.2464 3.56757 12.3364 4.83757C13.4264 3.56757 15.0964 2.75757 16.8364 2.75757C19.9164 2.75757 22.3364 5.16757 22.3364 8.25757C22.3364 12.0276 18.9364 15.1176 13.7864 19.7876L12.3364 21.1076Z"
          fill={liked ? COLOR_LIKED : COLOR_UNLIKED}
        />
      </svg>
    </button>
  );
}
