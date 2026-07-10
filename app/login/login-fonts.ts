import { Montserrat, Montserrat_Alternates } from "next/font/google";

/**
 * Fonts for the /login screen only. Scoped here so the root layout's
 * Geist font setup (app/layout.tsx) stays untouched.
 */
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["700"],
});
