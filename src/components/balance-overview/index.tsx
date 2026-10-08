"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId } from "react";

import { Amount } from "@/components/ui/amount";
import { Skeleton } from "@/components/ui/skeleton";
import { ACCOUNT_TYPE_ICONS } from "@/constants/account-icons";
import type { Account } from "@/types/account";
import type { MoneyUnit } from "@/types/currency";
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type BalanceOverviewProps = {
  /** The book's accounts in their saved order; archived ones are left out. */
  accounts: Pick<Account, "id" | "name" | "type" | "balance" | "archived">[];
  /** Overrides the viewer's unit, for stories. */
  unit?: MoneyUnit;
  className?: string;
};

/**
 * The royal card at the top of the dashboard: the total balance of the active accounts and
 * each account's balance on a tile. The tiles scroll sideways when they don't fit (on phones,
 * edge to edge). Balances come from the database (accountBalance), never added up here
 * except for the total, which the accounts page shows the same way.
 */
export function BalanceOverview({
  accounts,
  unit,
  className,
}: BalanceOverviewProps) {
  const t = useTranslations("dashboard.balances");
  const locale = useLocale();
  const titleId = useId();
  const active = accounts.filter((account) => !account.archived);
  const total = active.reduce((sum, account) => sum + account.balance, 0);

  return (
    <section className={cx(styles.root, className)} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 id={titleId} className={styles.title}>
          {t("title")}
        </h2>
        <span className={styles.count}>
          {t("count", {
            countNumber: active.length,
            count: formatNumber(active.length, locale),
          })}
        </span>
      </div>
      <Amount value={total} size="hero" unit={unit} className={styles.total} />
      {active.length > 0 ? (
        <ul className={styles.accounts} aria-label={t("accounts")}>
          {active.map((account) => {
            const Icon = ACCOUNT_TYPE_ICONS[account.type];
            return (
              <li key={account.id} className={styles.account}>
                <span className={styles.name}>
                  <Icon className={styles.icon} aria-hidden="true" />
                  <span className={styles.nameText}>{account.name}</span>
                </span>
                <Amount value={account.balance} unit={unit} />
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

/** The balance card while its accounts load: a plain card, since the royal one is for figures. */
export function BalanceOverviewSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <Skeleton width="40%" height="14px" />
      <Skeleton width="60%" height="36px" />
      <div className={styles.accounts}>
        {[0, 1, 2].map((index) => (
          <div key={index} className={styles.account}>
            <Skeleton width="60%" height="12px" />
            <Skeleton width="80%" height="16px" />
          </div>
        ))}
      </div>
    </div>
  );
}
