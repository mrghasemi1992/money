"use server";

import { refresh } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";

import { requireWrite } from "@/auth/session";
import { ACCOUNT_NAME_MAX_LENGTH } from "@/constants/account";
import {
  accountNameTaken,
  createAccount as insertAccount,
  deleteAccount as removeAccount,
  reorderAccounts as saveAccountOrder,
  setAccountArchived,
  updateAccount as saveAccount,
} from "@/db/accounts";
import { accountFormError, accountSchema } from "@/helpers/account";
import type { AccountField } from "@/types/account";
import type { ActionResult } from "@/types/action";
import { formatNumber } from "@/utils/number";

/*
 * Account Server Actions (editors and admins). Each one calls requireWrite() first, validates
 * its input with Zod and returns errors as translated sentences. The list's order, the
 * archived flag and «in use» are all checked again in the statements that write.
 */

const idSchema = z.object({ id: z.uuid() });

/** The translated error for an invalid account form, on its field. */
async function formError(
  input: unknown,
): Promise<ActionResult<AccountField> & { ok: false }> {
  const t = await getTranslations("accounts");
  const found = accountFormError(input);
  if (!found) return { ok: false, error: t("failed") };
  return {
    ok: false,
    field: found.field,
    error: t(`form.errors.${found.key}`, {
      max: formatNumber(ACCOUNT_NAME_MAX_LENGTH, await getLocale()),
    }),
  };
}

/** Adds an account at the end of the list. Returns its id (for undo). */
export async function createAccount(
  input: unknown,
): Promise<ActionResult<AccountField, { id: string }>> {
  await requireWrite();
  const t = await getTranslations("accounts");
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) return formError(input);
  const taken = {
    ok: false,
    field: "name",
    error: t("form.errors.nameTaken"),
  } as const;
  if (await accountNameTaken(parsed.data.name)) return taken;

  const id = await insertAccount(parsed.data);
  if (!id) return taken;
  refresh();
  return { ok: true, id };
}

/** Changes an account's name, type and opening balance. */
export async function updateAccount(
  input: unknown,
): Promise<ActionResult<AccountField>> {
  await requireWrite();
  const t = await getTranslations("accounts");
  const parsed = accountSchema.extend(idSchema.shape).safeParse(input);
  if (!parsed.success) return formError(input);
  const { id, ...account } = parsed.data;
  const taken = {
    ok: false,
    field: "name",
    error: t("form.errors.nameTaken"),
  } as const;
  if (await accountNameTaken(account.name, id)) return taken;

  const result = await saveAccount(id, account);
  if (result === "taken") return taken;
  if (result === "missing") return { ok: false, error: t("failed") };
  refresh();
  return { ok: true };
}

/** Archives an account (hidden from forms, history kept) or restores it. */
export async function archiveAccount(input: unknown): Promise<ActionResult> {
  await requireWrite();
  const t = await getTranslations("accounts");
  const parsed = idSchema.extend({ archived: z.boolean() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };
  if (!(await setAccountArchived(parsed.data.id, parsed.data.archived))) {
    return { ok: false, error: t("failed") };
  }
  refresh();
  return { ok: true };
}

/** Deletes an account without transactions. One with transactions can only be archived. */
export async function deleteAccount(input: unknown): Promise<ActionResult> {
  await requireWrite();
  const t = await getTranslations("accounts");
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };
  if (!(await removeAccount(parsed.data.id))) {
    return { ok: false, error: t("inUse") };
  }
  refresh();
  return { ok: true };
}

/** Saves the order of the active accounts, as the list shows it after a move. */
export async function reorderAccounts(input: unknown): Promise<ActionResult> {
  await requireWrite();
  const t = await getTranslations("accounts");
  const parsed = z
    .object({ ids: z.array(z.uuid()).min(1).max(500) })
    .refine(({ ids }) => new Set(ids).size === ids.length)
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };
  await saveAccountOrder(parsed.data.ids);
  refresh();
  return { ok: true };
}
