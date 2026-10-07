import "server-only";

import { and, asc, eq, inArray, isNull, ne, or, sql } from "drizzle-orm";

import type {
  Category,
  CategoryColor,
  CategoryTree,
  CategoryType,
} from "@/types/category";

import { isUniqueViolation } from "./errors";
import { db } from "./index";
import { categories, transactions } from "./schema";

/*
 * Categories of the shared book: top-level categories with one optional level of
 * subcategories. The database enforces the shape (a subcategory's parent is a top-level
 * category of the same type, names are unique per type and parent, nothing in use can be
 * deleted); these functions add what it can't: case-insensitive names, the parent's color on
 * subcategories, and deleting a category together with its unused subcategories. The callers
 * check the role first.
 */

export type CategoryRecord = {
  id: string;
  type: CategoryType;
  parentId: string | null;
  name: string;
  color: CategoryColor;
  archived: boolean;
};

/** Every category, archived ones included, as a tree per type, oldest first. */
export async function listCategories(): Promise<CategoryTree> {
  const rows = await db
    .select({
      id: categories.id,
      type: categories.type,
      parentId: categories.parentId,
      name: categories.name,
      color: categories.color,
      archived: categories.archived,
      // Qualified: an unqualified "id" in the subquery would be the transaction's.
      transactionCount: sql<number>`(
        select count(*) from ${transactions} t
        where t.category_id = ${categories}.${sql.identifier("id")}
      )::int`.mapWith(Number),
    })
    .from(categories)
    .orderBy(asc(categories.createdAt), asc(categories.id));

  const tree: CategoryTree = { expense: [], income: [] };
  const parents = new Map<string, Category>();
  for (const row of rows) {
    if (row.parentId) continue;
    const category: Category = {
      id: row.id,
      type: row.type,
      name: row.name,
      color: row.color,
      archived: row.archived,
      transactionCount: row.transactionCount,
      subcategories: [],
    };
    parents.set(row.id, category);
    tree[row.type].push(category);
  }
  for (const row of rows) {
    if (!row.parentId) continue;
    parents.get(row.parentId)?.subcategories.push({
      id: row.id,
      name: row.name,
      archived: row.archived,
      transactionCount: row.transactionCount,
    });
  }
  return tree;
}

/** One category or subcategory, or null. */
export async function getCategory(id: string): Promise<CategoryRecord | null> {
  const [row] = await db
    .select({
      id: categories.id,
      type: categories.type,
      parentId: categories.parentId,
      name: categories.name,
      color: categories.color,
      archived: categories.archived,
    })
    .from(categories)
    .where(eq(categories.id, id));
  return row ?? null;
}

/**
 * Whether a sibling has this name, ignoring case: another top-level category of the type, or
 * another subcategory of the same parent.
 */
export async function categoryNameTaken(
  type: CategoryType,
  parentId: string | null,
  name: string,
  exceptId?: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.type, type),
        parentId
          ? eq(categories.parentId, parentId)
          : isNull(categories.parentId),
        eq(sql`lower(${categories.name})`, name.toLowerCase()),
        exceptId ? ne(categories.id, exceptId) : undefined,
      ),
    )
    .limit(1);
  return row !== undefined;
}

/** Adds a top-level category. Returns its id, or null when the name was taken meanwhile. */
export async function createCategory(input: {
  type: CategoryType;
  name: string;
  color: CategoryColor;
}): Promise<string | null> {
  try {
    const [row] = await db
      .insert(categories)
      .values(input)
      .returning({ id: categories.id });
    return row?.id ?? null;
  } catch (error) {
    if (isUniqueViolation(error)) return null;
    throw error;
  }
}

/**
 * Adds a subcategory with its parent's type and color, read in the same statement. Returns
 * its id, "missing" when the parent isn't a top-level category, or "taken" for a name its
 * parent already has.
 */
export async function createSubcategory(
  parentId: string,
  name: string,
): Promise<string | "missing" | "taken"> {
  try {
    const result = await db.execute<{ id: string }>(sql`
      insert into ${categories} (type, name, color, parent_id)
      select type, ${name}, color, id from ${categories}
        where id = ${parentId} and parent_id is null
      returning id
    `);
    return result.rows[0]?.id ?? "missing";
  } catch (error) {
    if (isUniqueViolation(error)) return "taken";
    throw error;
  }
}

/**
 * Renames a category or subcategory. A top-level category may also get a new color, which its
 * subcategories take too (same statement). Returns "ok", "missing" or "taken".
 */
export async function updateCategory(
  id: string,
  input: { name: string; color?: CategoryColor },
): Promise<"ok" | "missing" | "taken"> {
  try {
    const rows = input.color
      ? await db
          .update(categories)
          .set({
            name: sql`case when ${categories.id} = ${id} then ${input.name} else ${categories.name} end`,
            color: input.color,
          })
          .where(or(eq(categories.id, id), eq(categories.parentId, id)))
          .returning({ id: categories.id })
      : await db
          .update(categories)
          .set({ name: input.name })
          .where(eq(categories.id, id))
          .returning({ id: categories.id });
    return rows.length > 0 ? "ok" : "missing";
  } catch (error) {
    if (isUniqueViolation(error)) return "taken";
    throw error;
  }
}

/**
 * Archives or restores a category or subcategory. An archived category hides its
 * subcategories as well, without changing their own flag, so restoring it brings them back as
 * they were. Returns false when there is no such category.
 */
export async function setCategoryArchived(
  id: string,
  archived: boolean,
): Promise<boolean> {
  const rows = await db
    .update(categories)
    .set({ archived })
    .where(eq(categories.id, id))
    .returning({ id: categories.id });
  return rows.length > 0;
}

/**
 * Deletes categories (each with its subcategories) and subcategories, in one statement, but
 * only those whose whole family is unused: no transaction in the top-level category or any of
 * its subcategories. So a category is never deleted while a subcategory has transactions,
 * and a subcategory is only deleted when its family is unused too. Returns the ids deleted.
 * Budgets of a deleted category go with it (their foreign key cascades).
 */
export async function deleteCategories(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .delete(categories)
    .where(
      and(
        or(inArray(categories.id, ids), inArray(categories.parentId, ids)),
        sql`not exists (
          select 1 from ${transactions} t
          join ${categories} used on used.id = t.category_id
          where coalesce(used.parent_id, used.id)
            = coalesce(${categories.parentId}, ${categories.id})
        )`,
      ),
    )
    .returning({ id: categories.id });
  return rows.map((row) => row.id);
}

/**
 * Adds suggested categories with their subcategories, in one statement. A suggestion whose
 * name the type already has at the top level is skipped with its subcategories. They keep the
 * order given (their `created_at` grows by a microsecond each). Returns the ids of the
 * top-level categories added.
 */
export async function addCategoryTree(
  type: CategoryType,
  starters: {
    name: string;
    color: CategoryColor;
    subcategories: string[];
  }[],
): Promise<string[]> {
  if (starters.length === 0) return [];
  let position = 0;
  const rows = starters.flatMap((starter, index) => [
    sql`(${index}::int, null::int, ${starter.name}::text, ${starter.color}::text, ${position++}::int)`,
    ...starter.subcategories.map(
      (name) =>
        sql`(null::int, ${index}::int, ${name}::text, null::text, ${position++}::int)`,
    ),
  ]);
  const result = await db.execute<{ id: string }>(sql`
    with input (key, parent_key, name, color, position) as (
      values ${sql.join(rows, sql`, `)}
    ),
    parents as (
      insert into ${categories} (type, name, color, created_at)
      select ${type}, name, color, now() + position * interval '1 microsecond'
        from input where key is not null
        order by position
      on conflict do nothing
      returning id, name, color
    ),
    children as (
      insert into ${categories} (type, name, color, parent_id, created_at)
      select ${type}, child.name, parents.color, parents.id,
          now() + child.position * interval '1 microsecond'
        from input child
        join input parent on parent.key = child.parent_key
        join parents on parents.name = parent.name
      on conflict do nothing
      returning id
    )
    select id from parents
  `);
  return result.rows.map((row) => row.id);
}
