"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import { Toast } from "@base-ui/react/toast";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

export type ToastTone = "neutral" | "info" | "success" | "warning" | "danger";

export type ToastOptions = {
  /** Past tense: «تراکنش ثبت شد». */
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** One action, usually «واگرد» (undo) after an add or delete. A toast with an action stays a bit longer. */
  action?: { label: string; onClick: () => void };
  /** Auto-dismiss after this many ms; 0 keeps it open. */
  timeout?: number;
};

const TONE_ICONS: Record<ToastTone, LucideIcon> = {
  neutral: InfoIcon,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: CircleAlertIcon,
};

/** Auto-dismiss delays in ms. Hovering or focusing the stack pauses them. */
const DEFAULT_TIMEOUT = 4000;
/** An undo needs time to be noticed and read. */
const ACTION_TIMEOUT = 8000;
/** Errors are read more slowly than confirmations. */
const DANGER_TIMEOUT = 6000;
const MAX_VISIBLE = 3;

/** Shows toasts. Put it once around the app (Providers does). */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider limit={MAX_VISIBLE} timeout={DEFAULT_TIMEOUT}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className={styles.viewport}>
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function isTone(value: string | undefined): value is ToastTone {
  return value !== undefined && value in TONE_ICONS;
}

function ToastList() {
  const t = useTranslations("common");
  const { toasts } = Toast.useToastManager();
  const direction = useDirection();
  // Swipe toward the corner's own edge (the start side), or down, to dismiss.
  const swipeDirection =
    direction === "rtl"
      ? (["down", "right"] as const)
      : (["down", "left"] as const);
  return toasts.map((toast) => {
    const tone = isTone(toast.type) ? toast.type : "neutral";
    const Icon = TONE_ICONS[tone];
    return (
      <Toast.Root
        key={toast.id}
        toast={toast}
        swipeDirection={[...swipeDirection]}
        className={cx(styles.toast, styles[tone])}
      >
        <Toast.Content className={styles.content}>
          <span className={styles.icon}>
            <Icon className={styles.iconGlyph} aria-hidden="true" />
          </span>
          <div className={styles.body}>
            <Toast.Title className={styles.title} />
            <Toast.Description className={styles.description} />
          </div>
          {toast.actionProps ? (
            <Toast.Action className={styles.action} />
          ) : null}
          <Toast.Close className={styles.close} aria-label={t("close")}>
            <XIcon className={styles.closeIcon} aria-hidden="true" />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    );
  });
}

/** Shows a toast: `const toast = useToast(); toast.show({ title: "تراکنش ثبت شد", tone: "success" })`. */
export function useToast() {
  const manager = Toast.useToastManager();
  return {
    show({
      title,
      description,
      tone = "neutral",
      action,
      timeout,
    }: ToastOptions) {
      return manager.add({
        title,
        description,
        type: tone,
        timeout:
          timeout ??
          (action
            ? ACTION_TIMEOUT
            : tone === "danger"
              ? DANGER_TIMEOUT
              : undefined),
        priority: tone === "danger" ? "high" : "low",
        actionProps: action
          ? { children: action.label, onClick: action.onClick }
          : undefined,
      });
    },
    close(id: string) {
      manager.close(id);
    },
  };
}
