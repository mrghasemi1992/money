"use client";

import { InfoIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { ReportCard } from "@/components/report-card";
import { TransactionTile } from "@/components/transaction-tile";
import { TransactionTitle } from "@/components/transaction-title";
import { Amount } from "@/components/ui/amount";
import { DataTable } from "@/components/ui/data-table";
import { Link } from "@/components/ui/link";
import { formatCompactMoney, formatMoney } from "@/helpers/money";
import { recurringTransactionsHref } from "@/helpers/report";
import { usePreferences } from "@/hooks/use-preferences";
import type { RecurringExpense, ReportMonth } from "@/types/report";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type RecurringReportProps = {
  /** Expense descriptions in most of the months, the most months first. */
  items: RecurringExpense[];
  /** The months they were counted over, oldest first. */
  months: ReportMonth[];
  /** The line under the title: the months shown. */
  subtitle: string;
  className?: string;
};

/**
 * Expenses that come back in most months: the same description (folded, so spelling and
 * spaces don't split it) in more than half of the months shown. Each row has its category's
 * tile and name, in how many months it appeared (also as a strip of months), and what it
 * costs in a month it appears; it opens the transactions page searching for it.
 */
export function RecurringReport({
  items,
  months,
  subtitle,
  className,
}: RecurringReportProps) {
  const t = useTranslations("reports");
  const locale = useLocale();
  const { moneyUnit } = usePreferences();
  const money = (value: number) => formatMoney(value, moneyUnit, locale);
  const range =
    months.length > 0
      ? { from: months[0].from, to: months[months.length - 1].to }
      : null;

  const rows = items.map((item) => ({
    item,
    monthly: Math.round(item.amount / Math.max(1, item.months.length)),
    monthsText: t("recurring.months", {
      count: formatNumber(item.months.length, locale),
      total: formatNumber(months.length, locale),
    }),
    href: range ? recurringTransactionsHref(item, range) : "/transactions",
  }));
  const together = rows.reduce((sum, row) => sum + row.monthly, 0);
  const title = t("recurring.title");

  return (
    <ReportCard
      title={title}
      subtitle={subtitle}
      summary={
        rows.length > 0
          ? t("recurring.summary", {
              count: formatNumber(rows.length, locale),
              countNumber: rows.length,
              // «About» a sum of averages: rounded, «۲۳٫۸ میلیون ریال».
              amount: formatCompactMoney(together, moneyUnit, locale),
            })
          : null
      }
      className={className}
      empty={
        rows.length > 0
          ? undefined
          : t(months.length < 2 ? "recurring.short" : "recurring.none")
      }
      chart={
        <div className={styles.chart}>
          <ul className={styles.list} aria-label={title}>
            {rows.map(({ item, monthly, monthsText, href }) => {
              const present = new Set(item.months);
              return (
                <li key={item.key}>
                  <Link href={href} className={styles.row}>
                    <TransactionTile
                      transaction={{ type: "expense", category: item.category }}
                    />
                    <span className={styles.body}>
                      <span className={styles.line}>
                        <span className={styles.description}>
                          {item.description}
                        </span>
                        <span className={styles.monthly}>
                          {t("recurring.perMonth", { amount: money(monthly) })}
                        </span>
                      </span>
                      <span className={styles.meta}>
                        <TransactionTitle
                          type="expense"
                          category={item.category}
                          className={styles.category}
                        />
                        <span className={styles.count}>{monthsText}</span>
                      </span>
                      <span className={styles.strip} aria-hidden="true">
                        {months.map((month, index) => (
                          <span
                            key={`${month.year}-${month.month}`}
                            className={styles.cell}
                            data-present={present.has(index) ? "" : undefined}
                          />
                        ))}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className={styles.hint}>
            <InfoIcon className={styles.hintIcon} aria-hidden="true" />
            {t("recurring.hint")}
          </p>
        </div>
      }
      table={
        <DataTable
          caption={title}
          columns={[
            { key: "description", label: t("recurring.description") },
            { key: "category", label: t("categories.category") },
            { key: "months", label: t("recurring.inMonths"), align: "end" },
            { key: "total", label: t("table.amount"), align: "end" },
            { key: "monthly", label: t("recurring.monthly"), align: "end" },
          ]}
          rows={rows.map(({ item, monthly, monthsText }) => ({
            key: item.key,
            cells: [
              item.description,
              item.category ? (
                <TransactionTitle
                  key="category"
                  type="expense"
                  category={item.category}
                />
              ) : (
                t("categories.uncategorized")
              ),
              monthsText,
              <Amount key="total" value={item.amount} size="sm" />,
              <Amount key="monthly" value={monthly} size="sm" />,
            ],
          }))}
        />
      }
    />
  );
}
