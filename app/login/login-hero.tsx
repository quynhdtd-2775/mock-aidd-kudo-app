/* eslint-disable @next/next/no-img-element */
import { getTranslations } from "next-intl/server";
import { GoogleLoginButton } from "./google-login-button";

type LoginHeroProps = {
  /** Error kind from the OAuth flow: "cancelled" | anything else = failure. */
  error: string | null;
};

/**
 * mms_B_Bìa — ROOT FURTHER key visual, Vietnamese tagline, Google login
 * button, and (when the OAuth callback redirected back with an error)
 * an inline failure message.
 */
export async function LoginHero({ error }: LoginHeroProps) {
  const t = await getTranslations("Login");

  return (
    <div className="flex flex-col gap-10 lg:gap-20">
      <img
        src="/login/root-further-logo.png"
        alt="ROOT FURTHER"
        width={451}
        height={200}
        className="h-auto w-55 sm:w-[320px] lg:w-112.75"
      />

      <div className="flex flex-col gap-6 pl-4">
        <p className="max-w-[480px] text-[20px] font-bold leading-[40px] tracking-[0.5px] text-white">
          {t("taglineLine1")}
          <br />
          {t("taglineLine2")}
        </p>

        <GoogleLoginButton />

        {error ? (
          <p className="text-sm text-white">{t("loginFailedError")}</p>
        ) : null}
      </div>
    </div>
  );
}
