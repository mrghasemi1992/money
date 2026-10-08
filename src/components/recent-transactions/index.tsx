"use client";

import { ChevronRightIcon, CircleHelpIcon, SparklesIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { TransactionDetail } from "@/components/transaction-detail";
import { TransactionTile } from "@/components/transaction-tile";
import { Amount } from "@/components/ui/amount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnknownDescription } from "@/helpers/transaction";
import { usePreferences } from "@/hooks/use-preferences";
import type { Transaction } from "@/types/transaction";
import { formatDate } from "@/utils/calendar";
import { cx } from "@/utils/cx";
import { addDays, todayIso } from "@/utils/iso-date";

import styles from "./styles.module.css";

type RecentTransactionsProps = {
  /** The latest transactions, newest first (listTransactions without filters). */
  transactions: Transaction[];
  /** Overrides today (for «امروز» and «دیروز»), for stories. */
  today?: string;
  className?: string;
};

const noop = () => {};

/**
 * The latest transactions in one compact list: the tile, the description (or «ناشناس»), a
 * Claude mark, the category or the transfer's route, the account and the day, and the signed
 * amount. A row opens the transaction's detail; changes are made on the transactions page.
 */
export function RecentTransactions({
  transactions,
  today: todayProp,
  className,
}: RecentTransactionsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { calendar, timeZone } = usePreferences();
  const today = todayProp ?? todayIso(timeZone);
  const yesterday = addDays(today, -1);
  const [target, setTarget] = useState<Transaction | null>(null);
  const [open, setOpen] = useState(false);

  function day(date: string): string {
    if (date === today) return t("common.today");
    if (date === yesterday) return t("common.yesterday");
    return formatDate(date, { locale, calendar, format: "short" });
  }

  return (
    <Card
      as="section"
      padding="none"
      title={t("dashboard.recent.title")}
      actions={
        <Button
          href="/transactions"
          variant="ghost"
          size="sm"
          iconEnd={ChevronRightIcon}
          mirrorIcons
          aria-label={t("dashboard.recent.all")}
        >
          {t("dashboard.all")}
        </Button>
      }
      className={className}
    >
      <ul className={styles.list}>
        {transactions.map((transaction) => {
          const unknown = isUnknownDescription(transaction.description);
          const { category, account, toAccount } = transaction;
          const where =
            transaction.type === "transfer" && toAccount
              ? t("transactions.list.route", {
                  from: account.name,
                  to: toAccount.name,
                })
              : null;
          const categoryText = category
            ? category.parentName
              ? `${category.parentName} / ${category.name}`
              : category.name
            : t("transactions.list.noCategory");
          return (
            <li key={transaction.id} className={styles.row}>
              <TransactionTile transaction={transaction} />
              <div className={styles.main}>
                <div className={styles.titleLine}>
                  <button
                    type="button"
                    className={cx(styles.open, unknown && styles.openUnknown)}
                    onClick={() => {
                      setTarget(transaction);
                      setOpen(true);
                    }}
                  >
                    <span className={styles.description}>
                      {unknown
                        ? t("transactions.list.unknownDescription")
                        : transaction.description}
                    </span>
                  </button>
                  {unknown ? (
                    <Badge tone="warning" size="sm" icon={CircleHelpIcon}>
                      {t("transactions.list.unknown")}
                    </Badge>
                  ) : null}
                  {transaction.source === "mcp" ? (
                    <Badge
                      tone="brand"
                      size="sm"
                      icon={SparklesIcon}
                      title={t("transactions.list.claudeTip")}
                    >
                      Claude
                    </Badge>
                  ) : null}
                </div>
                <div className={styles.meta}>
                  {where ? (
                    <span className={styles.metaText}>{where}</span>
                  ) : (
                    <>
                      <span className={styles.metaText}>{categoryText}</span>
                      <i className={styles.metaDot} aria-hidden="true" />
                      <span className={cx(styles.metaText, styles.account)}>
                        {account.name}
                      </span>
                    </>
                  )}
                  <i className={styles.metaDot} aria-hidden="true" />
                  <span className={styles.day}>{day(transaction.date)}</span>
                </div>
              </div>
              <Amount
                value={transaction.amount}
                type={transaction.type}
                className={styles.amount}
              />
            </li>
          );
        })}
      </ul>
      <TransactionDetail
        open={open}
        onOpenChange={setOpen}
        transaction={target}
        canWrite={false}
        onEdit={noop}
        onDelete={noop}
      />
    </Card>
  );
}

/** Widths of the two text lines in each row, so the rows don't look identical. */
const SKELETON_ROWS = [
  ["48%", "32%"],
  ["36%", "26%"],
  ["54%", "30%"],
  ["40%", "22%"],
  ["46%", "34%"],
  ["38%", "28%"],
] as const;

/** The recent transactions while they load. */
export function RecentTransactionsSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.skeletonHead}>
        <Skeleton width="40%" height="16px" />
      </div>
      {SKELETON_ROWS.map(([title, detail], index) => (
        <div key={index} className={styles.row}>
          <Skeleton
            width="var(--transaction-tile)"
            height="var(--transaction-tile)"
          />
          <div className={styles.main}>
            <Skeleton width={title} height="14px" />
            <Skeleton width={detail} height="12px" />
          </div>
          <Skeleton width="88px" height="16px" />
        </div>
      ))}
    </div>
  );
}
