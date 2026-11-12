"use client";

import { ChartColumnIcon, TableIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useId, useState } from "react";

import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton, SkeletonWords } from "@/components/ui/skeleton";

import styles from "./styles.module.css";

type ReportView = "chart" | "table";

type ReportCardProps = {
  title: string;
  /** One quiet line under the title, such as the total. */
  subtitle?: ReactNode;
  /** Between the title and the switch, such as the chart's legend. */
  extra?: ReactNode;
  /** The finding in one sentence, above the chart or table (insights). */
  summary?: ReactNode;
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
  summary,
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
        {summary != null && empty == null ? (
          <p className={styles.summary}>{summary}</p>
        ) : null}
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

/**
 * A report card while the page loads: its real title and view switch (off), a placeholder
 * subtitle, and the chart's skeleton (BarListSkeleton, ColumnChartSkeleton).
 */
export function ReportCardSkeleton({
  title,
  extra,
  summary,
  chart,
  className,
}: {
  title: string;
  /** Between the title and the switch, as on the real card (the chart's legend). */
  extra?: ReactNode;
  /** A sentence like the real card's summary, laid out as hidden words so it wraps the same. */
  summary?: string;
  chart: ReactNode;
  className?: string;
}) {
  const t = useTranslations("chart");
  return (
    <Card className={className} aria-hidden="true">
      <div className={styles.root}>
        <div className={styles.head}>
          <div className={styles.titles}>
            <span className={styles.title}>{title}</span>
            <span className={styles.subtitle}>
              <Skeleton variant="text" width="128px" />
            </span>
          </div>
          {extra != null ? <div className={styles.extra}>{extra}</div> : null}
          <SegmentedControl
            size="sm"
            aria-label={t("view")}
            value="chart"
            disabled
            options={[
              { value: "chart", label: t("chart"), icon: ChartColumnIcon },
              { value: "table", label: t("table"), icon: TableIcon },
            ]}
          />
        </div>
        {summary != null ? (
          <p className={styles.summary}>
            <SkeletonWords>{summary}</SkeletonWords>
          </p>
        ) : null}
        {chart}
      </div>
    </Card>
  );
}
