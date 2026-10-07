"use server";

import { refresh } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";

import { requireUser, requireWrite } from "@/auth/session";
import {
  TRANSACTION_DESCRIPTION_MAX_LENGTH,
  TRANSACTION_NOTE_MAX_LENGTH,
  TRANSACTION_TAG_MAX_LENGTH,
  TRANSACTION_TAGS_MAX,
} from "@/constants/transaction";
import {
  checkTransactionReferences,
  createTransaction as insertTransaction,
  deleteTransaction as removeTransaction,
  getTransactionInput,
  listTransactions,
  updateTransaction as saveTransaction,
} from "@/db/transactions";
import {
  type TransactionError,
  type TransactionField,
  transactionErrors,
  transactionSchema,
} from "@/helpers/transaction";
import {
  parseTransactionParams,
  resolveTransactionPeriod,
  toTransactionFilters,
} from "@/helpers/transaction-filters";
import { getPreferences } from "@/i18n/preferences";
import type { ActionResult } from "@/types/action";
import type { TransactionInput, TransactionPage } from "@/types/transaction";
import { todayIso } from "@/utils/iso-date";
import { formatNumber } from "@/utils/number";

/*
 * Transaction Server Actions. Writes (editors and admins) call requireWrite() first, so a
 * viewer gets an error even when calling them directly; reading more of the list calls
 * requireUser(). Input is validated with the form's Zod schema, then the accounts and the
 * category are checked in the database. Errors come back translated, on their field.
 */

type FormResult<Data extends object = object> = ActionResult<
  TransactionField,
  Data
>;

const idSchema = z.object({ id: z.uuid() });

/** Rows loadTransactions returns at most in one call (pages already shown, reloaded). */
const MAX_RELOAD_ROWS = 1000;

async function fieldError(
  field: TransactionField,
  error: TransactionError,
): Promise<FormResult & { ok: false }> {
  const t = await getTranslations("transactions.form.errors");
  const locale = await getLocale();
  return {
    ok: false,
    field,
    error: t(error, {
      description: formatNumber(TRANSACTION_DESCRIPTION_MAX_LENGTH, locale),
      note: formatNumber(TRANSACTION_NOTE_MAX_LENGTH, locale),
      tag: formatNumber(TRANSACTION_TAG_MAX_LENGTH, locale),
      tags: formatNumber(TRANSACTION_TAGS_MAX, locale),
    }),
  };
}

async function failed(): Promise<{ ok: false; error: string }> {
  const t = await getTranslations("transactions");
  return { ok: false, error: t("failed") };
}

/**
 * Validates the form's input with the viewer's today, then the accounts and category it
 * points to. `current` is what an edited transaction stores (it may keep an archived account
 * or category).
 */
async function validate(
  input: unknown,
  current?: TransactionInput | null,
): Promise<{ data: TransactionInput } | { error: FormResult & { ok: false } }> {
  const today = todayIso((await getPreferences()).timeZone);
  const parsed = transactionSchema(today).safeParse(input);
  if (!parsed.success) {
    const errors = transactionErrors(input, today);
    const [field, error] = Object.entries(errors)[0] ?? [];
    return {
      error:
        field && error
          ? await fieldError(field as TransactionField, error)
          : await failed(),
    };
  }
  const problem = await checkTransactionReferences(parsed.data, current);
  if (problem === "accountUnavailable") {
    return { error: await fieldError("accountId", problem) };
  }
  if (problem === "toAccountUnavailable") {
    return { error: await fieldError("toAccountId", problem) };
  }
  if (problem === "categoryUnavailable") {
    return { error: await fieldError("categoryId", problem) };
  }
  return { data: parsed.data };
}

/** Adds a transaction from the web form (source «web»). Returns its id, for undo. */
export async function createTransaction(
  input: unknown,
): Promise<FormResult<{ id: string }>> {
  const { user } = await requireWrite();
  const result = await validate(input);
  if ("error" in result) return result.error;
  const id = await insertTransaction(result.data, user.id, "web");
  refresh();
  return { ok: true, id };
}

/** Changes a transaction; the acting user becomes its last editor. */
export async function updateTransaction(input: unknown): Promise<FormResult> {
  const { user } = await requireWrite();
  const parsedId = idSchema.safeParse(input);
  if (!parsedId.success) return failed();
  const current = await getTransactionInput(parsedId.data.id);
  if (!current) return failed();
  const result = await validate(input, current);
  if ("error" in result) return result.error;
  if (!(await saveTransaction(parsedId.data.id, result.data, user.id))) {
    return failed();
  }
  refresh();
  return { ok: true };
}

/**
 * Deletes a transaction. Returns what it stored, so «واگرد» can add it again with
 * restoreTransaction.
 */
export async function deleteTransaction(
  input: unknown,
): Promise<ActionResult<never, { deleted: TransactionInput }>> {
  await requireWrite();
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return failed();
  const deleted = await removeTransaction(parsed.data.id);
  if (!deleted) return failed();
  refresh();
  return { ok: true, deleted };
}

/**
 * Adds a deleted transaction again (undo), under a new id and by the acting user. Unlike a
 * new transaction, it may use the archived account or category it had.
 */
export async function restoreTransaction(
  input: unknown,
): Promise<FormResult<{ id: string }>> {
  const { user } = await requireWrite();
  const today = todayIso((await getPreferences()).timeZone);
  const parsed = transactionSchema(today).safeParse(input);
  if (!parsed.success) return failed();
  const result = await validate(input, parsed.data);
  if ("error" in result) return result.error;
  const id = await insertTransaction(result.data, user.id, "web");
  refresh();
  return { ok: true, id };
}

/**
 * The next page of the list (any role). Takes the page's URL query, so the server reads the filters and
 * the viewer's calendar month the same way the page does.
 */
export async function loadTransactions(input: {
  query: string;
  cursor: string;
  /** Rows to load; more than a page when reloading the pages already shown. */
  limit?: number;
}): Promise<TransactionPage> {
  await requireUser();
  const parsed = z
    .object({
      query: z.string().max(2000),
      cursor: z.string().max(200),
      limit: z.number().int().min(1).max(MAX_RELOAD_ROWS).optional(),
    })
    .parse(input);
  const { calendar, timeZone } = await getPreferences();
  const params = parseTransactionParams(new URLSearchParams(parsed.query));
  const period = resolveTransactionPeriod(params, calendar, todayIso(timeZone));
  return listTransactions(
    toTransactionFilters(params, period),
    parsed.cursor,
    parsed.limit,
  );
}
