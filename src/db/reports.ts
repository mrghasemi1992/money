import "server-only";

import { sql } from "drizzle-orm";

import type { AccountType } from "@/types/account";
import type { CategoryColor } from "@/types/category";
import type {
  AccountReportRow,
  CategoryReport,
  CategoryReportRow,
  DateRange,
  ReportTotals,
} from "@/types/report";

import { db } from "./index";
import { accounts, categories, transactions } from "./schema";

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
      s.type, s.top_id as id, p.name, p.color,
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
    group by s.type, s.top_id, p.name, p.color
    order by amount desc, p.name
  `);
  const report: CategoryReport = { income: [], expense: [] };
  for (const row of result.rows) {
    const item: CategoryReportRow = {
      id: row.id,
      name: row.name ?? "",
      color: row.color ?? "slate",
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

/**
 * Income and expense in each of `ranges` (the months of the viewer's calendar, as Gregorian
 * ranges), in one statement. The result follows the order of `ranges`, months without
 * transactions included.
 */
export async function rangeTotals(
  ranges: DateRange[],
): Promise<ReportTotals[]> {
  if (ranges.length === 0) return [];
  const values = sql.join(
    ranges.map(
      ({ from, to }, index) => sql`(${index}::int, ${from}::date, ${to}::date)`,
    ),
    sql`, `,
  );
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
