import { BudgetsSkeleton } from "@/components/budgets";

/** Shown inside the app shell while the budgets load. */
export default function Loading() {
  return <BudgetsSkeleton />;
}
