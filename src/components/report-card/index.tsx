"use client";

import { ChartColumnIcon, TableIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useId, useState } from "react";

import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type ReportView = "chart" | "table";

type ReportCardProps = {
  title: string;
  /** One quiet line under the title, such as the total. */
  subtitle?: ReactNode;
  /** Between the title and the switch, such as the chart's legend. */
  extra?: ReactNode;
  chart: ReactNode;
  /** The same figures as a table: the chart's accessible form. */
  table: ReactNode;
  /** Shown instead of the chart and table (and their switch) when there is nothing to show. */
  empty?: ReactNode;
  /** Opens on the table, for stories. */
  defaultView?: ReportView;
  className?: string;
};

/**
 * A section of the reports page: its title and a «نمودار / جدول» (Chart / Table) switch, then
 * the chart or the same figures as a table.
 */
export function ReportCard({
  title,
  subtitle,
  extra,
  chart,
  table,
  empty,
  defaultView = "chart",
  className,
}: ReportCardProps) {
  const t = useTranslations("chart");
  const titleId = useId();
  const [view, setView] = useState<ReportView>(defaultView);

  return (
    <Card as="section" aria-labelledby={titleId} className={className}>
      <div className={styles.root}>
        <div className={styles.head}>
          <div className={styles.titles}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {subtitle != null ? (
              <p className={styles.subtitle}>{subtitle}</p>
            ) : null}
          </div>
          {extra != null && empty == null ? (
            <div className={styles.extra}>{extra}</div>
          ) : null}
          {empty != null ? null : (
            <SegmentedControl
              size="sm"
              aria-label={t("view")}
              value={view}
              onValueChange={(value) => setView(value as ReportView)}
              options={[
                { value: "chart", label: t("chart"), icon: ChartColumnIcon },
                { value: "table", label: t("table"), icon: TableIcon },
              ]}
            />
          )}
        </div>
        {empty != null ? (
          <p className={styles.empty}>{empty}</p>
        ) : view === "chart" ? (
          chart
        ) : (
          table
        )}
      </div>
    </Card>
  );
}

/** A report card while the page loads: a title and a few ranked rows, or one block. */
export function ReportCardSkeleton({
  rows = 5,
  block = false,
  className,
}: {
  rows?: number;
  /** One tall block instead of rows, for the month-by-month chart. */
  block?: boolean;
  className?: string;
}) {
  const widths = ["92%", "64%", "48%", "30%", "18%"];
  return (
    <Card className={className}>
      <div className={cx(styles.root, styles.skeleton)}>
        <Skeleton variant="text" width="40%" />
        {block ? (
          <Skeleton width="100%" height="var(--chart-h)" />
        ) : (
          Array.from({ length: rows }, (_, index) => (
            <div key={index} className={styles.skeletonRow}>
              <div className={styles.skeletonLine}>
                <Skeleton
                  variant="text"
                  width={`${22 + ((index * 7) % 14)}%`}
                />
                <Skeleton variant="text" width="25%" />
              </div>
              <Skeleton
                width={widths[index % widths.length]}
                height="var(--bar-list-h)"
              />
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
