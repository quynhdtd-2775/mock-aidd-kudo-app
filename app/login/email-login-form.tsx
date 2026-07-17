"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { loginWithEmail, type EmailLoginState } from "./actions";

const INITIAL_STATE: EmailLoginState = { error: null };

const inputClassName =
  "w-full rounded-[8px] border border-[#2E3940] bg-[rgba(16,20,23,0.8)] px-4 py-3 text-base text-white placeholder:text-white/40 transition-colors duration-200 focus:border-[#FFEA9E] focus:outline-none";

/**
 * Email + password login (existing accounts only — no sign-up).
 * Server action returns { error } for inline display; redirects to "/home-page-saa" on success.
 */
export function EmailLoginForm() {
  const t = useTranslations("Login");
  const [state, formAction, pending] = useActionState(loginWithEmail, INITIAL_STATE);

  return (
    <form action={formAction} className="flex w-full max-w-[400px] flex-col gap-4">
      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder={t("emailPlaceholder")}
        aria-label={t("emailPlaceholder")}
        className={inputClassName}
      />
      <input
        type="password"
        name="password"
        required
        autoComplete="current-password"
        placeholder={t("passwordPlaceholder")}
        aria-label={t("passwordPlaceholder")}
        className={inputClassName}
      />

      {state.error ? (
        <p className="text-sm text-white" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-[8px] border border-[#FFEA9E] px-6 py-3 text-base font-bold text-[#FFEA9E] transition-colors duration-200 hover:bg-[#FFEA9E]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? t("submitPending") : t("submitLabel")}
      </button>
    </form>
  );
}
