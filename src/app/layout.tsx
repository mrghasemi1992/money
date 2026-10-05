import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";

import { Providers } from "@/components/providers";
import { ThemeSync } from "@/components/theme-sync";
import { TimeZoneSync } from "@/components/time-zone-sync";
import { LOCALE_DIRECTIONS } from "@/constants/locale";
import { THEME_SCRIPT } from "@/constants/theme";
import { getPreferences } from "@/i18n/preferences";
import { MESSAGES } from "@/messages";
import { fontVariables } from "@/styles/fonts";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: { default: t("appName"), template: `%s | ${t("appName")}` },
    description: t("description"),
  };
}

/** Browser UI color: page surface of each theme (slate-50 / slate-950). */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#11141a" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const preferences = await getPreferences();
  const { locale } = preferences;

  return (
    // The inline theme script sets data-theme before hydration, so React must accept the DOM value.
    <html
      lang={locale}
      dir={LOCALE_DIRECTIONS[locale]}
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeSync />
        <Providers preferences={preferences} messages={MESSAGES[locale]}>
          <TimeZoneSync />
          {children}
        </Providers>
      </body>
    </html>
  );
}
