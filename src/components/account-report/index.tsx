"use client";

import { useLocale, useTranslations } from "next-intl";

import { ReportCard } from "@/components/report-card";
import { Amount } from "@/components/ui/amount";
import { BarList } from "@/components/ui/bar-list";
import { DataTable } from "@/components/ui/data-table";
import { ACCOUNT_TYPE_ICONS } from "@/constants/account-icons";
import { formatMoney } from "@/helpers/money";
import { usePreferences } from "@/hooks/use-preferences";
import type { AccountReportRow } from "@/types/report";
import { formatPercent } from "@/utils/number";

type AccountReportProps = {
  /** Accounts with spending in the period, most first. */
  rows: AccountReportRow[];
  className?: string;
};

/**
 * What was spent from each account in the period: ranked brand bars with the account's type
 * tile, amount and share; or the same as a table. Transfers between accounts don't count.
 */
export function AccountReport({ rows, className }: AccountReportProps) {
  const t = useTranslations("reports");
  const locale = useLocale();
  const { moneyUnit } = usePreferences();
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const title = t("accounts.title");

  return (
    <ReportCard
      title={title}
      subtitle={t("total", { amount: formatMoney(total, moneyUnit, locale) })}
      className={className}
      empty={rows.length === 0 ? t("none.expense") : undefined}
      chart={
        <BarList
          aria-label={title}
          total={total}
          items={rows.map((row) => ({
            id: row.id,
            name: row.name,
            value: row.amount,
            icon: ACCOUNT_TYPE_ICONS[row.type],
          }))}
        />
      }
      table={
        <DataTable
          caption={title}
          columns={[
            { key: "account", label: t("accounts.account") },
            { key: "amount", label: t("table.amount"), align: "end" },
            { key: "share", label: t("table.share"), align: "end" },
          ]}
          rows={rows.map((row) => ({
            key: row.id,
            cells: [
              row.name,
              <Amount key="amount" value={row.amount} size="sm" />,
              formatPercent(total > 0 ? (row.amount / total) * 100 : 0, locale),
            ],
          }))}
        />
      }
    />
  );
}
