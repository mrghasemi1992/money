"use client";

import {
  ChevronRightIcon,
  CircleAlertIcon,
  PencilIcon,
  PlusIcon,
  TriangleAlertIcon,
} from "lucide-react";
import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useId } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { IconButton } from "@/components/ui/icon-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  budgetRatio,
  budgetTransactionsHref,
  getBudgetStatus,
} from "@/helpers/budget";
import { formatMoney, formatMoneyNumber } from "@/helpers/money";
import { usePreferences } from "@/hooks/use-preferences";
import type { BudgetCategory } from "@/types/budget";
import type { CalendarSystem } from "@/types/calendar";
import type { MoneyUnit } from "@/types/currency";
import { cx } from "@/utils/cx";
import { formatMonth } from "@/utils/calendar";
import { formatPercent } from "@/utils/number";

import styles from "./styles.module.css";

type BudgetListProps = {
  /** Categories with a budget (`budget` set) and their spending in the month. */
  categories: BudgetCategory[];
  /** The month shown, in the viewer's calendar: the rows link to its transactions. */
  year: number;
  month: number;
  /** Editors and admins get an edit button on each row. */
  canWrite: boolean;
  onEdit: (category: BudgetCategory) => void;
  /** Override the viewer's calendar and unit, for stories. */
  calendar?: CalendarSystem;
  unit?: MoneyUnit;
};

/**
 * One row per budget, most used first: the category, a bar with the share spent, spent of
 * the limit, and what's left (or how far over). Near the limit (from 80%) and over are
 * spelled out with an icon, not only colored. A row opens the category's transactions for
 * the month (subcategories included). A table from 56rem of list width, cards below that.
 */
export function BudgetList({
  categories,
  year,
  month,
  canWrite,
  onEdit,
  calendar: calendarProp,
  unit: unitProp,
}: BudgetListProps) {
  const t = useTranslations();
  const locale = useLocale();
  const preferences = usePreferences();
  const calendar = calendarProp ?? preferences.calendar;
  const unit = unitProp ?? preferences.moneyUnit;
  const baseId = useId();
  const monthLabel = formatMonth(calendar, locale, year, month);

  const rows = categories
    .map((category) => {
      const budget = category.budget ?? 0;
      return {
        category,
        budget,
        ratio: budgetRatio(category.spent, budget),
        status: getBudgetStatus(category.spent, budget),
      };
    })
    // Most used first; the sort is stable, so equal rows keep the categories' order.
    .sort((a, b) => b.ratio - a.ratio);

  return (
    <div className={cx(styles.root, canWrite && styles.writable)}>
      <div className={styles.head} aria-hidden="true">
        <span>{t("budgets.list.category")}</span>
        <span className={styles.headUsed}>{t("budgets.list.used")}</span>
        <span className={styles.headEnd}>{t("budgets.list.spent")}</span>
        <span className={styles.headEnd}>{t("budgets.list.status")}</span>
      </div>
      <ul className={styles.list} aria-label={t("budgets.list.label")}>
        {rows.map(({ category, budget, ratio, status }) => {
          const statusId = `${baseId}-${category.id}`;
          const amount = formatMoney(
            Math.abs(budget - category.spent),
            unit,
            locale,
          );
          const StatusIcon =
            status === "over"
              ? CircleAlertIcon
              : status === "near"
                ? TriangleAlertIcon
                : null;
          return (
            <li
              key={category.id}
              className={cx(styles.row, styles[status])}
              data-status={status}
            >
              <NextLink
                href={budgetTransactionsHref(
                  category.id,
                  calendar,
                  year,
                  month,
                )}
                className={styles.link}
                aria-label={t("budgets.list.open", {
                  name: category.name,
                  month: monthLabel,
                })}
                aria-describedby={statusId}
              >
                <span className={styles.category}>
                  <CategoryChip
                    name={category.name}
                    color={category.color}
                    className={styles.chip}
                  />
                  {category.archived ? (
                    <Badge size="sm">{t("budgets.list.archived")}</Badge>
                  ) : null}
                </span>
                <ProgressBar
                  value={category.spent}
                  max={budget}
                  size="sm"
                  unit={unit}
                  aria-label={category.name}
                  className={styles.bar}
                />
                <span className={styles.percent}>
                  {formatPercent(ratio * 100, locale)}
                </span>
                <span className={styles.values}>
                  <span className={styles.spent}>
                    {formatMoneyNumber(category.spent, unit, locale)}
                  </span>{" "}
                  {t("budgets.list.ofLimit", {
                    max: formatMoneyNumber(budget, unit, locale),
                  })}
                </span>
                <span id={statusId} className={styles.status}>
                  {StatusIcon ? (
                    <StatusIcon
                      className={styles.statusIcon}
                      aria-hidden="true"
                    />
                  ) : null}
                  {status === "over"
                    ? t("budget.over", { amount })
                    : t(status === "near" ? "budget.near" : "budget.left", {
                        amount,
                      })}
                </span>
                <ChevronRightIcon
                  className={cx(styles.chevron, "mirror-rtl")}
                  aria-hidden="true"
                />
              </NextLink>
              {canWrite ? (
                <IconButton
                  icon={PencilIcon}
                  label={t("budgets.list.edit", { name: category.name })}
                  size="sm"
                  className={styles.edit}
                  onClick={() => onEdit(category)}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type UnbudgetedListProps = {
  /** Active expense categories without a budget, with their spending in the month. */
  categories: BudgetCategory[];
  canWrite: boolean;
  onAdd: (category: BudgetCategory) => void;
  /** Overrides the viewer's unit, for stories. */
  unit?: MoneyUnit;
};

/** Expense categories without a budget: what they spent this month and «تعیین بودجه». */
export function UnbudgetedList({
  categories,
  canWrite,
  onAdd,
  unit: unitProp,
}: UnbudgetedListProps) {
  const t = useTranslations("budgets");
  const locale = useLocale();
  const { moneyUnit } = usePreferences();
  const unit = unitProp ?? moneyUnit;

  return (
    <ul className={styles.unbudgeted}>
      {categories.map((category) => (
        <li key={category.id} className={styles.unbudgetedRow}>
          <CategoryChip
            name={category.name}
            color={category.color}
            className={styles.unbudgetedChip}
          />
          <span className={styles.unbudgetedSpent}>
            {category.spent > 0
              ? formatMoney(category.spent, unit, locale)
              : t("unbudgeted.noSpending")}
          </span>
          {canWrite ? (
            <Button
              variant="secondary"
              size="sm"
              iconStart={PlusIcon}
              onClick={() => onAdd(category)}
              aria-label={t("unbudgeted.add", { name: category.name })}
            >
              {t("add")}
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
