import "server-only";

import { sql } from "drizzle-orm";

import type { AccountType } from "@/types/account";
import type { CategoryColor, CategoryIcon } from "@/types/category";
import type {
  AccountReportRow,
  BudgetRecordRow,
  CategoryReport,
  CategoryReportRow,
  DateRange,
  LargeTransaction,
  RecurringExpense,
  ReportCategoryRef,
  ReportTotals,
} from "@/types/report";

import { db } from "./index";
import { accounts, budgets, categories, transactions } from "./schema";

/*
 * Totals of the shared book for the reports page. Only income and expense count, never
 * transfers, and every sum is taken in Postgres. Periods arrive as Gregorian ranges (from
 * monthRange): the calendar math stays in TypeScript. The page calls requireUser() first.
 */

/** Income and expense in two periods at once: the one shown and the one before it. */
export async function compareTotals(
  current: DateRange,
  previous: DateRange,
): Promise<{ current: ReportTotals; previous: ReportTotals }> {
  const sum = (type: "income" | "expense", { from, to }: DateRange) =>
    sql`coalesce(sum(amount) filter (where type = ${type} and date >= ${from} and date <= ${to}), 0)`;
  const result = await db.execute<{
    income: string;
    expense: string;
    previous_income: string;
    previous_expense: string;
  }>(sql`
    select
      ${sum("income", current)} as income,
      ${sum("expense", current)} as expense,
      ${sum("income", previous)} as previous_income,
      ${sum("expense", previous)} as previous_expense
    from ${transactions}
    where type in ('income', 'expense')
      and ((date >= ${current.from} and date <= ${current.to})
        or (date >= ${previous.from} and date <= ${previous.to}))
  `);
  const row = result.rows[0];
  return {
    current: { income: Number(row.income), expense: Number(row.expense) },
    previous: {
      income: Number(row.previous_income),
      expense: Number(row.previous_expense),
    },
  };
}

/**
 * Income and expense per top-level category in a period, in one statement: subcategories roll
 * up into their parent (`coalesce(parent_id, id)`) and are listed under it, most first.
 * Transactions without a category form one row with a null id. Archived categories count:
 * their history is still part of the period.
 */
export async function categoryTotals({
  from,
  to,
}: DateRange): Promise<CategoryReport> {
  const result = await db.execute<{
    type: "income" | "expense";
    id: string | null;
    name: string | null;
    color: CategoryColor | null;
    icon: CategoryIcon | null;
    amount: string;
    direct: string;
    subcategories: { id: string; name: string; amount: string }[];
  }>(sql`
    with sums as (
      select
        t.type,
        coalesce(c.parent_id, c.id) as top_id,
        case when c.parent_id is null then null else c.id end as sub_id,
        sum(t.amount) as amount
      from ${transactions} t
      left join ${categories} c on c.id = t.category_id
      where t.type in ('income', 'expense') and t.date >= ${from} and t.date <= ${to}
      group by 1, 2, 3
    )
    select
      s.type, s.top_id as id, p.name, p.color, p.icon,
      sum(s.amount) as amount,
      coalesce(sum(s.amount) filter (where s.sub_id is null), 0) as direct,
      coalesce(
        json_agg(
          json_build_object('id', s.sub_id, 'name', sub.name, 'amount', s.amount::text)
          order by s.amount desc, sub.name
        ) filter (where s.sub_id is not null),
        '[]'
      ) as subcategories
    from sums s
    left join ${categories} p on p.id = s.top_id
    left join ${categories} sub on sub.id = s.sub_id
    group by s.type, s.top_id, p.name, p.color, p.icon
    order by amount desc, p.name
  `);
  const report: CategoryReport = { income: [], expense: [] };
  for (const row of result.rows) {
    const item: CategoryReportRow = {
      id: row.id,
      name: row.name ?? "",
      color: row.color ?? "slate",
      icon: row.icon,
      amount: Number(row.amount),
      direct: Number(row.direct),
      subcategories: row.subcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        amount: Number(sub.amount),
      })),
    };
    report[row.type].push(item);
  }
  return report;
}

/** `ranges` as rows of a `values` list: (position, from_date, to_date), position 0 first. */
function rangeValues(ranges: DateRange[]) {
  return sql.join(
    ranges.map(
      ({ from, to }, index) => sql`(${index}::int, ${from}::date, ${to}::date)`,
    ),
    sql`, `,
  );
}

/**
 * Income and expense in each of `ranges` (the months of the viewer's calendar, as Gregorian
 * ranges), in one statement. The result follows the order of `ranges`, months without
 * transactions included.
 */
export async function rangeTotals(
  ranges: DateRange[],
): Promise<ReportTotals[]> {
  if (ranges.length === 0) return [];
  const values = rangeValues(ranges);
  const result = await db.execute<{
    position: number;
    income: string;
    expense: string;
  }>(sql`
    select
      r.position,
      coalesce(sum(t.amount) filter (where t.type = 'income'), 0) as income,
      coalesce(sum(t.amount) filter (where t.type = 'expense'), 0) as expense
    from (values ${values}) as r(position, from_date, to_date)
    left join ${transactions} t
      on t.type in ('income', 'expense') and t.date >= r.from_date and t.date <= r.to_date
    group by r.position
    order by r.position
  `);
  return result.rows.map((row) => ({
    income: Number(row.income),
    expense: Number(row.expense),
  }));
}

/** What was spent from each account in a period, most first. Accounts with none are left out. */
export async function accountExpenseTotals({
  from,
  to,
}: DateRange): Promise<AccountReportRow[]> {
  const result = await db.execute<{
    id: string;
    name: string;
    type: AccountType;
    amount: string;
  }>(sql`
    select a.id, a.name, a.type, sum(t.amount) as amount
    from ${transactions} t
    join ${accounts} a on a.id = t.account_id
    where t.type = 'expense' and t.date >= ${from} and t.date <= ${to}
    group by a.id, a.name, a.type, a.sort_order
    order by amount desc, a.sort_order
  `);
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    amount: Number(row.amount),
  }));
}

/** A category row of the insights' joins (c, with its parent p), as a transaction row names it. */
type CategoryColumns = {
  category_name: string | null;
  parent_name: string | null;
  category_color: CategoryColor | null;
  category_icon: CategoryIcon | null;
};

function categoryRef(row: CategoryColumns): ReportCategoryRef | null {
  if (row.category_name === null) return null;
  return {
    name: row.category_name,
    parentName: row.parent_name,
    color: row.category_color ?? "slate",
    icon: row.category_icon ?? "shapes",
  };
}

/**
 * Expense descriptions that appear in at least `minMonths` of `ranges` (the period's months),
 * in one statement. Descriptions are grouped folded: lowercase, Arabic «ي» «ى» «ك» as Persian,
 * ZWNJ and runs of spaces as one space, so «اسنپ» and «اسنپ » are one item. Each item keeps
 * the spelling and the category most of its rows have. The most months first, then the most
 * spent; at most `limit`.
 */
export async function recurringExpenses(
  ranges: DateRange[],
  minMonths: number,
  limit: number,
): Promise<RecurringExpense[]> {
  if (ranges.length === 0) return [];
  const result = await db.execute<
    CategoryColumns & {
      key: string;
      description: string;
      positions: number[];
      count: string;
      amount: string;
    }
  >(sql`
    with items as (
      select
        btrim(regexp_replace(
          translate(lower(t.description), ${"يىك‌"}, ${"ییک "}), ${"\\s+"}, ' ', 'g'
        )) as key,
        t.description, t.amount, t.category_id, r.position
      from (values ${rangeValues(ranges)}) as r(position, from_date, to_date)
      join ${transactions} t
        on t.type = 'expense' and t.date >= r.from_date and t.date <= r.to_date
      where t.description <> ''
    ),
    grouped as (
      select
        key,
        mode() within group (order by description) as description,
        mode() within group (order by category_id) as category_id,
        array_agg(distinct position order by position) as positions,
        count(*) as count,
        sum(amount) as amount
      from items
      where key <> ''
      group by key
      having count(distinct position) >= ${minMonths}
    )
    select
      g.key, g.description, g.positions, g.count, g.amount,
      c.name as category_name, p.name as parent_name,
      c.color as category_color, c.icon as category_icon
    from grouped g
    left join ${categories} c on c.id = g.category_id
    left join ${categories} p on p.id = c.parent_id
    order by cardinality(g.positions) desc, g.amount desc, g.key
    limit ${limit}
  `);
  return result.rows.map((row) => ({
    key: row.key,
    description: row.description,
    category: categoryRef(row),
    months: row.positions.map(Number),
    count: Number(row.count),
    amount: Number(row.amount),
  }));
}

/**
 * The `limit` largest expenses and the `limit` largest incomes of a period, in one statement:
 * largest first, ties to the latest. Each with its account and category (and the category's
 * parent for a subcategory).
 */
export async function largestTransactions(
  { from, to }: DateRange,
  limit: number,
): Promise<LargeTransaction[]> {
  const result = await db.execute<
    CategoryColumns & {
      id: string;
      type: "income" | "expense";
      date: string;
      amount: string;
      description: string;
      account: string;
      category_id: string | null;
    }
  >(sql`
    select * from (
      select
        t.id, t.type, t.date::text as date, t.amount, t.description,
        a.name as account, t.category_id,
        c.name as category_name, p.name as parent_name,
        c.color as category_color, c.icon as category_icon,
        row_number() over (
          partition by t.type order by t.amount desc, t.date desc, t.created_at desc, t.id
        ) as rank
      from ${transactions} t
      join ${accounts} a on a.id = t.account_id
      left join ${categories} c on c.id = t.category_id
      left join ${categories} p on p.id = c.parent_id
      where t.type in ('income', 'expense') and t.date >= ${from} and t.date <= ${to}
    ) ranked
    where rank <= ${limit}
    order by type, rank
  `);
  return result.rows.map((row) => {
    const category = categoryRef(row);
    return {
      id: row.id,
      type: row.type,
      date: row.date,
      amount: Number(row.amount),
      description: row.description,
      account: row.account,
      category:
        category && row.category_id
          ? { ...category, id: row.category_id }
          : null,
    };
  });
}

/**
 * Every budgeted category with what it spent in each of `ranges` (the period's months),
 * subcategories rolled up into their parent, in one statement. Only expenses count. Oldest
 * category first, as on the budgets page.
 */
export async function budgetRecord(
  ranges: DateRange[],
): Promise<BudgetRecordRow[]> {
  if (ranges.length === 0) return [];
  const result = await db.execute<{
    id: string;
    name: string;
    color: CategoryColor;
    icon: CategoryIcon;
    archived: boolean;
    budget: string;
    spent: { position: number; amount: string }[];
  }>(sql`
    with spent as (
      select r.position, coalesce(c.parent_id, c.id) as category_id, sum(t.amount) as amount
      from (values ${rangeValues(ranges)}) as r(position, from_date, to_date)
      join ${transactions} t
        on t.type = 'expense' and t.date >= r.from_date and t.date <= r.to_date
      join ${categories} c on c.id = t.category_id
      group by 1, 2
    )
    select
      c.id, c.name, c.color, c.icon, c.archived, b.amount as budget,
      coalesce(
        (select json_agg(json_build_object('position', s.position, 'amount', s.amount::text))
          from spent s where s.category_id = c.id),
        '[]'
      ) as spent
    from ${budgets} b
    join ${categories} c on c.id = b.category_id
    order by c.created_at, c.id
  `);
  return result.rows.map((row) => {
    const spent = ranges.map(() => 0);
    for (const item of row.spent) spent[item.position] = Number(item.amount);
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      icon: row.icon,
      archived: row.archived,
      budget: Number(row.budget),
      spent,
    };
  });
}
