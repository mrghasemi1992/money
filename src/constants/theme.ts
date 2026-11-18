import type { Theme } from "@/types/theme";

export const THEME_STORAGE_KEY = "money-theme";
export const THEME_ATTRIBUTE = "data-theme";
export const DARK_THEME_QUERY = "(prefers-color-scheme: dark)";

/**
 * The theme shown on this device (light or dark, after resolving «system»), copied into a
 * cookie so the web app manifest can match it. The choice itself stays in localStorage.
 */
export const THEME_COOKIE = "money-theme";

/** One year, in seconds. */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * The page surface of each theme (slate-50 / slate-950, `--surface-page`), for places that
 * can't read CSS variables: the browser UI color and the installed app's loading screen.
 */
export const THEME_PAGE_COLORS: Record<Theme, string> = {
  light: "#f4f6fa",
  dark: "#11141a",
};

/**
 * The brand color of each theme (royal-600 / its dark value, `--brand-solid`), for the iOS
 * startup images, which draw LogoMark's tile without CSS.
 */
export const THEME_BRAND_COLORS: Record<Theme, string> = {
  light: "#223bb2",
  dark: "#3e55cf",
};

/**
 * Runs in <head> before the first paint. Mirrors resolveThemeToDisplay() in utils/theme.ts
 * without imports, because it is inlined as a string.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t!=="light"&&t!=="dark"){t=matchMedia(${JSON.stringify(DARK_THEME_QUERY)}).matches?"dark":"light"}document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},t)}catch(e){}})()`;
