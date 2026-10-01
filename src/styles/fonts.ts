import localFont from "next/font/local";

/**
 * Dana variable font. Its default weight is 10 (hairline), so the full range is declared
 * and every text style must set its own weight.
 */
export const dana = localFont({
  src: "./fonts/dana-variable.woff2",
  weight: "10 900",
  display: "swap",
  variable: "--font-dana",
});

/** Class names that define the font CSS variables. Put them on <html>. */
export const fontVariables = dana.variable;
