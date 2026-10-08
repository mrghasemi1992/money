import type { CategoryColor } from "./category";

/** How far the book is set up, for the dashboard's first-run steps. */
export type BookProgress = {
  hasAccounts: boolean;
  hasCategories: boolean;
  hasTransactions: boolean;
  /** The viewing user has allowed Claude (or another connector client). */
  connectedClaude: boolean;
};

/** A slice of the month's spending: a top-level category, «سایر» or «بدون دسته‌بندی». */
export type SpendingSlice = {
  /** The category's id; null for «سایر» (the rest) and «بدون دسته‌بندی». */
  id: string | null;
  kind: "category" | "uncategorized" | "other";
  name: string;
  color: CategoryColor;
  /** In the book currency's smallest unit. */
  amount: number;
};
