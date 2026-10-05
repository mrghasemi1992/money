"use client";

import { useSyncExternalStore } from "react";

import {
  isSidebarCollapsed,
  setSidebarCollapsed,
  subscribeToSidebar,
} from "@/utils/sidebar";

/**
 * Whether the desktop sidebar is collapsed to an icon rail, saved on this device. CSS draws
 * the rail from <html data-sidebar> before hydration; this gives components the same value.
 */
export function useSidebarCollapsed(): [boolean, (collapsed: boolean) => void] {
  const collapsed = useSyncExternalStore(
    subscribeToSidebar,
    isSidebarCollapsed,
    () => false,
  );
  return [collapsed, setSidebarCollapsed];
}
