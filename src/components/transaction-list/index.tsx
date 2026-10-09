"use client";

import { PencilIcon, SparklesIcon, TagIcon, Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { TransactionTile } from "@/components/transaction-tile";
import { TransactionTitle } from "@/components/transaction-title";
import { Amount } from "@/components/ui/amount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { ACCOUNT_TYPE_ICONS } from "@/constants/account-icons";
import { usePreferences } from "@/hooks/use-preferences";
import { assistantName } from "@/helpers/transaction-source";
import type { Transaction, TransactionDayTotal } from "@/types/transaction";
import { formatDate } from "@/utils/calendar";
import { cx } from "@/utils/cx";
import { addDays, todayIso } from "@/utils/iso-date";

import styles from "./styles.module.css";

type TransactionListProps = {
  /** Newest first, as the query returns them. */
  transactions: Transaction[];
  /** Each day's totals over all matching transactions (not only the loaded ones). */
  dayTotals: TransactionDayTotal[];
  /** Editors and admins get edit and delete buttons on each row (from 768px up). */
  canWrite: boolean;
  /** Opens the transaction's detail. */
  onOpen: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  /** More rows after these: shows «نمایش بیشتر». */
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  /** Overrides today (for «امروز» and «دیروز»), for stories. */
  today?: string;
};

type Day = { date: string; rows: Transaction[] };

function groupByDay(transactions: Transaction[]): Day[] {
  const days: Day[] = [];
  for (const transaction of transactions) {
    const last = days.at(-1);
    if (last?.date === transaction.date) last.rows.push(transaction);
    else days.push({ date: transaction.date, rows: [transaction] });
  }
  return days;
}

/**
 * The transactions of a period grouped by day in the viewer's calendar, each day with its
 * net. A row starts with its tile, then the category and subcategory (a transfer's route, or
 * the «ناشناس» tag without a category) with a Claude mark, the description under it in a
 * smaller, lighter style, the tags, and at the end the signed amount. The account sits next
 * to the description until the list is 62rem wide, then gets its own column. Clicking a row
 * opens its detail.
 */
export function TransactionList({
  transactions,
  dayTotals,
  canWrite,
  onOpen,
  onEdit,
  onDelete,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  today: todayProp,
}: TransactionListProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { calendar, timeZone } = usePreferences();
  const today = todayProp ?? todayIso(timeZone);
  const yesterday = addDays(today, -1);
  const totals = new Map(dayTotals.map((day) => [day.date, day]));

  function dayHeading(date: string) {
    const full = formatDate(date, { locale, calendar, format: "weekday" });
    const relative =
      date === today
        ? t("common.today")
        : date === yesterday
          ? t("common.yesterday")
          : null;
    if (!relative) return <b className={styles.dayTitle}>{full}</b>;
    // «امروز، چهارشنبه ۱۵ مهر ۱۴۰۵»: the relative word bold, the date after it.
    return t.rich("transactions.list.dayHeading", {
      relative,
      date: full,
      b: (chunks) => <b className={styles.dayTitle}>{chunks}</b>,
    });
  }

  function dayNet(day: Day): number {
    const total = totals.get(day.date);
    if (total) return total.income - total.expense;
    return day.rows.reduce(
      (sum, row) =>
        sum +
        (row.type === "income"
          ? row.amount
          : row.type === "expense"
            ? -row.amount
            : 0),
      0,
    );
  }

  return (
    <div className={cx(styles.root, canWrite && styles.writable)}>
      <div className={styles.columns} aria-hidden="true">
        <span className={styles.transactionHead}>
          {t("transactions.list.transaction")}
        </span>
        <span className={styles.wideOnly}>
          {t("transactions.list.account")}
        </span>
        <span className={styles.amountHead}>
          {t("transactions.list.amount")}
        </span>
        {canWrite ? <span /> : null}
      </div>
      {groupByDay(transactions).map((day) => (
        <section key={day.date} className={styles.day}>
          <h2 className={styles.dayHead}>
            <span className={styles.dayLabel}>{dayHeading(day.date)}</span>
            <Amount
              value={dayNet(day)}
              type="neutral"
              size="sm"
              className={styles.dayNet}
            />
          </h2>
          <ul className={styles.rows}>
            {day.rows.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                canWrite={canWrite}
                onOpen={onOpen}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </section>
      ))}
      {hasMore ? (
        <div className={styles.more}>
          <Button
            variant="secondary"
            fullWidth
            loading={loadingMore}
            onClick={onLoadMore}
          >
            {t("transactions.loadMore")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

type TransactionRowProps = {
  transaction: Transaction;
  canWrite: boolean;
  onOpen: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

function TransactionRow({
  transaction,
  canWrite,
  onOpen,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const t = useTranslations();
  const isTransfer = transaction.type === "transfer";
  const { account, description } = transaction;
  const AccountIcon = ACCOUNT_TYPE_ICONS[account.type];

  return (
    <li className={styles.row}>
      <TransactionTile transaction={transaction} />

      <div className={styles.main}>
        <div className={styles.titleLine}>
          <button
            type="button"
            className={styles.open}
            onClick={() => onOpen(transaction)}
          >
            <TransactionTitle
              type={transaction.type}
              category={transaction.category}
              from={account.name}
              to={transaction.toAccount?.name}
            />
          </button>
          {assistantName(transaction.source) ? (
            <>
              <Badge
                tone="brand"
                size="sm"
                icon={SparklesIcon}
                title={t("transactions.list.assistantTip", {
                  name: assistantName(transaction.source) ?? "",
                })}
                className={styles.claudeBadge}
              >
                {assistantName(transaction.source)}
              </Badge>
              <span
                className={styles.claudeIcon}
                title={t("transactions.list.assistantTip", {
                  name: assistantName(transaction.source) ?? "",
                })}
              >
                <SparklesIcon aria-hidden="true" />
                <span className="visually-hidden">
                  {t("transactions.list.assistantTip", {
                    name: assistantName(transaction.source) ?? "",
                  })}
                </span>
              </span>
            </>
          ) : null}
        </div>
        {description || !isTransfer ? (
          <div className={cx(styles.meta, !description && styles.narrowOnly)}>
            {description ? (
              <span className={styles.description}>{description}</span>
            ) : null}
            {description && !isTransfer ? (
              <i
                className={cx(styles.metaDot, styles.narrowOnly)}
                aria-hidden="true"
              />
            ) : null}
            {isTransfer ? null : (
              <span className={cx(styles.metaAccount, styles.narrowOnly)}>
                {account.name}
              </span>
            )}
          </div>
        ) : null}
        {transaction.tags.length > 0 ? (
          <div className={styles.tags}>
            {transaction.tags.map((tag) => (
              <Badge key={tag} size="sm" icon={TagIcon}>
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className={cx(styles.account, styles.wideOnly)}>
        {isTransfer ? null : (
          <>
            <AccountIcon className={styles.accountIcon} aria-hidden="true" />
            <span className={styles.accountName}>{account.name}</span>
          </>
        )}
      </div>

      <Amount
        value={transaction.amount}
        type={transaction.type}
        className={styles.amount}
      />

      {canWrite ? (
        <div className={styles.actions}>
          <IconButton
            icon={PencilIcon}
            label={t("transactions.list.edit")}
            size="sm"
            onClick={() => onEdit(transaction)}
          />
          <IconButton
            icon={Trash2Icon}
            label={t("transactions.list.delete")}
            variant="danger"
            size="sm"
            onClick={() => onDelete(transaction)}
          />
        </div>
      ) : null}
    </li>
  );
}
