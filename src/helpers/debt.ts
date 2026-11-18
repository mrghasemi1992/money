import type { DEBT_ACTIONS } from "@/constants/transaction";
import type { TransactionFormValues } from "@/types/transaction";

/** What happened with a person or lender: lent, borrowed, paid back to the book, paid back. */
export type DebtAction = (typeof DEBT_ACTIONS)[number];

/** Whether the action raises what the person owes the book: money goes to them. */
export function raisesTheirDebt(action: DebtAction): boolean {
  return action === "lend" || action === "repay";
}

/**
 * How a loan or repayment with a person is stored (#47). With one of the book's accounts, money
 * moved, so it is a transfer between that account and the person: to them when lending or
 * paying back, from them when borrowing or being paid back. Without one (a debt from before, or
 * settled outside the book's accounts), only the person's balance changes: a receivable when it
 * raises what they owe, a payable when it lowers it. Pure, so the form and tests share it.
 */
export function debtEntry(
  action: DebtAction,
  personId: string,
  moneyAccountId: string | null,
): Pick<TransactionFormValues, "type" | "accountId" | "toAccountId"> {
  const toThem = raisesTheirDebt(action);
  if (moneyAccountId === null) {
    return {
      type: toThem ? "receivable" : "payable",
      accountId: personId,
      toAccountId: null,
    };
  }
  return toThem
    ? { type: "transfer", accountId: moneyAccountId, toAccountId: personId }
    : { type: "transfer", accountId: personId, toAccountId: moneyAccountId };
}

/**
 * The form fields a stored entry's person and account errors belong to: which of `accountId`
 * and `toAccountId` holds the person, and which the book's account.
 */
export function debtFields(
  action: DebtAction,
  moneyAccountId: string | null,
): { person: "accountId" | "toAccountId"; money: "accountId" | "toAccountId" } {
  if (moneyAccountId !== null && raisesTheirDebt(action)) {
    return { person: "toAccountId", money: "accountId" };
  }
  return { person: "accountId", money: "toAccountId" };
}
