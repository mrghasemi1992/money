import type { TransactionFormValues } from "@/types/transaction";

/**
 * Who owes whom after a «طلب و بدهی» entry: «طلب دارم» raises what the person owes the book,
 * «بدهکارم» what the book owes them. Named after the types it saves without an account.
 */
export type DebtDirection = "receivable" | "payable";

/**
 * How an entry of the form's «طلب و بدهی» tab is stored (#47). With one of the book's accounts,
 * money moved: a transfer from that account to the person («طلب دارم»: lent to them, or paid
 * them back) or from the person to it («بدهکارم»: borrowed, or paid back by them). With «بدون
 * حساب» (a debt from before, or settled outside the book's accounts), only the person's balance
 * changes: a receivable or a payable. Pure, so the form and tests share it.
 */
export function debtEntry(
  direction: DebtDirection,
  personId: string,
  moneyAccountId: string | null,
): Pick<TransactionFormValues, "type" | "accountId" | "toAccountId"> {
  if (moneyAccountId === null) {
    return { type: direction, accountId: personId, toAccountId: null };
  }
  return direction === "receivable"
    ? { type: "transfer", accountId: moneyAccountId, toAccountId: personId }
    : { type: "transfer", accountId: personId, toAccountId: moneyAccountId };
}

/**
 * Which of a stored entry's `accountId` and `toAccountId` holds the person and which the book's
 * account, so errors land on the right field.
 */
export function debtFields(
  direction: DebtDirection,
  moneyAccountId: string | null,
): { person: "accountId" | "toAccountId"; money: "accountId" | "toAccountId" } {
  return moneyAccountId !== null && direction === "receivable"
    ? { person: "toAccountId", money: "accountId" }
    : { person: "accountId", money: "toAccountId" };
}

/** A stored transaction as a «طلب و بدهی» entry: what the tab shows when editing it. */
export type DebtDraft = {
  direction: DebtDirection;
  personId: string;
  /** One of the book's accounts, or null for «بدون حساب». */
  moneyAccountId: string | null;
};

/**
 * Reads a stored transaction back as a «طلب و بدهی» entry, the reverse of `debtEntry`: a
 * receivable or payable, or a transfer between one of the book's accounts and one person.
 * Null for anything else (a transfer between two of the book's accounts, or two people).
 */
export function debtDraftOf(
  transaction: Pick<
    TransactionFormValues,
    "type" | "accountId" | "toAccountId"
  >,
  isCounterparty: (accountId: string) => boolean,
): DebtDraft | null {
  const { type, accountId, toAccountId } = transaction;
  if (type === "receivable" || type === "payable") {
    return { direction: type, personId: accountId, moneyAccountId: null };
  }
  if (type !== "transfer" || !toAccountId) return null;
  const fromPerson = isCounterparty(accountId);
  const toPerson = isCounterparty(toAccountId);
  if (fromPerson === toPerson) return null;
  return toPerson
    ? {
        direction: "receivable",
        personId: toAccountId,
        moneyAccountId: accountId,
      }
    : {
        direction: "payable",
        personId: accountId,
        moneyAccountId: toAccountId,
      };
}
