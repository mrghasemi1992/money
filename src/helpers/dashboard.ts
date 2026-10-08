import type { BudgetCategory } from "@/types/budget";
import type { CalendarSystem } from "@/types/calendar";
import type { SpendingSlice } from "@/types/dashboard";
import type { CategoryReportRow } from "@/types/report";

import { budgetRatio } from "./budget";
import { reportParamsToSearch } from "./report";
import {
  EMPTY_TRANSACTION_PARAMS,
  transactionParamsToSearch,
} from "./transaction-filters";

/**
 * The budgets closest to or over their limit, most used first. Categories without a budget
 * are left out; equal shares keep the categories' order.
 */
export function closestBudgets(
  categories: BudgetCategory[],
  count: number,
): (BudgetCategory & { budget: number })[] {
  return categories
    .filter(
      (category): category is BudgetCategory & { budget: number } =>
        category.budget !== null,
    )
    .map((category) => ({
      category,
      ratio: budgetRatio(category.spent, category.budget),
    }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, count)
    .map(({ category }) => category);
}

/**
 * The month's expenses as at most `slices` slices, largest first (as categoryTotals orders
 * them): when there are more categories, the smallest ones are added up into «سایر».
 */
export function spendingSlices(
  rows: CategoryReportRow[],
  slices: number,
): SpendingSlice[] {
  const toSlice = (row: CategoryReportRow): SpendingSlice => ({
    id: row.id,
    kind: row.id === null ? "uncategorized" : "category",
    name: row.name,
    color: row.color,
    amount: row.amount,
  });
  const positive = rows.filter((row) => row.amount > 0);
  if (positive.length <= slices) return positive.map(toSlice);
  const shown = positive.slice(0, slices - 1);
  const rest = positive.slice(slices - 1);
  return [
    ...shown.map(toSlice),
    {
      id: null,
      kind: "other",
      name: "",
      color: "slate",
      amount: rest.reduce((sum, row) => sum + row.amount, 0),
    },
  ];
}

/** Every unknown transaction of the book: from the oldest one on, unknown only. */
export function unknownTransactionsHref(oldest: string | null): string {
  return `/transactions${transactionParamsToSearch({
    ...EMPTY_TRANSACTION_PARAMS,
    from: oldest,
    unknownOnly: true,
  })}`;
}

/** The reports page for one month of the viewer's calendar. */
export function monthReportHref(
  calendar: CalendarSystem,
  year: number,
  month: number,
): string {
  return `/reports${reportParamsToSearch({
    kind: "month",
    month: { calendar, year, month },
  })}`;
}
