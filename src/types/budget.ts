import type { CategoryColor } from "./category";

/** What the budget form saves: a top-level expense category and its monthly limit. */
export type BudgetInput = {
  categoryId: string;
  /** Per month, in the book currency's smallest unit (rials, cents). */
  amount: number;
};

/**
 * A top-level expense category with its spending in one month (its subcategories rolled up)
 * and its budget, if it has one.
 */
export type BudgetCategory = {
  id: string;
  name: string;
  color: CategoryColor;
  archived: boolean;
  /** Names of its active subcategories, whose spending counts toward its budget. */
  subcategories: string[];
  /** Expenses in the month, in the smallest unit. Transfers never count. */
  spent: number;
  /** The monthly limit, or null without a budget. */
  budget: number | null;
};

/**
 * The month the budgets page shows: a month of the viewer's calendar with its Gregorian
 * dates, and where today falls in it.
 */
export type BudgetMonth = {
  year: number;
  month: number;
  /** First and last ISO date of the month. */
  from: string;
  to: string;
  phase: "past" | "current" | "future";
  /** Days in the month. */
  days: number;
  /** Today's day of the month in the current month; 0 before it, `days` after it. */
  day: number;
};
