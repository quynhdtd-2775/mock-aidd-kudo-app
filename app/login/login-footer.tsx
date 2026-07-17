import { getTranslations } from "next-intl/server";
import { montserratAlternates } from "./login-fonts";

/**
 * mms_D_Footer — bordered footer with copyright notice, set in
 * Montserrat Alternates per the design (all other login copy uses Montserrat).
 */
export async function LoginFooter() {
  const t = await getTranslations("Footer");

  return (
    <footer className="relative border-t border-[#2e3940] px-4 py-10 text-center sm:px-[90px]">
      <p
        className={`${montserratAlternates.className} text-base font-bold leading-6 text-white`}
      >
        {t("copyright")}
      </p>
    </footer>
  );
}
