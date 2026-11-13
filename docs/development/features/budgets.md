# Budgets

A budget is a monthly spending limit for a top-level expense category. It repeats every month of the viewer's calendar; spending in subcategories counts toward their parent. The budgets page shows a month's spending against each limit, and the categories without one.

[Architecture](../architecture.md) explains how the pieces fit together; [conventions](../conventions.md) the rules for writing code.

## Where the code is

| Part                        | Where                                                                          |
| --------------------------- | ------------------------------------------------------------------------------ |
| Page and Server Actions     | `src/app/(app)/budgets/page.tsx`, `actions.ts`                                 |
| UI                          | `src/components/budgets/`, `budget-summary/`, `budget-list/`, `budget-dialog/` |
| Queries                     | `src/db/budgets.ts`                                                            |
| Rules (month, status, form) | `src/helpers/budget.ts`                                                        |

## How it works

1. **One budget per top-level expense category:** a monthly limit that repeats every month of the viewer's calendar.
2. **Reading:** the page resolves the month from the URL in the viewer's calendar, then one SQL statement reads every top-level expense category with its budget and that month's spending, subcategories rolled up into their parent (`coalesce(parent_id, id)`). Transfers and income never count.
3. **Status** comes from `getBudgetStatus`: within, near the limit from 80%, or over. Each is shown in words and with an icon or stripes, not by color alone.
4. **Writing:** setting a budget is one upsert (`saveBudget`); removing one returns what it removed, so the toast can undo it.

## Details

`/budgets` (`Budgets` in `src/components/budgets`, page in `src/app/(app)/budgets/page.tsx`). Every role reads; viewers get no set, edit or remove controls and a «فقط مشاهده» badge.

- A budget is a monthly limit for a top-level expense category (one per category), repeating every month of the viewer's calendar. Subcategory spending counts toward its parent; transfers and income never count.
- **Month:** `?month=YYYY-MM`, read with the transactions page's `parseMonthParam`. `resolveBudgetMonth` (`src/helpers/budget.ts`) makes it a month of the viewer's calendar (a month of the other calendar becomes the viewer's month around its middle) with its Gregorian range (`monthRange`), its phase (past, current, future) and today's day in it. No param is the current month; the switcher drops the param there, goes into future months too (nothing spent yet), and «ماه جاری» / «This month» returns.
- **Query:** `listBudgetCategories(from, to)` (`src/db/budgets.ts`, server-only) reads every top-level expense category with its budget, its active subcategories' names and its expenses in the range in one SQL statement: expense transactions only, grouped by `coalesce(parent_id, id)` so subcategories roll up into their parent. The page's totals are the budgeted rows added up.
- **Writes:** `saveBudget` adds or changes a budget in one statement (`insert … select` from a top-level expense category that is active or already has a budget, `on conflict (category_id) do update`; `xmax = 0` tells whether it is new); `deleteBudget` returns what it removed, for undo. The Server Actions (`src/app/(app)/budgets/actions.ts`) call `requireWrite()` and validate with `budgetSchema` (shared with the form; messages are keys of `budgets.form.errors`). Setting a new budget and removing one offer «واگرد»; changing one shows «بودجه … ذخیره شد».
- **Page:** `BudgetSummary` (spent in the month, total budget, remaining or over, one bar for all of it with a line for today in the current month: ProgressBar's `marker`), `BudgetList` (most used first: chip, bar, percent, spent of limit, status; a table from 56rem of list width, cards below; each row links to `/transactions?month=…&category=…` through `budgetTransactionsHref`, and writers get an edit button), `UnbudgetedList` (active expense categories without a budget, what they spent, «تعیین بودجه»), `BudgetDialog` (category, fixed when editing; monthly limit; a note naming the subcategories that count; «حذف بودجه» opens a ConfirmDialog over it). The empty state follows the role; without expense categories it links to `/categories`.
- A budget whose category is archived keeps its row (marked «بایگانی‌شده») and can be changed or removed; an archived category can't get a new budget.
