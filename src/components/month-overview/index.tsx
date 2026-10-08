"use client";

import { ArrowDownIcon, ArrowUpIcon, ScaleIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Amount } from "@/components/ui/amount";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePreferences } from "@/hooks/use-preferences";
import type { CalendarSystem } from "@/types/calendar";
import type { MoneyUnit } from "@/types/currency";
import type { ReportTotals } from "@/types/report";
import { cx } from "@/utils/cx";
import { formatMonth } from "@/utils/calendar";

import styles from "./styles.module.css";

type MonthOverviewProps = {
  /** Income and expense of the month so far. Transfers count in neither. */
  totals: ReportTotals;
  /** The viewer's current month, in their calendar. */
  year: number;
  month: number;
  /** Override the viewer's calendar and unit, for stories. */
  calendar?: CalendarSystem;
  unit?: MoneyUnit;
  className?: string;
};

/**
 * This month so far: income, expense and the net, each with its direction icon and signed
 * amount, so the three read apart without color.
 */
export function MonthOverview({
  totals,
  year,
  month,
  calendar: calendarProp,
  unit,
  className,
}: MonthOverviewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const preferences = usePreferences();
  const calendar = calendarProp ?? preferences.calendar;
  const net = totals.income - totals.expense;

  const rows = [
    {
      key: "income",
      label: t("transactionType.income"),
      icon: ArrowDownIcon,
      value: totals.income,
      type: "income" as const,
    },
    {
      key: "expense",
      label: t("transactionType.expense"),
      icon: ArrowUpIcon,
      value: totals.expense,
      type: "expense" as const,
    },
    {
      key: "net",
      label: t("dashboard.month.net"),
      icon: ScaleIcon,
      value: net,
      type: "neutral" as const,
    },
  ];

  return (
    <Card
      as="section"
      padding="none"
      title={t("dashboard.month.title")}
      subtitle={t("dashboard.month.subtitle", {
        month: formatMonth(calendar, locale, year, month),
      })}
      className={className}
    >
      <dl className={styles.list}>
        {rows.map((row) => (
          <div key={row.key} className={cx(styles.row, styles[row.key])}>
            <span className={styles.tile} aria-hidden="true">
              <row.icon className={styles.icon} />
            </span>
            <dt className={styles.label}>{row.label}</dt>
            <dd className={styles.value}>
              <Amount value={row.value} type={row.type} size="lg" unit={unit} />
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/** This month's card while its totals load. */
export function MonthOverviewSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <Skeleton width="30%" height="16px" />
      {[0, 1, 2].map((index) => (
        <div key={index} className={styles.skeletonRow}>
          <Skeleton width="var(--report-tile)" height="var(--report-tile)" />
          <Skeleton width="25%" height="14px" />
          <Skeleton width="35%" height="18px" />
        </div>
      ))}
    </div>
  );
}
