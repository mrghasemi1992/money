"use server";

import { refresh } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";

import { requireWrite } from "@/auth/session";
import { CATEGORY_NAME_MAX_LENGTH, CATEGORY_TYPES } from "@/constants/category";
import { STARTER_CATEGORIES } from "@/constants/starter-categories";
import {
  addCategoryTree,
  categoryNameTaken,
  createCategory as insertCategory,
  createSubcategory as insertSubcategory,
  deleteCategories,
  getCategory,
  listCategories,
  setCategoryArchived,
  updateCategory as saveCategory,
} from "@/db/categories";
import {
  categoryColorSchema,
  categoryNameError,
  categoryNameSchema,
} from "@/helpers/category";
import type { ActionResult } from "@/types/action";
import { formatNumber } from "@/utils/number";

/*
 * Category Server Actions (editors and admins). Each one calls requireWrite() first, validates
 * its input with Zod and returns errors as translated sentences. The rules of the shape (one
 * level of subcategories with the parent's type and color, names unique per type and parent,
 * delete only when unused) are checked here for a clear message and again by the database.
 */

type NameResult<Data extends object = object> = ActionResult<"name", Data>;

const idSchema = z.object({ id: z.uuid() });
const typeSchema = z.enum(CATEGORY_TYPES);
/** Most ids one delete takes: the starters added at once, for undo. */
const MAX_DELETE = 50;

async function nameError(name: unknown): Promise<NameResult & { ok: false }> {
  const t = await getTranslations("categories");
  const error = typeof name === "string" ? categoryNameError(name) : null;
  if (!error) return { ok: false, error: t("failed") };
  return {
    ok: false,
    field: "name",
    error: t(`form.errors.${error}`, {
      max: formatNumber(CATEGORY_NAME_MAX_LENGTH, await getLocale()),
    }),
  };
}

async function nameTaken(): Promise<NameResult & { ok: false }> {
  const t = await getTranslations("categories");
  return { ok: false, field: "name", error: t("form.errors.nameTaken") };
}

function nameOf(input: unknown): unknown {
  return typeof input === "object" && input !== null && "name" in input
    ? input.name
    : undefined;
}

/** Adds a top-level category. Returns its id (for undo). */
export async function createCategory(
  input: unknown,
): Promise<NameResult<{ id: string }>> {
  await requireWrite();
  const parsed = z
    .object({
      type: typeSchema,
      name: categoryNameSchema,
      color: categoryColorSchema,
    })
    .safeParse(input);
  if (!parsed.success) return nameError(nameOf(input));
  const { type, name } = parsed.data;
  if (await categoryNameTaken(type, null, name)) return nameTaken();

  const id = await insertCategory(parsed.data);
  if (!id) return nameTaken();
  refresh();
  return { ok: true, id };
}

/** Adds a subcategory under a top-level category; it takes the parent's type and color. */
export async function createSubcategory(
  input: unknown,
): Promise<NameResult<{ id: string }>> {
  await requireWrite();
  const t = await getTranslations("categories");
  const parsed = z
    .object({ parentId: z.uuid(), name: categoryNameSchema })
    .safeParse(input);
  if (!parsed.success) return nameError(nameOf(input));
  const { parentId, name } = parsed.data;

  const parent = await getCategory(parentId);
  // One level only: a subcategory can't have subcategories.
  if (!parent || parent.parentId) return { ok: false, error: t("failed") };
  if (await categoryNameTaken(parent.type, parentId, name)) return nameTaken();

  const result = await insertSubcategory(parentId, name);
  if (result === "taken") return nameTaken();
  if (result === "missing") return { ok: false, error: t("failed") };
  refresh();
  return { ok: true, id: result };
}

/**
 * Renames a category or subcategory. A top-level category may get a new color too, which its
 * subcategories take as well; a subcategory has no color of its own.
 */
export async function updateCategory(input: unknown): Promise<NameResult> {
  await requireWrite();
  const t = await getTranslations("categories");
  const parsed = idSchema
    .extend({ name: categoryNameSchema, color: categoryColorSchema.optional() })
    .safeParse(input);
  if (!parsed.success) return nameError(nameOf(input));
  const { id, name, color } = parsed.data;

  const category = await getCategory(id);
  if (!category) return { ok: false, error: t("failed") };
  if (await categoryNameTaken(category.type, category.parentId, name, id)) {
    return nameTaken();
  }
  const result = await saveCategory(id, {
    name,
    color: category.parentId ? undefined : color,
  });
  if (result === "taken") return nameTaken();
  if (result === "missing") return { ok: false, error: t("failed") };
  refresh();
  return { ok: true };
}

/** Archives a category or subcategory (hidden from forms, kept in reports) or restores it. */
export async function archiveCategory(input: unknown): Promise<ActionResult> {
  await requireWrite();
  const t = await getTranslations("categories");
  const parsed = idSchema.extend({ archived: z.boolean() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };
  if (!(await setCategoryArchived(parsed.data.id, parsed.data.archived))) {
    return { ok: false, error: t("failed") };
  }
  refresh();
  return { ok: true };
}

/**
 * Deletes categories (each with its subcategories) or subcategories that no transaction uses.
 * Several ids undo an «add all» of suggestions. If nothing could be deleted, the category is
 * in use: archive it instead.
 */
export async function deleteCategory(input: unknown): Promise<ActionResult> {
  await requireWrite();
  const t = await getTranslations("categories");
  const parsed = z
    .object({ ids: z.array(z.uuid()).min(1).max(MAX_DELETE) })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };
  const deleted = await deleteCategories(parsed.data.ids);
  if (deleted.length === 0) return { ok: false, error: t("inUse") };
  refresh();
  return { ok: true };
}

/**
 * Adds a category back with its subcategories after it was deleted (undo). Its id is new; it
 * had no transactions, so nothing pointed to the old one.
 */
export async function restoreCategory(
  input: unknown,
): Promise<NameResult<{ id: string }>> {
  await requireWrite();
  const t = await getTranslations("categories");
  const parsed = z
    .object({
      type: typeSchema,
      name: categoryNameSchema,
      color: categoryColorSchema,
      subcategories: z.array(categoryNameSchema).max(MAX_DELETE),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };
  const { type, ...category } = parsed.data;
  if (await categoryNameTaken(type, null, category.name)) return nameTaken();

  const [id] = await addCategoryTree(type, [category]);
  if (!id) return nameTaken();
  refresh();
  return { ok: true, id };
}

/**
 * Adds suggested categories (STARTER_CATEGORIES) with their subcategories, named in the
 * acting user's language: the ones picked by `keys`, or all of them. Suggestions whose name
 * the type already has are skipped. Returns the ids added (for undo).
 */
export async function addStarterCategories(
  input: unknown,
): Promise<ActionResult<never, { ids: string[] }>> {
  await requireWrite();
  const t = await getTranslations("categories");
  const parsed = z
    .object({
      type: typeSchema,
      keys: z.array(z.string().max(40)).max(MAX_DELETE).optional(),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };
  const { type, keys } = parsed.data;
  const locale = await getLocale();

  const existing = new Set(
    (await listCategories())[type].map((category) =>
      category.name.toLowerCase(),
    ),
  );
  const starters = STARTER_CATEGORIES[type]
    .filter((starter) => !keys || keys.includes(starter.key))
    .map((starter) => ({
      name: starter.name[locale],
      color: starter.color,
      subcategories: starter.subcategories.map((name) => name[locale]),
    }))
    .filter((starter) => !existing.has(starter.name.toLowerCase()));

  const ids = await addCategoryTree(type, starters);
  refresh();
  return { ok: true, ids };
}
