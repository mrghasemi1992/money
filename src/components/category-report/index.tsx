"use client";

import { InfoIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { ReportCard } from "@/components/report-card";
import { Amount } from "@/components/ui/amount";
import { type BarListItem, BarList } from "@/components/ui/bar-list";
import { CategoryChip } from "@/components/ui/category-chip";
import { DataTable, type DataTableRow } from "@/components/ui/data-table";
import { formatMoney } from "@/helpers/money";
import { usePreferences } from "@/hooks/use-preferences";
import type { CategoryReportRow } from "@/types/report";
import { formatPercent } from "@/utils/number";

import styles from "./styles.module.css";

type CategoryReportProps = {
  type: "income" | "expense";
  /** Top-level categories with their subcategories rolled up, most first. */
  rows: CategoryReportRow[];
  className?: string;
};

/** The id of the part recorded on a category itself, among its subcategories. */
const DIRECT_ID = "direct";

/**
 * Income or expense by category for the period: ranked bars in each category's hue, with
 * its amount and share of the total; a category opens to its subcategories (and what was
 * recorded on the category itself, «بدون زیردسته»). The table view lists the same figures,
 * subcategories indented under their category, each with its share of the total.
 */
export function CategoryReport({ type, rows, className }: CategoryReportProps) {
  const t = useTranslations("reports");
  const locale = useLocale();
  const { moneyUnit } = usePreferences();
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const title = t(
    type === "income" ? "categories.incomeTitle" : "categories.expenseTitle",
  );

  const named = rows.map((row) => {
    const name = row.id === null ? t("categories.uncategorized") : row.name;
    const parts =
      row.subcategories.length > 0 && row.direct > 0
        ? [
            ...row.subcategories,
            { id: DIRECT_ID, name: t("categories.direct"), amount: row.direct },
          ].sort((a, b) => b.amount - a.amount)
        : row.subcategories;
    return { row, name, parts };
  });

  const items: BarListItem[] = named.map(({ row, name, parts }) => ({
    id: row.id ?? "none",
    name,
    label: <CategoryChip name={name} color={row.color} />,
    value: row.amount,
    color: row.color,
    items: parts.map((part) => ({
      id: part.id,
      name: part.name,
      value: part.amount,
    })),
  }));

  const share = (amount: number) =>
    formatPercent(total > 0 ? (amount / total) * 100 : 0, locale);
  const tableRows: DataTableRow[] = named.flatMap(({ row, name, parts }) => [
    {
      key: row.id ?? "none",
      cells: [
        name,
        <Amount key="amount" value={row.amount} size="sm" />,
        share(row.amount),
      ],
    },
    ...parts.map((part): DataTableRow => ({
      key: `${row.id ?? "none"}-${part.id}`,
      level: 1,
      cells: [
        part.name,
        <Amount key="amount" value={part.amount} size="sm" />,
        share(part.amount),
      ],
    })),
  ]);

  const expandable = items.some((item) => (item.items?.length ?? 0) > 0);

  return (
    <ReportCard
      title={title}
      subtitle={t("total", { amount: formatMoney(total, moneyUnit, locale) })}
      className={className}
      empty={rows.length === 0 ? t(`none.${type}`) : undefined}
      chart={
        <div className={styles.chart}>
          <BarList items={items} total={total} aria-label={title} />
          {expandable ? (
            <p className={styles.hint}>
              <InfoIcon className={styles.hintIcon} aria-hidden="true" />
              {t("categories.hint")}
            </p>
          ) : null}
        </div>
      }
      table={
        <DataTable
          caption={title}
          columns={[
            { key: "category", label: t("categories.category") },
            { key: "amount", label: t("table.amount"), align: "end" },
            { key: "share", label: t("table.share"), align: "end" },
          ]}
          rows={tableRows}
        />
      }
    />
  );
}
