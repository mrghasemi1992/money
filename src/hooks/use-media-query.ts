"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether a media query matches, such as MOBILE_QUERY from src/constants/media.ts. The server
 * render and hydration use `serverValue`; prefer CSS media queries for layout and use this only
 * to pick between components (Dialog on desktop, Sheet on phones).
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
