import { CountdownDigitBox } from "./countdown-digit-box";

type CountdownUnitProps = {
  /** Two-digit, zero-padded value, e.g. "05". */
  value: string;
  /** Uppercase unit label, e.g. "DAYS" | "HOURS" | "MINUTES". */
  label: string;
};

/**
 * mms 2268:35139 "1_Days" / 2268:35144 "2_Hours" / 2268:35149 "3_Minutes" —
 * a pair of digit tiles with an uppercase label underneath.
 */
export function CountdownUnit({ value, label }: CountdownUnitProps) {
  const [tens = "0", ones = "0"] = value.padStart(2, "0").split("");

  return (
    <div className="flex flex-col items-start gap-[21px]">
      <div className="flex flex-row items-center gap-[21px]">
        <CountdownDigitBox digit={tens} />
        <CountdownDigitBox digit={ones} />
      </div>
      <p className="text-[36px] leading-[48px] font-bold tracking-normal text-white">
        {label}
      </p>
    </div>
  );
}
