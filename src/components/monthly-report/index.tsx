"use client";

import { useLocale, useTranslations } from "next-intl";

import { ReportCard } from "@/components/report-card";
import { Amount } from "@/components/ui/amount";
import {
  type ColumnChartPoint,
  ColumnChart,
  ColumnChartLegend,
} from "@/components/ui/column-chart";
import { DataTable } from "@/components/ui/data-table";
import { usePreferences } from "@/hooks/use-preferences";
import type { CalendarSystem } from "@/types/calendar";
import type { ReportMonthTotals } from "@/types/report";
import { formatMonth, monthName } from "@/utils/calendar";

type MonthlyReportProps = {
  /** The months, oldest first, each with its income and expense. */
  months: ReportMonthTotals[];
  /** The month picked on the page, highlighted in the chart. */
  selected?: { year: number; month: number } | null;
  /** The line under the title: the period, or «شش ماه منتهی به …». */
  subtitle: string;
  /** Overrides the viewer's calendar, for stories. */
  calendar?: CalendarSystem;
  className?: string;
};

function monthKey({ year, month }: { year: number; month: number }): string {
  return `${year}-${month}`;
}

/**
 * Income and expense per month of the viewer's calendar as columns, with the net as a line;
 * the table lists the same months, newest first. A month still running is marked «تا امروز»
 * (so far).
 */
export function MonthlyReport({
  months,
  selected,
  subtitle,
  calendar: calendarProp,
  className,
}: MonthlyReportProps) {
  const t = useTranslations("reports");
  const locale = useLocale();
  const preferences = usePreferences();
  const calendar = calendarProp ?? preferences.calendar;

  const labeled = months.map((item) => {
    const name = formatMonth(calendar, locale, item.year, item.month);
    return {
      item,
      name,
      label: item.current ? t("monthly.soFar", { month: name }) : name,
    };
  });

  const points: ColumnChartPoint[] = labeled.map(({ item, label }) => {
    const short = monthName(calendar, locale, item.month);
    return {
      key: monthKey(item),
      label,
      // English month names have common three-letter forms; Persian ones are short enough.
      shortLabel: locale === "en" ? short.slice(0, 3) : short,
      income: item.income,
      expense: item.expense,
    };
  });

  const title = t("monthly.title");

  return (
    <ReportCard
      title={title}
      subtitle={subtitle}
      extra={<ColumnChartLegend />}
      className={className}
      chart={
        <ColumnChart
          // A new period starts the readout at its own month.
          key={points.map((point) => point.key).join()}
          points={points}
          selectedKey={selected ? monthKey(selected) : undefined}
          aria-label={t("monthly.summary")}
        />
      }
      table={
        <DataTable
          caption={title}
          columns={[
            { key: "month", label: t("monthly.month") },
            { key: "income", label: t("summary.income"), align: "end" },
            { key: "expense", label: t("summary.expense"), align: "end" },
            { key: "net", label: t("summary.net"), align: "end" },
          ]}
          rows={labeled
            .slice()
            .reverse()
            .map(({ item, name }) => ({
              key: monthKey(item),
              cells: [
                item.current ? t("monthly.soFarTable", { month: name }) : name,
                <Amount
                  key="income"
                  value={item.income}
                  type="income"
                  size="sm"
                />,
                <Amount
                  key="expense"
                  value={item.expense}
                  type="expense"
                  size="sm"
                />,
                <Amount
                  key="net"
                  value={item.income - item.expense}
                  size="sm"
                />,
              ],
            }))}
        />
      }
    />
  );
}
