"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Notification } from "@/lib/notifications/notifications-types";
import { hasUnread } from "@/lib/notifications/notifications-types";

type NotificationsBellProps = {
  items: Notification[];
};

/**
 * mm:I2167:9091;186:2101 — header bell button, now a real dropdown: lists the
 * current user's notifications, red badge shown only while unread rows
 * exist. Interaction pattern (outside-click + Escape close) mirrors
 * components/home/user-menu.tsx.
 */
export function NotificationsBell({ items }: NotificationsBellProps) {
  const t = useTranslations("Notifications");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const unread = hasUnread(items);

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
    <div ref={rootRef} className="relative h-10 w-10">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("bellAriaLabel")}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-[4px] bg-transparent p-[10px] transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1"
      >
        {/* mm:I2167:9091;186:2101;186:2020;186:1420 — /home/Noti_True.svg inlined (currentColor) */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 text-white"
        >
          <path
            d="M21 19V20H3V19L5 17V11C5 7.9 7.03 5.17 10 4.29C10 4.19 10 4.1 10 4C10 3.46957 10.2107 2.96086 10.5858 2.58579C10.9609 2.21071 11.4696 2 12 2C12.5304 2 13.0391 2.21071 13.4142 2.58579C13.7893 2.96086 14 3.46957 14 4C14 4.1 14 4.19 14 4.29C16.97 5.17 19 7.9 19 11V17L21 19ZM14 21C14 21.5304 13.7893 22.0391 13.4142 22.4142C13.0391 22.7893 12.5304 23 12 23C11.4696 23 10.9609 22.7893 10.5858 22.4142C10.2107 22.0391 10 21.5304 10 21"
            fill="currentColor"
          />
        </svg>
      </button>

      {unread ? (
        <div className="pointer-events-none absolute right-[9px] top-[9px] h-2 w-2 rounded-full">
          {/* mm:I2167:9091;186:2101;186:2090 */}
          <div className="h-2 w-2 rounded-full bg-[#D4271D]" />
        </div>
      ) : null}

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-10 max-h-[360px] w-[320px] overflow-y-auto rounded-lg border border-[#2E3940] bg-[#101417] p-2 shadow-lg"
        >
          <p className="px-3 py-2 text-sm font-bold text-white">{t("panelTitle")}</p>
          {items.length === 0 ? (
            <p className="px-3 py-4 text-sm text-white/60">{t("empty")}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  role="menuitem"
                  className={`rounded-md px-3 py-2 transition-colors duration-200 hover:bg-white/10 ${
                    item.readAt == null ? "bg-white/5" : ""
                  }`}
                >
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-white/70">{item.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
