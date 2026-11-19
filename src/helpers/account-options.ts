import type { SelectOption } from "@/components/ui/select";
import { ACCOUNT_TYPE_ICONS } from "@/constants/account-icons";
import type { AccountOption } from "@/types/transaction";

/**
 * Accounts as Select options, in their saved order: the book's own money first, then the people
 * and lenders (counterparties, #47) after a line. Archived accounts are left out, except the ids
 * in `keep` (what an edited transaction or a filter already uses).
 */
export function accountSelectOptions(
  accounts: AccountOption[],
  keep: (string | null | undefined)[] = [],
): SelectOption[] {
  const shown = accounts.filter(
    (account) => !account.archived || keep.includes(account.id),
  );
  const money = shown.filter((account) => account.type !== "counterparty");
  const counterparties = shown.filter(
    (account) => account.type === "counterparty",
  );
  return [...money, ...counterparties].map((account, index) => ({
    value: account.id,
    label: account.name,
    icon: ACCOUNT_TYPE_ICONS[account.type],
    separatorBefore: index === money.length && index > 0,
  }));
}
