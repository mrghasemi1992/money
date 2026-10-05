"use client";

import { Drawer } from "@base-ui/react/drawer";
import { XIcon } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { useTranslations } from "next-intl";

import { IconButton } from "@/components/ui/icon-button";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type SheetProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Element that opens the sheet. Optional when `open` is controlled. */
  trigger?: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Actions; buttons stretch to equal widths. Wrap the cancel button in SheetClose. */
  footer?: ReactNode;
  /** Accessible name of the × button. Set to null to hide it. */
  closeLabel?: string | null;
  className?: string;
};

/** Bottom sheet: the phone counterpart of Dialog. Swipe down, Escape or the backdrop close it. */
export function Sheet({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  closeLabel,
  className,
}: SheetProps) {
  const t = useTranslations("common");
  return (
    <Drawer.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
      swipeDirection="down"
    >
      {trigger ? <Drawer.Trigger render={trigger} /> : null}
      <Drawer.Portal>
        <Drawer.Backdrop className={styles.backdrop} />
        <Drawer.Viewport className={styles.viewport}>
          <Drawer.Popup className={cx(styles.popup, className)}>
            <div className={styles.grab} aria-hidden="true" />
            <div className={styles.head}>
              <div className={styles.titles}>
                <Drawer.Title className={styles.title}>{title}</Drawer.Title>
                {description ? (
                  <Drawer.Description className={styles.description}>
                    {description}
                  </Drawer.Description>
                ) : null}
              </div>
              {closeLabel !== null ? (
                <Drawer.Close
                  render={
                    <IconButton
                      icon={XIcon}
                      label={closeLabel ?? t("close")}
                      size="sm"
                      tooltip={false}
                    />
                  }
                />
              ) : null}
            </div>
            <Drawer.Content className={styles.body}>{children}</Drawer.Content>
            {footer ? <div className={styles.foot}>{footer}</div> : null}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/** Closes the surrounding Sheet when its child is clicked. */
export function SheetClose({ children }: { children: ReactElement }) {
  return <Drawer.Close render={children} />;
}
