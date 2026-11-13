# Dashboard

The dashboard (`/`) is the home page: account balances, this month's totals, recent transactions, the budgets closest to their limit, top spending, and a notice about unknown transactions. An empty book shows first-run steps instead.

[Architecture](../architecture.md) explains how the pieces fit together; [conventions](../conventions.md) the rules for writing code.

## Where the code is

| Part                                 | Where                                                                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Page (sections stream in separately) | `src/app/(app)/(dashboard)/page.tsx`, `loading.tsx`                                                                                   |
| Layout                               | `src/components/dashboard/`                                                                                                           |
| Sections                             | `src/components/balance-overview/`, `month-overview/`, `recent-transactions/`, `budget-progress/`, `top-spending/`, `unknown-notice/` |
| Empty book                           | `src/components/first-run/`                                                                                                           |
| Queries                              | `src/db/dashboard.ts`, plus the transaction, budget and report queries                                                                |
| Rules                                | `src/helpers/dashboard.ts`, `src/constants/dashboard.ts`                                                                              |

## How it works

1. **First run:** the page first reads `getBookProgress`. Until the book has accounts and transactions it shows setup steps (for editors and admins) or a short note (for viewers).
2. **Sections stream:** otherwise every section is its own async Server Component inside `<Suspense>` with a matching skeleton, so the queries run in parallel and a slow one holds up only its card.
3. **No queries of its own** beyond the progress check: the sections reuse the account, transaction, budget and report queries for the viewer's current month.
4. **The unknown-transactions notice** can be closed; the cookie remembers what it said, and a new unknown transaction brings it back.

## Details

`/` (page in `src/app/(app)/(dashboard)/page.tsx`, in its own route group so its `loading.tsx` (`DashboardSkeleton`) covers only the dashboard; layout `Dashboard` in `src/components/dashboard`). Every role reads; the header greets by first name («سلام، سارا», `firstName` in `src/utils/text.ts`) with today's date, and writers get «افزودن تراکنش».

- **First run:** the page first reads `getBookProgress(userId)` (`src/db/dashboard.ts`: whether the book has accounts, categories and transactions and whether this user has connected Claude, one statement). Until the book has accounts and transactions it shows `FirstRun` instead («خوش آمدید، …»): editors and admins get four steps (accounts → `/accounts`, categories → `/categories`, a first transaction through the add form, blocked until there is an account, Claude → `/settings/connector`), each marked done from the progress, the next open one primary; viewers get a short note.
- **Sections stream:** after that every section is an async Server Component in the page file with its own `<Suspense>` and skeleton (`…Skeleton` from each component), so the queries run in parallel and a slow one holds up only its card. «This month» is the viewer's current month (`resolveBudgetMonth(null, …)`, a Gregorian range).
  - `UnknownNotice`: «۳ تراکنش ناشناس دارید» when the book has unknown transactions (`unknownTransactionSummary`: count and oldest date), linking to `/transactions?from=<oldest>&unknown=1` (`unknownTransactionsHref`). No fallback: it appears when it has something to say. It has a close button: closing saves what the notice said (`unknownNoticeKey`: the count and the newest unknown transaction's `created_at`) in the `money-unknown-closed` cookie on that device (`UNKNOWN_NOTICE_COOKIE`), and the server leaves the notice out while the cookie matches, so it never flashes; a new unknown transaction changes the key and the notice returns.
  - `BalanceOverview`: the royal card (the screen's one brand card) with the total of the active accounts and a tile per account (`listAccounts`), scrolling sideways, edge to edge on phones.
  - `MonthOverview`: income, expense and net of the month (`transactionTotals`).
  - `RecentTransactions`: the last 8 (`listTransactions` without filters, `DASHBOARD_RECENT_COUNT`), compact rows with `TransactionTile` and `TransactionTitle` (shared with the transactions list), then the description, account and day; a row opens `TransactionDetail` read only, changes happen on `/transactions`.
  - `BudgetProgress`: the 4 budgets closest to or over their limit (`listBudgetCategories` + `closestBudgets`), each a `ProgressBar`; without budgets a note (and «تعیین بودجه» for writers).
  - `TopSpending`: the month's expenses by top-level category (`categoryTotals`), the 4 largest plus «سایر» (`spendingSlices`, `DASHBOARD_SPENDING_SLICES`), as one stacked bar in the categories' hues and a list with amounts and shares; links to `/reports/breakdown?month=…` (`monthReportHref`).
- Sizes are `--dashboard-*` tokens; the layout is two flex rows (balance beside this month, recent beside budgets and spending) that stack below their minimum widths.
