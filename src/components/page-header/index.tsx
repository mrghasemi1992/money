import { ArrowLeftIcon } from "lucide-react";
import type { Route } from "next";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type PageHeaderProps = {
  /** The page's name, the same as its nav label: the page's only h1. */
  title: ReactNode;
  /** One quiet line: today's date, the month shown, or what the page is for. */
  subtitle?: ReactNode;
  /** Buttons at the end, such as AddTransactionButton. They wrap below the title on narrow screens. */
  actions?: ReactNode;
  /**
   * A link back to the parent section, on subpages (/settings/connector). Shown from 768px up:
   * on phones the top bar has the back button.
   */
  back?: { href: Route; label: ReactNode };
  className?: string;
};

/** The top of every page in the app shell: title, optional subtitle and actions. */
export function PageHeader({
  title,
  subtitle,
  actions,
  back,
  className,
}: PageHeaderProps) {
  return (
    <header className={cx(styles.root, className)}>
      {back ? (
        <div className={styles.back}>
          <Button
            href={back.href}
            variant="ghost"
            size="sm"
            iconStart={ArrowLeftIcon}
            mirrorIcons
          >
            {back.label}
          </Button>
        </div>
      ) : null}
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
