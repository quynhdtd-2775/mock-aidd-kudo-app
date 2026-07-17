import { DIGITAL_NUMBERS_FONT_FAMILY } from "./countdown-fonts";

type CountdownDigitBoxProps = {
  /** Single digit character, e.g. "0"-"9". */
  digit: string;
};

/**
 * mms 2268:35141 "Group 5" / 2268:35142 "Group 4" — one LED-style tile
 * holding a single digit. Two of these make up one two-digit unit.
 */
export function CountdownDigitBox({ digit }: CountdownDigitBoxProps) {
  return (
    <div
      className="relative flex h-30.75 w-19.25 items-center justify-center rounded-xl border-[0.75px] border-[#FFEA9E]/50 bg-linear-to-b from-white to-white/10 backdrop-blur-[24.96px]"
      aria-hidden="true"
    >
      <span
        className="text-[73.73px] leading-none text-white"
        style={{ fontFamily: DIGITAL_NUMBERS_FONT_FAMILY }}
      >
        {digit}
      </span>
    </div>
  );
}
