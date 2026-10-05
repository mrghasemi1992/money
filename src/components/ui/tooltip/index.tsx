"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";

import styles from "./styles.module.css";

/** Distance between trigger and tooltip in px, from the design. */
const SIDE_OFFSET = 6;

type TooltipSide = "top" | "bottom" | "inline-start" | "inline-end";

type TooltipProps = {
  /** One short line. For an icon button it matches the aria-label. */
  content: ReactNode;
  /** The trigger: a single element that accepts a ref and props (a button or link). */
  children: ReactElement;
  /** Logical side: inline-start is on the right in RTL. */
  side?: TooltipSide;
  /** Force the open state, for example in stories. */
  open?: boolean;
  /** Hover delay in ms. Defaults to the shared delay from Providers. */
  delay?: number;
  /** Turns the tooltip off while the label is visible anyway (an expanded sidebar). */
  disabled?: boolean;
};

/** Label on hover and keyboard focus. Closes with Escape. Never for information the user needs. */
export function Tooltip({
  content,
  children,
  side = "top",
  open,
  delay,
  disabled,
}: TooltipProps) {
  return (
    <BaseTooltip.Root open={open} disabled={disabled}>
      <BaseTooltip.Trigger delay={delay} render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner
          side={side}
          sideOffset={SIDE_OFFSET}
          className={styles.positioner}
        >
          <BaseTooltip.Popup className={styles.popup}>
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
