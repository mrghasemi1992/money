import type { Metadata, Viewport } from "next";

import { Providers } from "@/components/providers";
import { ThemeSync } from "@/components/theme-sync";
import { THEME_SCRIPT } from "@/constants/theme";
import { fontVariables } from "@/styles/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "پول", template: "%s | پول" },
  description: "حسابداری شخصی",
};

/** Browser UI color: page surface of each theme (slate-50 / slate-950). */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#11141a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The inline theme script sets data-theme before hydration, so React must accept the DOM value.
    <html
      lang="fa"
      dir="rtl"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeSync />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
