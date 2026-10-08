import { z } from "zod";

import type { BudgetInput, BudgetMonth } from "@/types/budget";
import type { CalendarSystem } from "@/types/calendar";
import type { TransactionFilterParams } from "@/types/transaction";
import {
  daysInMonth,
  fromCalendarDate,
  monthRange,
  toCalendarDate,
} from "@/utils/calendar";

import {
  EMPTY_TRANSACTION_PARAMS,
  transactionParamsToSearch,
} from "./transaction-filters";

export type BudgetStatus = "ok" | "near" | "over";

/** From this share of the budget on, a category is «near the limit». */
export const BUDGET_NEAR_RATIO = 0.8;

/** ok below nearAt of the budget, near from there up to the budget, over above it. */
export function getBudgetStatus(
  spent: number,
  budget: number,
  nearAt = BUDGET_NEAR_RATIO,
): BudgetStatus {
  const ratio = budget > 0 ? spent / budget : spent > 0 ? Infinity : 0;
  if (ratio > 1) return "over";
  if (ratio >= nearAt) return "near";
  return "ok";
}

/** Spent as a share of the budget: 0.5 is half. */
export function budgetRatio(spent: number, budget: number): number {
  return budget > 0 ? spent / budget : 0;
}

/** Fields of the budget form, as errors point at them. */
export type BudgetField = "categoryId" | "amount";

/** Keys of the `budgets.form.errors` messages. */
export type BudgetError =
  | "categoryMissing"
  | "categoryUnavailable"
  | "amountMissing"
  | "amountTooLarge";

/**
 * The budget form's rules, shared by the form (to show errors before sending) and the Server
 * Actions (which check again). Messages are keys of `budgets.form.errors`.
 */
export const budgetSchema = z.object({
  categoryId: z.uuid({ error: "categoryMissing" }),
  amount: z
    .number({ error: "amountMissing" })
    .int("amountMissing")
    .positive("amountMissing")
    .max(Number.MAX_SAFE_INTEGER, "amountTooLarge"),
}) satisfies z.ZodType<BudgetInput>;

/** Each field's first error, or null when the input is valid. */
export function budgetErrors(
  input: unknown,
): Partial<Record<BudgetField, BudgetError>> | null {
  const parsed = budgetSchema.safeParse(input);
  if (parsed.success) return null;
  const errors: Partial<Record<BudgetField, BudgetError>> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if ((field === "categoryId" || field === "amount") && !errors[field]) {
      errors[field] = issue.message as BudgetError;
    }
  }
  return errors;
}

/**
 * The month to show: the URL's month (`?month=1405-07`, read with parseMonthParam), otherwise
 * the viewer's current month. A month of the other calendar becomes the viewer's month around
 * its middle (October 2026 → Mehr 1405), since budgets follow the viewer's months.
 */
export function resolveBudgetMonth(
  param: TransactionFilterParams["month"],
  calendar: CalendarSystem,
  today: string,
): BudgetMonth {
  const current = toCalendarDate(today, calendar);
  let { year, month } = current;
  if (param && param.calendar === calendar) {
    ({ year, month } = param);
  } else if (param) {
    const middle = fromCalendarDate(
      { year: param.year, month: param.month, day: 15 },
      param.calendar,
    );
    ({ year, month } = toCalendarDate(middle, calendar));
  }

  const { start, end } = monthRange(calendar, year, month);
  const days = daysInMonth(calendar, year, month);
  const index = year * 12 + month;
  const currentIndex = current.year * 12 + current.month;
  const phase =
    index < currentIndex ? "past" : index > currentIndex ? "future" : "current";
  return {
    year,
    month,
    from: start,
    to: end,
    phase,
    days,
    day: phase === "current" ? current.day : phase === "past" ? days : 0,
  };
}

/** The transactions page filtered to a category (with its subcategories) and a month. */
export function budgetTransactionsHref(
  categoryId: string,
  calendar: CalendarSystem,
  year: number,
  month: number,
): string {
  return `/transactions${transactionParamsToSearch({
    ...EMPTY_TRANSACTION_PARAMS,
    month: { calendar, year, month },
    categoryId,
  })}`;
}
