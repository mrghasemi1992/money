"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Tooltip } from "@base-ui/react/tooltip";
import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/toast";

/** Hover delay shared by all tooltips, in ms. Moving between triggers shows the next one at once. */
const TOOLTIP_DELAY = 400;

/**
 * App-wide context for the design system: RTL keyboard and positioning behavior for Base UI,
 * one tooltip delay group, and the toast viewport. Wraps the app in the root layout and every
 * Storybook story.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <DirectionProvider direction="rtl">
      <Tooltip.Provider delay={TOOLTIP_DELAY}>
        <ToastProvider>{children}</ToastProvider>
      </Tooltip.Provider>
    </DirectionProvider>
  );
}
