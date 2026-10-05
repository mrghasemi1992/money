import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

/** Widths of the two text lines in each list row, so the rows don't look identical. */
const ROWS = [
  ["45%", "28%"],
  ["38%", "22%"],
  ["52%", "30%"],
  ["34%", "24%"],
  ["46%", "26%"],
] as const;

const CARDS = 3;

/**
 * A page loading in the app shell: a header, a row of summary cards and a list. Shown by
 * loading.tsx while a page's data loads.
 */
export function PageSkeleton({ className }: { className?: string }) {
  const t = useTranslations("page");
  return (
    <div className={cx(styles.root, className)} role="status" aria-busy="true">
      <span className="visually-hidden">{t("loading")}</span>
      <div className={styles.header}>
        <Skeleton width="168px" height="26px" />
        <Skeleton width="112px" height="14px" />
      </div>
      <div className={styles.cards}>
        {Array.from({ length: CARDS }, (_, index) => (
          <div key={index} className={styles.card}>
            <Skeleton width="40%" height="12px" />
            <Skeleton width="72%" height="24px" />
            <Skeleton width="52%" height="12px" />
          </div>
        ))}
      </div>
      <div className={styles.list}>
        {ROWS.map(([title, detail], index) => (
          <div key={index} className={styles.row}>
            <Skeleton variant="circle" width="var(--avatar-lg)" />
            <div className={styles.rowText}>
              <Skeleton width={title} height="14px" />
              <Skeleton width={detail} height="12px" />
            </div>
            <Skeleton width="88px" height="16px" />
          </div>
        ))}
      </div>
    </div>
  );
}
