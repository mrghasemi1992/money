import {
  SIDEBAR_ATTRIBUTE,
  SIDEBAR_COLLAPSED,
  SIDEBAR_STORAGE_KEY,
} from "@/constants/sidebar";

/** Whether the sidebar is collapsed, as <html> shows it (set by SIDEBAR_SCRIPT, then by setSidebarCollapsed). */
export function isSidebarCollapsed(): boolean {
  return (
    document.documentElement.getAttribute(SIDEBAR_ATTRIBUTE) ===
    SIDEBAR_COLLAPSED
  );
}

const listeners = new Set<() => void>();

/** Saves the choice on this device and applies it to <html>. */
export function setSidebarCollapsed(collapsed: boolean): void {
  try {
    if (collapsed) {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, SIDEBAR_COLLAPSED);
    } else {
      window.localStorage.removeItem(SIDEBAR_STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode, blocked site data). The choice still applies to this page.
  }
  applySidebarCollapsed(collapsed);
}

function applySidebarCollapsed(collapsed: boolean) {
  if (collapsed) {
    document.documentElement.setAttribute(SIDEBAR_ATTRIBUTE, SIDEBAR_COLLAPSED);
  } else {
    document.documentElement.removeAttribute(SIDEBAR_ATTRIBUTE);
  }
  listeners.forEach((listener) => listener());
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key === null || event.key === SIDEBAR_STORAGE_KEY) {
    applySidebarCollapsed(event.newValue === SIDEBAR_COLLAPSED);
  }
}

/**
 * Runs `listener` after every change, here or in another tab. Returns an unsubscribe function.
 * Shaped for useSyncExternalStore: `useSyncExternalStore(subscribeToSidebar, isSidebarCollapsed, () => false)`.
 */
export function subscribeToSidebar(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener("storage", handleStorageEvent);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
}
