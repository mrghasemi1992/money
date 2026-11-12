"use client";

import { InfoIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { ReportCard } from "@/components/report-card";
import { Amount } from "@/components/ui/amount";
import { CategoryChip } from "@/components/ui/category-chip";
import { DataTable } from "@/components/ui/data-table";
import { type BudgetStatus, budgetRatio } from "@/helpers/budget";
import { categoryIcon } from "@/helpers/category";
import { budgetMonthStatuses, monthsWithinBudget } from "@/helpers/report";
import { usePreferences } from "@/hooks/use-preferences";
import type { CalendarSystem } from "@/types/calendar";
import type { BudgetRecordRow, ReportMonth } from "@/types/report";
import { formatMonth, monthName } from "@/utils/calendar";
import { formatNumber, formatPercent } from "@/utils/number";
import { isolate } from "@/utils/text";

import styles from "./styles.module.css";

type BudgetRecordReportProps = {
  /** Budgeted categories with what they spent in each month, oldest category first. */
  rows: BudgetRecordRow[];
  /** The months, oldest first. */
  months: ReportMonth[];
  /** The line under the title: the months shown. */
  subtitle: string;
  /** Overrides the viewer's calendar, for stories. */
  calendar?: CalendarSystem;
  className?: string;
};

const STATUSES: BudgetStatus[] = ["ok", "near", "over"];

/**
 * How often each budgeted category stayed within its monthly limit over the months shown: its
 * chip, «۴ از ۶ ماه در سقف», and a strip with a cell per month in the budget colors (within,
 * near the limit with a dot, over striped). Budgets keep no history, so every month is held
 * to today's limit. The table gives each month's spending as a share of the limit.
 */
export function BudgetRecordReport({
  rows,
  months,
  subtitle,
  calendar: calendarProp,
  className,
}: BudgetRecordReportProps) {
  const t = useTranslations("reports");
  const locale = useLocale();
  const preferences = usePreferences();
  const calendar = calendarProp ?? preferences.calendar;
  const total = formatNumber(months.length, locale);

  const items = rows.map((row) => {
    const statuses = budgetMonthStatuses(row);
    const within = monthsWithinBudget(row);
    return {
      row,
      statuses,
      within,
      over: months.length - within,
      withinText: t("budgetRecord.within", {
        count: formatNumber(within, locale),
        total,
      }),
    };
  });

  const worst = items.reduce<(typeof items)[number] | null>(
    (top, item) => (item.over > (top?.over ?? 0) ? item : top),
    null,
  );
  const summary =
    items.length === 0
      ? null
      : worst
        ? t("budgetRecord.summary", {
            name: isolate(worst.row.name),
            count: formatNumber(worst.over, locale),
            total,
          })
        : t("budgetRecord.allWithin");
  const title = t("budgetRecord.title");
  const monthLabel = (month: ReportMonth) =>
    formatMonth(calendar, locale, month.year, month.month);

  return (
    <ReportCard
      title={title}
      subtitle={subtitle}
      summary={summary}
      className={className}
      empty={items.length === 0 ? t("budgetRecord.none") : undefined}
      chart={
        <div className={styles.chart}>
          <ul className={styles.list} aria-label={title}>
            {items.map(({ row, statuses, withinText }) => (
              <li key={row.id} className={styles.row}>
                <span className={styles.line}>
                  <span className={styles.name}>
                    <CategoryChip
                      name={row.name}
                      color={row.color}
                      icon={categoryIcon(row.icon)}
                    />
                  </span>
                  <span className={styles.within}>{withinText}</span>
                </span>
                <span className={styles.strip} aria-hidden="true">
                  {statuses.map((status, index) => (
                    <span
                      key={`${months[index].year}-${months[index].month}`}
                      className={styles.cell}
                      data-status={status}
                      title={`${monthLabel(months[index])}: ${formatPercent(
                        budgetRatio(row.spent[index], row.budget) * 100,
                        locale,
                      )}`}
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <ul className={styles.legend} aria-hidden="true">
            {STATUSES.map((status) => (
              <li key={status} className={styles.legendItem}>
                <span className={styles.cell} data-status={status} />
                {t(`budgetRecord.status.${status}`)}
              </li>
            ))}
          </ul>
          <p className={styles.hint}>
            <InfoIcon className={styles.hintIcon} aria-hidden="true" />
            {t("budgetRecord.hint")}
          </p>
        </div>
      }
      table={
        <DataTable
          caption={title}
          columns={[
            { key: "category", label: t("categories.category") },
            { key: "budget", label: t("budgetRecord.limit"), align: "end" },
            { key: "within", label: t("budgetRecord.inLimit"), align: "end" },
            ...months.map((month) => ({
              key: `${month.year}-${month.month}`,
              label:
                months.length > 1 && month.year !== months[0].year
                  ? monthLabel(month)
                  : monthName(calendar, locale, month.month),
              align: "end" as const,
            })),
          ]}
          rows={items.map(({ row, withinText }) => ({
            key: row.id,
            cells: [
              row.name,
              <Amount key="budget" value={row.budget} size="sm" />,
              withinText,
              ...row.spent.map((spent) =>
                formatPercent(budgetRatio(spent, row.budget) * 100, locale),
              ),
            ],
          }))}
        />
      }
    />
  );
}
