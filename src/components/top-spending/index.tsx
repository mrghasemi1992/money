"use client";

import { ChevronRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Amount } from "@/components/ui/amount";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CategoryChip,
  CategoryChipSkeleton,
} from "@/components/ui/category-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { DASHBOARD_SPENDING_SLICES } from "@/constants/dashboard";
import { categoryColorStyle, categoryIcon } from "@/helpers/category";
import { monthReportHref } from "@/helpers/dashboard";
import { usePreferences } from "@/hooks/use-preferences";
import type { CalendarSystem } from "@/types/calendar";
import type { MoneyUnit } from "@/types/currency";
import type { SpendingSlice } from "@/types/dashboard";
import { formatMonth } from "@/utils/calendar";
import { formatPercent } from "@/utils/number";

import styles from "./styles.module.css";

type TopSpendingProps = {
  /** The month's largest expense categories, the rest as «سایر» (spendingSlices). */
  slices: SpendingSlice[];
  /** The viewer's current month, in their calendar. */
  year: number;
  month: number;
  /** Override the viewer's calendar and unit, for stories. */
  calendar?: CalendarSystem;
  unit?: MoneyUnit;
  className?: string;
};

/**
 * Where this month's money went: one bar split by category in their hues, then each category
 * with its amount and share, and the month's total. The shares are written out, so the bar
 * is never the only reading. Links to the month's report.
 */
export function TopSpending({
  slices,
  year,
  month,
  calendar: calendarProp,
  unit,
  className,
}: TopSpendingProps) {
  const t = useTranslations();
  const locale = useLocale();
  const preferences = usePreferences();
  const calendar = calendarProp ?? preferences.calendar;
  const monthLabel = formatMonth(calendar, locale, year, month);
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0);

  const name = (slice: SpendingSlice) =>
    slice.kind === "other"
      ? t("dashboard.spending.other")
      : slice.kind === "uncategorized"
        ? t("reports.categories.uncategorized")
        : slice.name;
  const share = (slice: SpendingSlice) =>
    formatPercent(total > 0 ? (slice.amount / total) * 100 : 0, locale);

  return (
    <Card
      as="section"
      padding="none"
      title={t("dashboard.spending.title")}
      subtitle={monthLabel}
      actions={
        <Button
          href={monthReportHref(calendar, year, month)}
          variant="ghost"
          size="sm"
          iconEnd={ChevronRightIcon}
          mirrorIcons
          aria-label={t("dashboard.spending.reportLabel", {
            month: monthLabel,
          })}
        >
          {t("dashboard.spending.report")}
        </Button>
      }
      className={className}
    >
      {total > 0 ? (
        <div className={styles.body}>
          <div
            className={styles.bar}
            role="img"
            aria-label={t("dashboard.spending.chart", { month: monthLabel })}
          >
            {slices.map((slice) => (
              <span
                key={`${slice.kind}-${slice.id}`}
                className={styles.slice}
                style={{
                  ...categoryColorStyle(slice.color),
                  flexGrow: slice.amount,
                }}
              />
            ))}
          </div>
          <ul className={styles.list}>
            {slices.map((slice) => (
              <li key={`${slice.kind}-${slice.id}`} className={styles.item}>
                <span className={styles.name}>
                  {slice.kind === "uncategorized" ? (
                    <span className={styles.uncategorized}>{name(slice)}</span>
                  ) : (
                    <CategoryChip
                      size="sm"
                      name={name(slice)}
                      color={slice.color}
                      icon={slice.icon ? categoryIcon(slice.icon) : undefined}
                      className={styles.chip}
                    />
                  )}
                </span>
                <Amount
                  value={slice.amount}
                  size="sm"
                  showUnit={false}
                  unit={unit}
                  className={styles.amount}
                />
                <span className={styles.share}>{share(slice)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.total}>
            <span>{t("dashboard.spending.total")}</span>
            <Amount
              value={total}
              type="expense"
              size="sm"
              unit={unit}
              className={styles.amount}
            />
          </div>
        </div>
      ) : (
        <p className={styles.empty}>{t("dashboard.spending.empty")}</p>
      )}
    </Card>
  );
}

/** Widths of the category names, so the rows don't look identical. */
const SKELETON_NAMES = ["72px", "96px", "64px", "84px", "56px"];

/**
 * The top spending card while it loads: the real card, an empty bar, one placeholder row per
 * slice it shows (DASHBOARD_SPENDING_SLICES, the last one «سایر», with a dot) and the total.
 */
export function TopSpendingSkeleton() {
  const t = useTranslations();
  return (
    <Card
      padding="none"
      title={t("dashboard.spending.title")}
      subtitle={<Skeleton variant="text" width="72px" />}
      actions={
        <Button
          variant="ghost"
          size="sm"
          iconEnd={ChevronRightIcon}
          mirrorIcons
        >
          {t("dashboard.spending.report")}
        </Button>
      }
      inert
    >
      <div className={styles.body}>
        <Skeleton
          height="var(--dashboard-spending-h)"
          radius="var(--radius-pill)"
        />
        <div className={styles.list}>
          {SKELETON_NAMES.slice(0, DASHBOARD_SPENDING_SLICES).map(
            (width, index) => (
              <div key={width} className={styles.item}>
                <span className={styles.name}>
                  <CategoryChipSkeleton
                    size="sm"
                    width={width}
                    icon={index < DASHBOARD_SPENDING_SLICES - 1}
                  />
                </span>
                <span className={styles.skeletonAmount}>
                  <Skeleton variant="text" width="72px" />
                </span>
                <span className={styles.share}>
                  <Skeleton variant="text" />
                </span>
              </div>
            ),
          )}
        </div>
        <div className={styles.total}>
          <span>{t("dashboard.spending.total")}</span>
          <span className={styles.skeletonAmount}>
            <Skeleton variant="text" width="88px" />
          </span>
        </div>
      </div>
    </Card>
  );
}
