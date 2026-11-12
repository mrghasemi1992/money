"use client";

import { useLocale, useTranslations } from "next-intl";
import type { CSSProperties } from "react";

import { ReportCard } from "@/components/report-card";
import { Amount } from "@/components/ui/amount";
import { DataTable } from "@/components/ui/data-table";
import { REPORT_SAVINGS_FLOOR } from "@/constants/report";
import { savingsRate } from "@/helpers/report";
import { usePreferences } from "@/hooks/use-preferences";
import type { CalendarSystem } from "@/types/calendar";
import type { ReportMonthTotals } from "@/types/report";
import { formatMonth } from "@/utils/calendar";
import { formatPercent } from "@/utils/number";
import { isolate } from "@/utils/text";

import styles from "./styles.module.css";

type SavingsReportProps = {
  /** The months, oldest first, each with its income and expense. */
  months: ReportMonthTotals[];
  /** The line under the title: the months shown. */
  subtitle: string;
  /** Overrides the viewer's calendar, for stories. */
  calendar?: CalendarSystem;
  className?: string;
};

/** A share of the chart's span, in percent: where a rate sits between `low` and `high`. */
function position(rate: number, low: number, high: number): number {
  return ((rate - low) / (high - low)) * 100;
}

/**
 * The savings rate of each month, (income − expense) ÷ income, as a bar from a zero line:
 * toward the end when the month saved (royal), toward the start when it spent more than it
 * earned (red, striped). A dashed line marks the rate of all the months together. Bars stop at
 * −100%; the rate is always written out. A month without income has no rate.
 */
export function SavingsReport({
  months,
  subtitle,
  calendar: calendarProp,
  className,
}: SavingsReportProps) {
  const t = useTranslations("reports");
  const locale = useLocale();
  const preferences = usePreferences();
  const calendar = calendarProp ?? preferences.calendar;

  const income = months.reduce((sum, month) => sum + month.income, 0);
  const expense = months.reduce((sum, month) => sum + month.expense, 0);
  const average = savingsRate(income, expense);
  const rows = months.map((month) => ({
    month,
    name: formatMonth(calendar, locale, month.year, month.month),
    rate: savingsRate(month.income, month.expense),
  }));

  const rates = rows.flatMap((row) => (row.rate === null ? [] : [row.rate]));
  if (average !== null) rates.push(average);
  const low = Math.min(0, Math.max(REPORT_SAVINGS_FLOOR, Math.min(...rates)));
  const high = Math.max(0, ...rates) || (low < 0 ? 0 : 100);
  const clamp = (rate: number) => Math.max(rate, low);
  const percent = (rate: number) => formatPercent(rate, locale);

  let summary: string | null = null;
  if (average !== null) {
    summary = t(average >= 0 ? "savings.saved" : "savings.overspent", {
      percent: percent(Math.abs(average)),
    });
    const best = rows.reduce<(typeof rows)[number] | null>(
      (top, row) =>
        row.rate !== null && (top?.rate == null || row.rate > top.rate)
          ? row
          : top,
      null,
    );
    if (best?.rate != null && best.rate > 0 && rates.length > 2) {
      summary += ` ${t("savings.best", {
        month: isolate(best.name),
        percent: percent(best.rate),
      })}`;
    }
  }

  const title = t("savings.title");
  const style = {
    "--savings-zero": `${position(0, low, high)}%`,
    "--savings-average": `${position(clamp(average ?? 0), low, high)}%`,
  } as CSSProperties;

  return (
    <ReportCard
      title={title}
      subtitle={subtitle}
      summary={summary}
      className={className}
      empty={average === null ? t("savings.none") : undefined}
      chart={
        <div className={styles.chart} style={style}>
          <ul className={styles.list} aria-label={title}>
            {rows.map(({ month, name, rate }) => {
              const from = rate === null ? 0 : Math.min(0, clamp(rate));
              const to = rate === null ? 0 : Math.max(0, rate);
              return (
                <li
                  key={`${month.year}-${month.month}`}
                  className={styles.row}
                  data-negative={rate !== null && rate < 0 ? "" : undefined}
                >
                  <span className={styles.month}>
                    {name}
                    {month.current ? (
                      <span className="visually-hidden">
                        {` ${t("savings.soFar")}`}
                      </span>
                    ) : null}
                  </span>
                  <span className={styles.track} aria-hidden="true">
                    {rate !== null ? (
                      <span
                        className={styles.fill}
                        style={{
                          insetInlineStart: `${position(from, low, high)}%`,
                          inlineSize: `${position(to, low, high) - position(from, low, high)}%`,
                        }}
                      />
                    ) : null}
                  </span>
                  <span className={styles.value}>
                    {rate === null ? (
                      <>
                        <span aria-hidden="true">—</span>
                        <span className="visually-hidden">
                          {t("savings.noIncome")}
                        </span>
                      </>
                    ) : (
                      percent(rate)
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          {average !== null ? (
            <p className={styles.legend}>
              <span className={styles.swatch} aria-hidden="true" />
              {t("savings.average", { percent: percent(average) })}
            </p>
          ) : null}
        </div>
      }
      table={
        <DataTable
          caption={title}
          columns={[
            { key: "month", label: t("monthly.month") },
            { key: "income", label: t("summary.income"), align: "end" },
            { key: "expense", label: t("summary.expense"), align: "end" },
            { key: "rate", label: t("savings.rate"), align: "end" },
          ]}
          rows={[
            ...rows
              .slice()
              .reverse()
              .map(({ month, name, rate }) => ({
                key: `${month.year}-${month.month}`,
                cells: [
                  month.current
                    ? t("monthly.soFarTable", { month: name })
                    : name,
                  <Amount
                    key="income"
                    value={month.income}
                    type="income"
                    size="sm"
                  />,
                  <Amount
                    key="expense"
                    value={month.expense}
                    type="expense"
                    size="sm"
                  />,
                  rate === null ? t("savings.noIncome") : percent(rate),
                ],
              })),
            {
              key: "all",
              cells: [
                t("savings.allMonths"),
                <Amount key="income" value={income} type="income" size="sm" />,
                <Amount
                  key="expense"
                  value={expense}
                  type="expense"
                  size="sm"
                />,
                average === null ? t("savings.noIncome") : percent(average),
              ],
            },
          ]}
        />
      }
    />
  );
}
