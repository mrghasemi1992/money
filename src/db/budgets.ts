import "server-only";

import { sql } from "drizzle-orm";

import type { BudgetCategory, BudgetInput } from "@/types/budget";
import type { CategoryColor } from "@/types/category";

import { db } from "./index";
import { budgets, categories, transactions } from "./schema";

/*
 * Budgets of the shared book: a monthly limit per top-level expense category, repeating
 * every month of the viewer's calendar. The database only accepts a top-level expense
 * category and one budget per category (see the schema); these functions add the archived
 * check and the month's spending. The callers check the role first.
 */

/**
 * Every top-level expense category with its budget and its expenses between `from` and `to`
 * (ISO dates, a month's Gregorian range), subcategories rolled up into their parent, in one
 * statement. Only expense transactions count, so transfers never do. Oldest category first.
 */
export async function listBudgetCategories(
  from: string,
  to: string,
): Promise<BudgetCategory[]> {
  const result = await db.execute<{
    id: string;
    name: string;
    color: CategoryColor;
    archived: boolean;
    subcategories: string[];
    spent: string;
    budget: string | null;
  }>(sql`
    with spent as (
      select coalesce(c.parent_id, c.id) as category_id, sum(t.amount) as amount
      from ${transactions} t
      join ${categories} c on c.id = t.category_id
      where t.type = 'expense' and t.date >= ${from} and t.date <= ${to}
      group by 1
    )
    select
      c.id, c.name, c.color, c.archived,
      coalesce(
        (select array_agg(s.name order by s.created_at, s.id) from ${categories} s
          where s.parent_id = c.id and not s.archived),
        '{}'
      ) as subcategories,
      coalesce(spent.amount, 0) as spent,
      b.amount as budget
    from ${categories} c
    left join ${budgets} b on b.category_id = c.id
    left join spent on spent.category_id = c.id
    where c.type = 'expense' and c.parent_id is null
    order by c.created_at, c.id
  `);
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    archived: row.archived,
    subcategories: row.subcategories,
    spent: Number(row.spent),
    budget: row.budget === null ? null : Number(row.budget),
  }));
}

/**
 * Sets a category's monthly limit, adding the budget or changing it. The category must be a
 * top-level expense category, and active unless it already has a budget (checked in the same
 * statement). Returns whether the budget is new, or "missing" when the category can't have one.
 */
export async function saveBudget({
  categoryId,
  amount,
}: BudgetInput): Promise<{ created: boolean } | "missing"> {
  const result = await db.execute<{ created: boolean }>(sql`
    insert into ${budgets} (category_id, amount)
    select c.id, ${amount}::bigint from ${categories} c
      where c.id = ${categoryId} and c.type = 'expense' and c.parent_id is null
        and (not c.archived or exists (select 1 from ${budgets} b where b.category_id = c.id))
    on conflict (category_id) do update set amount = excluded.amount, updated_at = now()
    returning (xmax = 0) as created
  `);
  const row = result.rows[0];
  return row ? { created: row.created } : "missing";
}

/** Removes a category's budget. Returns what it stored (for undo), or null when there was none. */
export async function deleteBudget(
  categoryId: string,
): Promise<BudgetInput | null> {
  const result = await db.execute<{ category_id: string; amount: string }>(sql`
    delete from ${budgets} where category_id = ${categoryId}
    returning category_id, amount
  `);
  const row = result.rows[0];
  return row
    ? { categoryId: row.category_id, amount: Number(row.amount) }
    : null;
}
