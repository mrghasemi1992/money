"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import type { ReactElement, ReactNode } from "react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type PopoverProps = {
  /** The element that toggles the popover. */
  trigger: ReactElement;
  title?: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  /** start = the panel's start edge lines up with the trigger's (right in RTL). */
  align?: "start" | "end";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/** Non-modal panel anchored to a trigger, for short explanations or small filters. */
export function Popover({
  trigger,
  title,
  children,
  side = "bottom",
  align = "start",
  open,
  defaultOpen,
  onOpenChange,
  className,
}: PopoverProps) {
  return (
    <BasePopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      <BasePopover.Trigger render={trigger} />
      <BasePopover.Portal>
        <BasePopover.Positioner
          className={styles.positioner}
          side={side}
          align={align}
          sideOffset={8}
        >
          <BasePopover.Popup className={cx(styles.popup, className)}>
            {title ? (
              <BasePopover.Title className={styles.title}>
                {title}
              </BasePopover.Title>
            ) : null}
            <div className={styles.body}>{children}</div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
