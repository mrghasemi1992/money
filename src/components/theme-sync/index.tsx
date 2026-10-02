"use client";

import { useLayoutEffect } from "react";

import {
  applyThemeOnDocument,
  resolveThemeToDisplay,
  subscribeToThemeChanges,
} from "@/utils/theme";

/**
 * Renders nothing. Re-applies the theme after hydration (React's dev remount clears
 * attributes set by the inline script) and follows OS or other-tab changes.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    applyThemeOnDocument(resolveThemeToDisplay());
    return subscribeToThemeChanges(() => {});
  }, []);

  return null;
}
