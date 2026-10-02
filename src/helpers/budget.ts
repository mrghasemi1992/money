export type BudgetStatus = "ok" | "near" | "over";

/** From this share of the budget on, a category is «near the limit». */
export const BUDGET_NEAR_RATIO = 0.85;

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
