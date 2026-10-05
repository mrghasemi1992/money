"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { XIcon, type LucideIcon } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { useTranslations } from "next-intl";

import { IconButton } from "@/components/ui/icon-button";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Element that opens the dialog, such as a Button. Optional when `open` is controlled. */
  trigger?: ReactElement;
  /** Destructive confirmations name the object: «حذف تراکنش؟». */
  title: ReactNode;
  description?: ReactNode;
  /** Icon in a tinted tile before the title. */
  icon?: LucideIcon;
  tone?: "brand" | "danger" | "success" | "warning";
  children?: ReactNode;
  /** Actions, end-aligned. Wrap the cancel button in DialogClose. */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Accessible name of the × button. Set to null to hide it. */
  closeLabel?: string | null;
  className?: string;
};

/** Centered modal. On phones prefer Sheet. Escape and a click on the backdrop close it. */
export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  icon: Icon,
  tone = "brand",
  children,
  footer,
  size = "md",
  closeLabel,
  className,
}: DialogProps) {
  const t = useTranslations("common");
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      {trigger ? <BaseDialog.Trigger render={trigger} /> : null}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={styles.backdrop} />
        <BaseDialog.Viewport className={styles.viewport}>
          <BaseDialog.Popup
            className={cx(styles.popup, styles[size], className)}
          >
            <div className={styles.head}>
              {Icon ? (
                <span className={cx(styles.icon, styles[tone])}>
                  <Icon className={styles.iconGlyph} aria-hidden="true" />
                </span>
              ) : null}
              <div className={styles.titles}>
                <BaseDialog.Title className={styles.title}>
                  {title}
                </BaseDialog.Title>
                {description ? (
                  <BaseDialog.Description className={styles.description}>
                    {description}
                  </BaseDialog.Description>
                ) : null}
              </div>
              {closeLabel !== null ? (
                <BaseDialog.Close
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
            {children ? <div className={styles.body}>{children}</div> : null}
            {footer ? <div className={styles.foot}>{footer}</div> : null}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/** Closes the surrounding Dialog when its child is clicked: `<DialogClose><Button>انصراف</Button></DialogClose>`. */
export function DialogClose({ children }: { children: ReactElement }) {
  return <BaseDialog.Close render={children} />;
}
