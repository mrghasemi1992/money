import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";

/**
 * Dana variable font, for Persian and for everything in the Persian interface. Its default
 * weight is 10 (hairline), so the full range is declared and every text style must set its
 * own weight.
 */
export const dana = localFont({
  src: "./fonts/dana-variable.woff2",
  weight: "10 900",
  display: "swap",
  variable: "--font-dana",
});

/**
 * Plus Jakarta Sans (Kanvas's text face), for Latin text in the English interface. Persian
 * text there (names, categories) falls back to Dana. Variable, weights 200–800.
 */
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

/** Class names that define the font CSS variables. Put them on <html>. */
export const fontVariables = `${dana.variable} ${plusJakartaSans.variable}`;
