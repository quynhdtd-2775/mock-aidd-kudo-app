/**
 * mms_A_Header — semi-transparent bar pinned to the top of the login screen.
 * Logo on the left, static (non-interactive) VN language selector on the right.
 */
export function LoginHeader() {
  return (
    <header className="absolute left-0 top-0 z-20 flex w-full items-center justify-between bg-[rgba(11,15,18,0.8)] px-4 py-3 sm:px-10 md:px-16 lg:px-[144px]">
      <img
        src="/login/saa-logo.png"
        alt="SAA 2025"
        width={52}
        height={48}
        className="h-10 w-auto sm:h-12"
      />

      <div className="flex w-[108px] shrink-0 items-center gap-2 rounded-[4px] p-4">
        <img
          src="/login/vn-flag-icon.png"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6"
        />
        <span className="text-base font-bold text-white">VN</span>
        <img
          src="/login/chevron-down-icon.svg"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6"
        />
      </div>
    </header>
  );
}
