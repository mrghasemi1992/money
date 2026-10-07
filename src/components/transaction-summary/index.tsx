"use client";

import { ArrowDownIcon, ArrowUpIcon, EqualIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Amount } from "@/components/ui/amount";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TransactionTotals } from "@/types/transaction";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type TransactionSummaryProps = {
  /** Null while loading: skeletons instead of amounts. */
  totals: TransactionTotals | null;
  className?: string;
};

/**
 * The period's income, expense and net side by side (transfers count in neither). Income and
 * expense carry their sign and arrow; the net is a plain balance, with «−» when negative.
 */
export function TransactionSummary({
  totals,
  className,
}: TransactionSummaryProps) {
  const t = useTranslations();
  const cells = [
    {
      key: "income",
      label: t("transactionType.income"),
      icon: ArrowDownIcon,
      value: totals?.income,
      type: "income",
    },
    {
      key: "expense",
      label: t("transactionType.expense"),
      icon: ArrowUpIcon,
      value: totals?.expense,
      type: "expense",
    },
    {
      key: "net",
      label: t("transactions.net"),
      icon: EqualIcon,
      value: totals ? totals.income - totals.expense : undefined,
      type: "neutral",
    },
  ] as const;

  return (
    <Card padding="none" className={className}>
      <dl className={styles.root}>
        {cells.map(({ key, label, icon: Icon, value, type }) => (
          <div key={key} className={styles.cell}>
            <dt className={styles.label}>
              <span className={cx(styles.icon, styles[key])}>
                <Icon aria-hidden="true" />
              </span>
              {label}
            </dt>
            <dd className={styles.value}>
              {value === undefined ? (
                <Skeleton width="110px" height="22px" />
              ) : (
                <Amount
                  value={value}
                  type={type}
                  size="lg"
                  className={styles.amount}
                />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
