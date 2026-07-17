"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { logout } from "@/app/auth/actions";

type UserMenuProps = {
  email: string | null;
};

/**
 * mm:I313:8440;186:1597 — header profile button, now interactive: opens a
 * small dropdown with the signed-in email and a logout action.
 */
export function UserMenu({ email }: UserMenuProps) {
  const t = useTranslations("UserMenu");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("accountAriaLabel")}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-[#998C5F] bg-transparent p-[10px] transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
      >
        {/* mm:I313:8440;186:1597;186:1420 */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 text-white"
        >
          <path
            d="M12 4C13.0609 4 14.0783 4.42143 14.8284 5.17157C15.5786 5.92172 16 6.93913 16 8C16 9.06087 15.5786 10.0783 14.8284 10.8284C14.0783 11.5786 13.0609 12 12 12C10.9391 12 9.92172 11.5786 9.17157 10.8284C8.42143 10.0783 8 9.06087 8 8C8 6.93913 8.42143 5.92172 9.17157 5.17157C9.92172 4.42143 10.9391 4 12 4ZM12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-10 min-w-[220px] rounded-lg border border-[#2E3940] bg-[#101417] p-2 shadow-lg"
        >
          {email ? (
            <p className="truncate px-3 py-2 text-sm text-white/70" title={email}>
              {email}
            </p>
          ) : null}
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="w-full rounded-md px-3 py-2 text-left text-sm font-bold text-[#FFEA9E] transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]"
            >
              {t("logout")}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
