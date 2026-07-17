import { getTranslations } from "next-intl/server";
import { loginWithGoogle } from "./actions";

/**
 * mms_B.3_Login button — the only interactive element on the login screen.
 * Submits a server action that kicks off Google OAuth (implemented by the
 * backend track in ./actions).
 */
export async function GoogleLoginButton() {
  const t = await getTranslations("Login");

  return (
    <form action={loginWithGoogle}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-[8px] bg-[#ffea9e] px-6 py-4 transition-opacity hover:opacity-90"
      >
        <span className="text-[22px] font-bold leading-7 text-[#00101a]">
          {t("googleLoginButton")}
        </span>
        <img
          src="/login/google-icon.svg"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6"
        />
      </button>
    </form>
  );
}
