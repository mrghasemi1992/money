# Loans and debts

«طلب و بدهی» / “Loans and debts” (#47) tracks what people owe the book and what the book owes them: money lent to a friend, borrowed from family, or a bank loan paid back in installments. Each person or lender is an account of type `counterparty`, and money lent, borrowed or repaid moves between it and the book's own accounts as a **transfer**, so it is never income or expense. Why this model and not new transaction types: [decision 17](../decisions.md#17-loans-and-debts-are-transfers-to-counterparty-accounts).

[Architecture](../architecture.md) explains how the pieces fit together; [conventions](../conventions.md) the rules for writing code.

## Where the code is

| Part               | Where                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Page               | `src/app/(app)/debts/` (`page.tsx`, `loading.tsx`, `error.tsx`); it uses the accounts page's Server Actions (`../accounts/actions`) |
| UI                 | `AccountSettings`, `AccountList` and `AccountDialog` with `kind="counterparty"`                                                     |
| Rules              | `src/helpers/account.ts` (`isCounterparty`, `accountKind`, `debtStatus`, `debtTotals`), `src/helpers/account-options.ts`            |
| Data               | `accounts.type = 'counterparty'`, `accounts.opening_date` (migration `0012`)                                                        |
| Claude and ChatGPT | `list_accounts` in `src/mcp/tools.ts`, the loans paragraph in `src/mcp/instructions.ts`                                             |

## How it works

1. **A person or lender is an account** of type `counterparty` (`ACCOUNT_TYPES`; the book's own kinds are `MONEY_ACCOUNT_TYPES`). Names are unique across all accounts. It has no identifier and is listed on `/debts`, not `/accounts`.
2. **Its balance is what is owed**, from the same `accountBalance()` as every account: positive means they owe the book, negative that the book owes them (`debtStatus`). No new SQL: lending is a transfer to them (+), borrowing or being repaid a transfer from them (−), repaying them a transfer to them (+).
3. **Nothing about a loan is income or expense.** Transfers are already left out of totals, budgets and reports, and so are these.
4. **Real costs still count:** when a person pays for the book (Ali paid for dinner), it is an expense from the person's account with the real category, which also makes the book owe them; a forgiven debt is an expense from their account (a gifts category); loan interest is an expense, and the principal of an installment a transfer.
5. **A debt from before the book** with no transaction of its own is the counterparty's opening balance, entered as who owed whom and an amount (saved positive or negative), with an optional date it started (`opening_date`, counterparties only; shown as «از شهریور ۱۴۰۴» / “since Shahrivar 1404”).

## Details

- **Page** (`/debts`, nav item «طلب و بدهی» in the `book` group after accounts, `HandCoinsIcon`): every role reads; viewers get no write controls. `AccountSettings kind="counterparty"` shows the net, what is owed to the book and what it owes (`debtTotals`, summed from the balances SQL computed, like the accounts page's total), a note that loans are transfers, the people and lenders in their order (drag or the row menu), archived ones, and the same add, edit, archive and delete dialogs with the `debts` messages. Each row's quiet line is the status («طلب دارید», «بدهکارید», «تسویه»), the since date when there is a debt and one, and the transaction count. The row menu's «مشاهده تراکنش‌ها» opens `/transactions?account=<id>&from=<oldest>` (`accountTransactionsHref`, `firstDate` from `accountFirstDate()`), on both pages.
- **Form** (`AccountDialog kind="counterparty"`): name, «از قبل» (who owed whom: «به من بدهکار است» / «به او بدهکارم»), the amount (positive; empty is 0) and, when there is an amount, «از تاریخ» (a DatePicker up to today with a button that removes the date). The type and identifier aren't shown.
- **Elsewhere:** the transaction form's and the filter's account pickers list the book's accounts first and the counterparties after a line, with a person icon (`accountSelectOptions`); the form's default account is never a counterparty. `/accounts`, the dashboard's balances and `list_accounts`' `total_balance` leave counterparties out; the dashboard's first-run steps need an account of the book's own money (`getBookProgress`). Reports' spending by account shows a counterparty when someone paid for the book. The CSV import matches person names like account names.
- **Claude and ChatGPT:** `list_accounts` lists counterparties with `type: "counterparty"`, their balance and `owed_since`, plus `owed_to_user` and `owed_by_user`. The instructions say lending, borrowing and repaying are transfers with the counterparty, never «قرض و بدهی» or «طلب» categories; that a payment someone made for the user is an expense from their account; that an installment's interest is an expense; and to ask the user to add a missing person on the page, since the tools can't create accounts.
- **Existing «قرض و بدهی» and «طلب» transactions** aren't migrated: the data doesn't say who the other side was. Editing one into a transfer to the right person moves it out of expenses; the categories can then be archived.
- **Not yet:** interest calculation, installment schedules and reminders, splitting one transaction into principal and interest, a currency per person.
