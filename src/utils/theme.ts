import {
  DARK_THEME_QUERY,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
} from "@/constants/theme";
import type { Theme, ThemePreference } from "@/types/theme";

export function isThemeValue(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** The saved choice, or null when the user follows the OS setting. */
export function getStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeValue(value) ? value : null;
  } catch {
    return null;
  }
}

export function getOsPreferredTheme(): Theme {
  return window.matchMedia(DARK_THEME_QUERY).matches ? "dark" : "light";
}

/** The theme that should be shown right now. */
export function resolveThemeToDisplay(): Theme {
  return getStoredTheme() ?? getOsPreferredTheme();
}

/** The theme currently applied to <html>. */
export function getThemeFromDocument(): Theme {
  const value = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  return isThemeValue(value) ? value : resolveThemeToDisplay();
}

export function getStoredThemePreference(): ThemePreference {
  return getStoredTheme() ?? "system";
}

export function applyThemeOnDocument(theme: Theme): void {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
}

const listeners = new Set<() => void>();

function notifyThemeListeners() {
  listeners.forEach((listener) => listener());
}

/** Save the choice ("system" clears it) and apply the resulting theme. */
export function setThemePreference(preference: ThemePreference): void {
  try {
    if (preference === "system") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    }
  } catch {
    // Storage can be unavailable (private mode, blocked site data). The theme still applies for this page.
  }
  applyThemeOnDocument(
    preference === "system" ? getOsPreferredTheme() : preference,
  );
  notifyThemeListeners();
}

/**
 * Keep <html> in sync with the OS setting (while nothing is saved) and with changes made in other tabs.
 * The listener runs after every theme change. Returns an unsubscribe function.
 * Shaped for useSyncExternalStore: `useSyncExternalStore(subscribeToThemeChanges, getThemeFromDocument, () => "light")`.
 */
export function subscribeToThemeChanges(listener: () => void): () => void {
  listeners.add(listener);

  if (listeners.size === 1) {
    window
      .matchMedia(DARK_THEME_QUERY)
      .addEventListener("change", syncThemeFromExternalChange);
    window.addEventListener("storage", handleThemeStorageEvent);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window
        .matchMedia(DARK_THEME_QUERY)
        .removeEventListener("change", syncThemeFromExternalChange);
      window.removeEventListener("storage", handleThemeStorageEvent);
    }
  };
}

function syncThemeFromExternalChange() {
  applyThemeOnDocument(resolveThemeToDisplay());
  notifyThemeListeners();
}

function handleThemeStorageEvent(event: StorageEvent) {
  if (event.key === null || event.key === THEME_STORAGE_KEY)
    syncThemeFromExternalChange();
}
