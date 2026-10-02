import { InboxIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type EmptyStateProps = {
  icon?: LucideIcon;
  /** One line of fact: «هنوز تراکنشی ثبت نکرده‌اید». */
  title: ReactNode;
  /** One line of invitation: «اولین هزینه یا درآمدتان را ثبت کنید.». */
  description?: ReactNode;
  /** One button. */
  action?: ReactNode;
  size?: "sm" | "md";
  className?: string;
};

/** What to show when a list is empty: a fact, an invitation and one button. */
export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  size = "md",
  className,
}: EmptyStateProps) {
  return (
    <div className={cx(styles.root, size === "sm" && styles.sm, className)}>
      <span className={styles.icon}>
        <Icon className={styles.iconGlyph} aria-hidden="true" />
      </span>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
