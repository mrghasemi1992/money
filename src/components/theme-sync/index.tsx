"use client";

import { useLayoutEffect } from "react";

import {
  applyThemeOnDocument,
  getThemeFromDocument,
  resolveThemeToDisplay,
  saveThemeCookie,
  subscribeToThemeChanges,
} from "@/utils/theme";

/**
 * Renders nothing. Re-applies the theme after hydration (React's dev remount clears
 * attributes set by the inline script) and follows OS or other-tab changes. Keeps the theme
 * cookie current, so the installed app's loading screen matches the theme (src/app/manifest.webmanifest).
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    applyThemeOnDocument(resolveThemeToDisplay());
    saveThemeCookie(getThemeFromDocument());
    return subscribeToThemeChanges(() =>
      saveThemeCookie(getThemeFromDocument()),
    );
  }, []);

  return null;
}
