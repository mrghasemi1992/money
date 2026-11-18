"use client";

import { CalendarXIcon, ChevronRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { useAddTransaction } from "@/components/add-transaction";
import { AssistantMark } from "@/components/assistant-mark";
import { TransactionDetail } from "@/components/transaction-detail";
import { TransactionTile } from "@/components/transaction-tile";
import { TransactionTitle } from "@/components/transaction-title";
import { Amount } from "@/components/ui/amount";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { DASHBOARD_RECENT_COUNT } from "@/constants/dashboard";
import { usePreferences } from "@/hooks/use-preferences";
import type { Transaction } from "@/types/transaction";
import { formatDate } from "@/utils/calendar";
import { cx } from "@/utils/cx";
import { addDays, todayIso } from "@/utils/iso-date";
import { isDebtType } from "@/helpers/transaction";

import styles from "./styles.module.css";

type RecentTransactionsProps = {
  /** This month's latest transactions, newest first (listTransactions for the month). */
  transactions: Transaction[];
  /** The transactions page filtered to this month (monthTransactionsHref). */
  href: string;
  /** Overrides today (for «امروز» and «دیروز»), for stories. */
  today?: string;
  className?: string;
};

const noop = () => {};

/**
 * This month's latest transactions in one compact list: the tile, the category and
 * subcategory (a transfer's route, or the «ناشناس» tag) with a Claude mark, then the
 * description, the account and the day, and the signed amount (on phones the day and the amount
 * get their own line, so the title and description get the whole width). A row opens the transaction's
 * detail; changes are made on the transactions page. A month without transactions shows an
 * empty state, with «افزودن تراکنش» when the shell's add form is on (editors and admins).
 */
export function RecentTransactions({
  transactions,
  href,
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
  const openAdd = useAddTransaction();

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
          href={href}
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
      {transactions.length === 0 ? (
        <EmptyState
          size="sm"
          icon={CalendarXIcon}
          title={t("dashboard.recent.empty")}
          action={
            openAdd ? (
              <Button size="sm" onClick={openAdd}>
                {t("addTransaction.title")}
              </Button>
            ) : null
          }
        />
      ) : (
        <ul className={styles.list}>
          {transactions.map((transaction) => {
            // A transfer's or debt's title names its accounts, so the row doesn't repeat the account.
            const accountInTitle =
              transaction.type === "transfer" || isDebtType(transaction.type);
            const { account, description } = transaction;
            return (
              <li key={transaction.id} className={styles.row}>
                <TransactionTile
                  transaction={transaction}
                  className={styles.tile}
                />
                <div className={styles.main}>
                  <div className={styles.titleLine}>
                    <button
                      type="button"
                      className={styles.open}
                      onClick={() => {
                        setTarget(transaction);
                        setOpen(true);
                      }}
                    >
                      <TransactionTitle
                        type={transaction.type}
                        category={transaction.category}
                        from={account.name}
                        to={transaction.toAccount?.name}
                        wrap
                      />
                    </button>
                    <AssistantMark source={transaction.source} />
                  </div>
                  <div className={styles.details}>
                    {description || !accountInTitle ? (
                      <>
                        <span className={styles.meta}>
                          {description ? (
                            <span
                              className={cx(
                                styles.metaText,
                                styles.description,
                              )}
                            >
                              {description}
                            </span>
                          ) : null}
                          {description && !accountInTitle ? (
                            <i className={styles.metaDot} aria-hidden="true" />
                          ) : null}
                          {accountInTitle ? null : (
                            <span
                              className={cx(styles.metaText, styles.account)}
                            >
                              {account.name}
                            </span>
                          )}
                        </span>
                        <i
                          className={cx(styles.metaDot, styles.dayDot)}
                          aria-hidden="true"
                        />
                      </>
                    ) : null}
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
      )}
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
  ["50%", "24%"],
  ["34%", "30%"],
] as const;

/**
 * The recent transactions while they load: the real card, its link and one placeholder row
 * per transaction it will show (DASHBOARD_RECENT_COUNT), each as tall as a real row.
 */
export function RecentTransactionsSkeleton() {
  const t = useTranslations();
  return (
    <Card
      padding="none"
      title={t("dashboard.recent.title")}
      actions={
        <Button
          variant="ghost"
          size="sm"
          iconEnd={ChevronRightIcon}
          mirrorIcons
        >
          {t("dashboard.all")}
        </Button>
      }
      inert
    >
      <div className={styles.list}>
        {SKELETON_ROWS.slice(0, DASHBOARD_RECENT_COUNT).map(
          ([title, detail], index) => (
            <div key={index} className={styles.row}>
              <Skeleton
                width="var(--transaction-tile)"
                height="var(--transaction-tile)"
                radius="var(--radius-lg)"
                className={cx(styles.tile, styles.skeletonTile)}
              />
              <div className={styles.main}>
                <span className={styles.skeletonTitle}>
                  <Skeleton variant="text" width={title} />
                </span>
                <span className={styles.meta}>
                  <Skeleton variant="text" width={detail} />
                </span>
              </div>
              <span className={cx(styles.amount, styles.skeletonAmount)}>
                <Skeleton variant="text" width="88px" />
              </span>
            </div>
          ),
        )}
      </div>
    </Card>
  );
}
