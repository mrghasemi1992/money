"use client";

import {
  ArrowLeftRightIcon,
  CircleDashedIcon,
  CircleHelpIcon,
  PencilIcon,
  SparklesIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { CSSProperties } from "react";

import { Amount } from "@/components/ui/amount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { IconButton } from "@/components/ui/icon-button";
import { ACCOUNT_TYPE_ICONS } from "@/constants/account-icons";
import { TRANSACTION_TYPE_ICONS } from "@/constants/transaction-icons";
import { categoryColorStyle } from "@/helpers/category";
import { isUnknownDescription } from "@/helpers/transaction";
import { usePreferences } from "@/hooks/use-preferences";
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
 * net. A row shows the description (or a «؟» mark and «ناشناس» for unknown ones), the
 * category or the transfer's route, the account, tags, a Claude mark and the signed amount.
 * Clicking a row opens its detail. On phones each row starts with a tile and the category and
 * account move under the description; from 62rem of list width the account gets a column.
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
        <span>{t("transactions.list.description")}</span>
        <span className={styles.narrowOnly}>
          {t("transactions.list.categoryAndAccount")}
        </span>
        <span className={styles.wideOnly}>
          {t("transactions.list.category")}
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
  const unknown = isUnknownDescription(transaction.description);
  const isTransfer = transaction.type === "transfer";
  const { category, account, toAccount } = transaction;
  const route =
    isTransfer && toAccount
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
  const AccountIcon = ACCOUNT_TYPE_ICONS[account.type];
  const TypeIcon = TRANSACTION_TYPE_ICONS[transaction.type];
  const description = unknown
    ? t("transactions.list.unknownDescription")
    : transaction.description;

  const tileStyle: CSSProperties | undefined =
    category && !unknown ? categoryColorStyle(category.color) : undefined;
  const tileKind = isTransfer
    ? styles.tileTransfer
    : unknown
      ? styles.tileUnknown
      : category
        ? styles.tileCategory
        : styles.tileNone;

  return (
    <li className={styles.row}>
      <span className={cx(styles.tile, tileKind)} style={tileStyle}>
        {unknown && !isTransfer ? (
          <span className={styles.tileMark} aria-hidden="true">
            ؟
          </span>
        ) : isTransfer ? (
          <ArrowLeftRightIcon className={styles.tileIcon} aria-hidden="true" />
        ) : category ? (
          <TypeIcon className={styles.tileIcon} aria-hidden="true" />
        ) : (
          <CircleDashedIcon className={styles.tileIcon} aria-hidden="true" />
        )}
      </span>

      <div className={styles.main}>
        <div className={styles.titleLine}>
          {unknown ? (
            <span className={styles.unknownMark} aria-hidden="true">
              ؟
            </span>
          ) : null}
          <button
            type="button"
            className={cx(styles.open, unknown && styles.openUnknown)}
            onClick={() => onOpen(transaction)}
          >
            <span className={styles.description}>{description}</span>
          </button>
          {unknown ? (
            <Badge tone="warning" size="sm" icon={CircleHelpIcon}>
              {t("transactions.list.unknown")}
            </Badge>
          ) : null}
          {transaction.source === "mcp" ? (
            <>
              <Badge
                tone="brand"
                size="sm"
                icon={SparklesIcon}
                title={t("transactions.list.claudeTip")}
                className={styles.claudeBadge}
              >
                Claude
              </Badge>
              <span
                className={styles.claudeIcon}
                title={t("transactions.list.claudeTip")}
              >
                <SparklesIcon aria-hidden="true" />
                <span className="visually-hidden">
                  {t("transactions.list.claudeTip")}
                </span>
              </span>
            </>
          ) : null}
        </div>
        <div className={styles.meta}>
          <span className={styles.metaText}>{route ?? categoryText}</span>
          {isTransfer ? null : (
            <>
              <i className={styles.metaDot} aria-hidden="true" />
              <span className={styles.metaText}>{account.name}</span>
            </>
          )}
        </div>
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

      <div className={styles.category}>
        {isTransfer ? (
          <span className={styles.route}>
            <span className={styles.routeIcon}>
              <ArrowLeftRightIcon aria-hidden="true" />
            </span>
            <span className={styles.routeText}>{route}</span>
          </span>
        ) : category ? (
          <CategoryChip
            size="sm"
            name={category.parentName ?? category.name}
            sub={category.parentName ? category.name : undefined}
            color={category.color}
            className={styles.chip}
          />
        ) : (
          <span className={styles.noCategory}>
            {t("transactions.list.noCategory")}
          </span>
        )}
        {isTransfer ? null : (
          <span className={cx(styles.accountLine, styles.narrowOnly)}>
            <AccountIcon className={styles.accountIcon} aria-hidden="true" />
            {account.name}
          </span>
        )}
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
