import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";

import { Providers } from "@/components/providers";
import { ThemeSync } from "@/components/theme-sync";
import { TimeZoneSync } from "@/components/time-zone-sync";
import { LOCALE_DIRECTIONS } from "@/constants/locale";
import { SIDEBAR_SCRIPT } from "@/constants/sidebar";
import { THEME_PAGE_COLORS, THEME_SCRIPT } from "@/constants/theme";
import { getPreferences } from "@/i18n/preferences";
import { MESSAGES } from "@/messages";
import { fontVariables } from "@/styles/fonts";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: { default: t("appName"), template: `%s | ${t("appName")}` },
    description: t("description"),
    // The installed app's name on iOS, instead of the page title («ورود | پول»). The default
    // status bar takes the theme color below; black-translucent would put white text on the
    // light theme.
    appleWebApp: {
      capable: true,
      title: t("appName"),
      statusBarStyle: "default",
    },
  };
}

/**
 * Browser UI color: page surface of each theme. The page reaches under
 * the notch and the home indicator; the top bar and tab bar pad themselves with the safe areas.
 */
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_PAGE_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_PAGE_COLORS.dark },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const preferences = await getPreferences();
  const { locale } = preferences;

  return (
    // The inline scripts set data-theme and data-sidebar before hydration, so React must accept the DOM values.
    <html
      lang={locale}
      dir={LOCALE_DIRECTIONS[locale]}
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SIDEBAR_SCRIPT }} />
        {/* With cookies, so the manifest follows the user's language and theme (see its route). */}
        <link
          rel="manifest"
          href="/manifest.webmanifest"
          crossOrigin="use-credentials"
        />
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
