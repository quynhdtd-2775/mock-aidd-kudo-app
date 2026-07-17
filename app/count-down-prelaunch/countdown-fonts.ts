import { Montserrat } from "next/font/google";

/**
 * Fonts for the /count-down-prelaunch screen only. Scoped here so the root
 * layout's Geist font setup (app/layout.tsx) stays untouched.
 */
export const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
});

/**
 * LED/digital digit font used by the countdown number tiles (2268:35141
 * etc). "Digital Numbers" (per the Figma design) is not in Google Fonts'
 * catalog (`next/font/google` has no such export), so it is not
 * self-hostable via next/font here. Declared as a plain CSS font-family
 * with a tabular monospace fallback stack: renders with the intended font
 * on machines that have it installed, degrades gracefully otherwise.
 */
export const DIGITAL_NUMBERS_FONT_FAMILY =
  '"Digital Numbers", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
