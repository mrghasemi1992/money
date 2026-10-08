"use server";

import { refresh } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { requireWrite } from "@/auth/session";
import {
  deleteBudget as removeBudget,
  saveBudget as storeBudget,
} from "@/db/budgets";
import { type BudgetField, budgetErrors, budgetSchema } from "@/helpers/budget";
import type { ActionResult } from "@/types/action";
import type { BudgetInput } from "@/types/budget";

/*
 * Budget Server Actions (editors and admins). Each one calls requireWrite() first, validates
 * its input with Zod and returns errors as translated sentences, on their field. Whether the
 * category may have a budget (a top-level expense category, not archived) is checked in the
 * statement that writes.
 */

/**
 * Sets a category's monthly limit: adds its budget or changes the amount. Returns whether
 * the budget is new (adding offers «واگرد»).
 */
export async function saveBudget(
  input: unknown,
): Promise<ActionResult<BudgetField, { created: boolean }>> {
  await requireWrite();
  const t = await getTranslations("budgets");
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) {
    const errors = budgetErrors(input) ?? {};
    const field: BudgetField = errors.categoryId ? "categoryId" : "amount";
    const error = errors[field];
    return error
      ? { ok: false, field, error: t(`form.errors.${error}`) }
      : { ok: false, error: t("failed") };
  }

  const result = await storeBudget(parsed.data);
  if (result === "missing") {
    return {
      ok: false,
      field: "categoryId",
      error: t("form.errors.categoryUnavailable"),
    };
  }
  refresh();
  return { ok: true, created: result.created };
}

/** Removes a category's budget. Returns what it stored, so the toast can undo it. */
export async function deleteBudget(
  input: unknown,
): Promise<ActionResult<never, { deleted: BudgetInput }>> {
  await requireWrite();
  const t = await getTranslations("budgets");
  const parsed = z.object({ categoryId: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };
  const deleted = await removeBudget(parsed.data.categoryId);
  if (!deleted) return { ok: false, error: t("missing") };
  refresh();
  return { ok: true, deleted };
}
