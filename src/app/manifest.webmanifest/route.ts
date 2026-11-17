import type { MetadataRoute } from "next";
import { cookies } from "next/headers";

import { APP_ICONS, APP_ICONS_PATH } from "@/constants/app-icon";
import { LOCALE_DIRECTIONS } from "@/constants/locale";
import { THEME_COOKIE, THEME_PAGE_COLORS } from "@/constants/theme";
import { resolveLocale } from "@/i18n/locale";
import { MESSAGES } from "@/messages";
import { isThemeValue } from "@/utils/theme";

/**
 * The web app manifest: the installed app's name, language and loading screen. A Route Handler
 * rather than Next.js's manifest.ts, because the root layout links it with
 * crossorigin="use-credentials" (Next.js does that only on Vercel previews): without it the
 * browser fetches the manifest without cookies, and it couldn't follow the user.
 *
 * - Name and direction in the language of the page it's installed from (resolveLocale: the
 *   user's setting, otherwise the language cookie, the browser's language, then Persian).
 * - Background and bar color: the page surface of the theme shown on this device (the theme
 *   cookie, kept by ThemeSync); light until a page has set it.
 *
 * Public, like the icons: src/proxy.ts lets .webmanifest paths through.
 */
export async function GET() {
  const locale = await resolveLocale();
  const savedTheme = (await cookies()).get(THEME_COOKIE)?.value;
  const color =
    THEME_PAGE_COLORS[isThemeValue(savedTheme) ? savedTheme : "light"];
  const { appName, description } = MESSAGES[locale].metadata;

  const manifest: MetadataRoute.Manifest = {
    id: "/",
    name: appName,
    short_name: appName,
    description,
    lang: locale,
    dir: LOCALE_DIRECTIONS[locale],
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: color,
    theme_color: color,
    icons: APP_ICONS.map(({ file, size, purpose }) => ({
      src: `${APP_ICONS_PATH}/${file}`,
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose,
    })),
  };

  return Response.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      // Differs per user and device: never shared by a cache.
      "Cache-Control": "private, no-cache",
    },
  });
}
