import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
}

// Sidebar collapsed state is UI-only and not derivable from Dexie, so it
// lives in Zustand. Persisted so the user's chosen layout survives reloads.
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: 'settle-ui' },
  ),
);
