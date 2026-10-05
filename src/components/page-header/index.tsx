import type { ReactNode } from "react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type PageHeaderProps = {
  /** The page's name, the same as its nav label: the page's only h1. */
  title: ReactNode;
  /** One quiet line: today's date, the month shown, or what the page is for. */
  subtitle?: ReactNode;
  /** Buttons at the end, such as AddTransactionButton. They wrap below the title on narrow screens. */
  actions?: ReactNode;
  className?: string;
};

/** The top of every page in the app shell: title, optional subtitle and actions. */
export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cx(styles.root, className)}>
      <div className={styles.titles}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle != null ? (
          <p className={styles.subtitle}>{subtitle}</p>
        ) : null}
      </div>
      {actions != null ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
