import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { montserrat } from "./login-fonts";
import { LoginHeader } from "./login-header";
import { LoginHero } from "./login-hero";
import { LoginFooter } from "./login-footer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Login");
  return {
    title: t("metaTitle"),
  };
}

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div
      className={`${montserrat.className} relative flex flex-1 flex-col overflow-hidden bg-[#00101a]`}
      data-name="Login"
    >
      {/* mms_C_Keyvisual: full-bleed background artwork. No negative z-index —
          it would paint behind this div's opaque background (no stacking
          context here); instead these layers come first and content sits on
          top with its own positioning. */}
      <div className="absolute inset-0">
        <img
          src="/login/keyvisual-background.png"
          alt=""
          className="h-full w-full object-cover object-[70%_center]"
        />
      </div>

      {/* Cover: vertical gradient darkening the bottom of the frame */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#00101a] from-[22.482%] to-[rgba(0,19,32,0)] to-[51.738%]" />

      {/* Side gradient: darkens the left side so the copy stays legible */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00101a] via-[#00101a] via-[25.407%] to-[rgba(0,16,26,0)]" />

      <LoginHeader />

      <main className="relative flex flex-1 items-center px-4 py-16 sm:px-10 md:px-16 lg:px-[144px]">
        <LoginHero error={error} />
      </main>

      <LoginFooter />
    </div>
  );
}
