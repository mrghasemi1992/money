"use client";

import { useLocale, useTranslations } from "next-intl";

import { Amount } from "@/components/ui/amount";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { budgetRatio } from "@/helpers/budget";
import { usePreferences } from "@/hooks/use-preferences";
import type { BudgetMonth } from "@/types/budget";
import type { CalendarSystem } from "@/types/calendar";
import { cx } from "@/utils/cx";
import { monthName } from "@/utils/calendar";
import { formatPercent } from "@/utils/number";

import styles from "./styles.module.css";

type BudgetSummaryProps = {
  /** Spent in the month across the budgeted categories, in the smallest unit. */
  spent: number;
  /** The budgets added up. */
  budget: number;
  month: BudgetMonth;
  /** Overrides the viewer's calendar, for stories. */
  calendar?: CalendarSystem;
  className?: string;
};

/**
 * The month at a glance: what the budgeted categories spent, the total budget, what remains
 * (or how far over it is), and one bar for all of it. In the current month a line on the bar
 * shows how far into the month today is, so spending can be read against time.
 */
export function BudgetSummary({
  spent,
  budget,
  month,
  calendar: calendarProp,
  className,
}: BudgetSummaryProps) {
  const t = useTranslations("budgets.summary");
  const locale = useLocale();
  const preferences = usePreferences();
  const calendar = calendarProp ?? preferences.calendar;
  const over = spent > budget;
  const percent = formatPercent(budgetRatio(spent, budget) * 100, locale);
  const pace = month.day / month.days;

  return (
    <Card padding="lg" className={className}>
      <div className={styles.root}>
        <div className={styles.top}>
          <div className={styles.hero}>
            <span className={styles.label}>
              {t("spentIn", {
                month: monthName(calendar, locale, month.month),
              })}
            </span>
            <Amount value={spent} size="hero" />
          </div>
          <dl className={styles.cells}>
            <div className={styles.cell}>
              <dt className={styles.cellLabel}>{t("total")}</dt>
              <dd className={styles.cellValue}>
                <Amount value={budget} size="lg" />
              </dd>
            </div>
            <div className={cx(styles.cell, over && styles.over)}>
              <dt className={styles.cellLabel}>
                {t(over ? "over" : "remaining")}
              </dt>
              <dd className={styles.cellValue}>
                <Amount
                  value={Math.abs(budget - spent)}
                  size="lg"
                  className={styles.remaining}
                />
              </dd>
            </div>
          </dl>
        </div>
        <ProgressBar
          value={spent}
          max={budget}
          size="lg"
          caption={t("used", { percent })}
          aria-label={t("total")}
          marker={month.phase === "current" ? pace : undefined}
          markerLabel={
            month.phase === "current"
              ? t("pace", { percent: formatPercent(pace * 100, locale) })
              : undefined
          }
        />
      </div>
    </Card>
  );
}

/** The summary while the page loads. */
export function BudgetSummarySkeleton() {
  return (
    <Card padding="lg">
      <div className={styles.root}>
        <div className={styles.top}>
          <div className={styles.hero}>
            <Skeleton width="110px" height="14px" />
            <Skeleton width="240px" height="32px" />
          </div>
          <div className={styles.cells}>
            {[0, 1].map((index) => (
              <div key={index} className={styles.cell}>
                <Skeleton width="70px" height="12px" />
                <Skeleton width="130px" height="20px" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton width="100%" height="12px" />
      </div>
    </Card>
  );
}
