"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId } from "react";

import { ReportCard } from "@/components/report-card";
import { TransactionTile } from "@/components/transaction-tile";
import { TransactionTitle } from "@/components/transaction-title";
import { Amount } from "@/components/ui/amount";
import { DataTable } from "@/components/ui/data-table";
import { DateText } from "@/components/ui/date-text";
import { Link } from "@/components/ui/link";
import { formatMoney } from "@/helpers/money";
import { largeTransactionHref } from "@/helpers/report";
import { usePreferences } from "@/hooks/use-preferences";
import type { LargeTransaction } from "@/types/report";
import { formatDate } from "@/utils/calendar";
import { isolate } from "@/utils/text";

import styles from "./styles.module.css";

type LargestReportProps = {
  /** The largest expenses and incomes of the period, largest first within each type. */
  transactions: LargeTransaction[];
  /** The line under the title: the period. */
  subtitle: string;
  className?: string;
};

const TYPES = ["expense", "income"] as const;

/**
 * The largest expenses and incomes of the period, each list largest first: the category's
 * tile and name, the description, account and day, the amount, and a bar as long as its part
 * of the largest of its type. A row opens the transactions page on that day, type and category.
 */
export function LargestReport({
  transactions,
  subtitle,
  className,
}: LargestReportProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { calendar, moneyUnit } = usePreferences();
  const baseId = useId();

  const groups = TYPES.map((type) => ({
    type,
    rows: transactions.filter((item) => item.type === type),
  }));

  /** What a transaction was for, in words: its description, else its category. */
  const what = (item: LargeTransaction) =>
    item.description ||
    (item.category
      ? item.category.parentName
        ? `${item.category.parentName} / ${item.category.name}`
        : item.category.name
      : t("transactions.unknownTag"));

  const lead = groups.find((group) => group.rows.length > 0)?.rows[0];
  const summary = lead
    ? t(
        lead.type === "expense"
          ? "reports.largest.expenseSummary"
          : "reports.largest.incomeSummary",
        {
          amount: formatMoney(lead.amount, moneyUnit, locale),
          name: isolate(what(lead)),
          date: formatDate(lead.date, { locale, calendar }),
        },
      )
    : null;
  const title = t("reports.largest.title");

  return (
    <ReportCard
      title={title}
      subtitle={subtitle}
      summary={summary}
      className={className}
      empty={transactions.length === 0 ? t("reports.largest.none") : undefined}
      chart={
        <div className={styles.groups}>
          {groups.map(({ type, rows }) => {
            const headingId = `${baseId}-${type}`;
            const largest = rows[0]?.amount ?? 0;
            return (
              <section
                key={type}
                aria-labelledby={headingId}
                className={styles.group}
              >
                <h3 id={headingId} className={styles.heading}>
                  {t(
                    type === "expense"
                      ? "reports.largest.expenses"
                      : "reports.largest.incomes",
                  )}
                </h3>
                {rows.length === 0 ? (
                  <p className={styles.none}>{t(`reports.none.${type}`)}</p>
                ) : (
                  <ul className={styles.list}>
                    {rows.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={largeTransactionHref(item)}
                          className={styles.row}
                        >
                          <TransactionTile transaction={item} />
                          <span className={styles.body}>
                            <span className={styles.line}>
                              <span className={styles.title}>
                                <TransactionTitle
                                  type={item.type}
                                  category={item.category}
                                />
                              </span>
                              <Amount
                                value={item.amount}
                                type={item.type}
                                size="sm"
                                className={styles.amount}
                              />
                            </span>
                            <span className={styles.meta}>
                              {item.description ? (
                                <span className={styles.description}>
                                  {item.description}
                                </span>
                              ) : null}
                              <span className={styles.where}>
                                {item.account}
                                {" · "}
                                <DateText value={item.date} format="short" />
                              </span>
                            </span>
                            <span className={styles.track} aria-hidden="true">
                              <span
                                className={styles.fill}
                                data-type={type}
                                style={{
                                  inlineSize: `${largest > 0 ? (item.amount / largest) * 100 : 0}%`,
                                }}
                              />
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      }
      table={
        <DataTable
          caption={title}
          columns={[
            { key: "date", label: t("reports.largest.date") },
            { key: "category", label: t("reports.categories.category") },
            { key: "description", label: t("reports.largest.description") },
            { key: "account", label: t("reports.accounts.account") },
            { key: "amount", label: t("reports.table.amount"), align: "end" },
          ]}
          rows={groups.flatMap(({ rows }) =>
            rows.map((item) => ({
              key: item.id,
              cells: [
                <DateText key="date" value={item.date} format="numeric" />,
                <TransactionTitle
                  key="category"
                  type={item.type}
                  category={item.category}
                />,
                item.description,
                item.account,
                <Amount
                  key="amount"
                  value={item.amount}
                  type={item.type}
                  size="sm"
                />,
              ],
            })),
          )}
        />
      }
    />
  );
}
