"use client";

import { useSyncExternalStore } from "react";

import type { ThemePreference } from "@/types/theme";
import {
  getStoredThemePreference,
  setThemePreference,
  subscribeToThemeChanges,
} from "@/utils/theme";

/**
 * The theme choice saved on this device (light, dark or system) and a setter that saves and
 * applies it. Follows changes made in other tabs and in other components.
 */
export function useThemePreference(): [
  ThemePreference,
  (preference: ThemePreference) => void,
] {
  const preference = useSyncExternalStore(
    subscribeToThemeChanges,
    getStoredThemePreference,
    () => "system" as const,
  );
  return [preference, setThemePreference];
}
