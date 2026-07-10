import { GoogleLoginButton } from "./google-login-button";

type LoginHeroProps = {
  hasError: boolean;
};

/**
 * mms_B_Bìa — ROOT FURTHER key visual, Vietnamese tagline, Google login
 * button, and (when the OAuth callback redirected back with an error)
 * an inline failure message.
 */
export function LoginHero({ hasError }: LoginHeroProps) {
  return (
    <div className="flex flex-col gap-10 lg:gap-20">
      <img
        src="/login/root-further-logo.png"
        alt="ROOT FURTHER"
        width={451}
        height={200}
        className="h-auto w-[220px] sm:w-[320px] lg:w-[451px]"
      />

      <div className="flex flex-col gap-6 pl-4">
        <p className="max-w-[480px] text-[20px] font-bold leading-[40px] tracking-[0.5px] text-white">
          Bắt đầu hành trình của bạn cùng SAA 2025.
          <br />
          Đăng nhập để khám phá!
        </p>

        <GoogleLoginButton />

        {hasError ? (
          <p className="text-sm text-white">
            Đăng nhập thất bại. Vui lòng thử lại.
          </p>
        ) : null}
      </div>
    </div>
  );
}
