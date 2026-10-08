"use server";

import { refresh } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { requireUser, requireWrite } from "@/auth/session";
import { findImportDuplicates, saveImport } from "@/db/import";
import { listTransactionOptions, transactionTotals } from "@/db/transactions";
import {
  duplicateQuery,
  duplicateQuerySchema,
  importPayloadSchema,
  planImport,
  usedNewItems,
} from "@/helpers/csv-import";
import { NO_TRANSACTION_FILTERS } from "@/helpers/transaction-filters";
import { getPreferences } from "@/i18n/preferences";
import type { ActionResult } from "@/types/action";
import type { ImportDuplicate, ImportResult } from "@/types/csv";
import { todayIso } from "@/utils/iso-date";

/*
 * Server Actions of /settings/import-export. Counting an export's rows is for every role
 * (requireUser()); looking for duplicates and saving an import change or prepare to change the
 * book, so they call requireWrite() first. The import is planned again here with the book read
 * fresh and the viewer's today: what the browser showed is never trusted.
 */

const countSchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
  accountId: z.uuid().nullable(),
});

/** How many transactions an export of the range (and account) would hold. */
export async function countExportTransactions(input: unknown): Promise<number> {
  await requireUser();
  const parsed = countSchema.safeParse(input);
  if (!parsed.success) return 0;
  const { count } = await transactionTotals({
    ...NO_TRANSACTION_FILTERS,
    ...parsed.data,
  });
  return count;
}

/** Ready rows of an import that look like transactions the book already has. */
export async function checkImportDuplicates(
  input: unknown,
): Promise<ActionResult<never, { duplicates: ImportDuplicate[] }>> {
  await requireWrite();
  const parsed = duplicateQuerySchema.safeParse(input);
  if (!parsed.success) {
    const t = await getTranslations("importExport.import.saveErrors");
    return { ok: false, error: t("invalid") };
  }
  return { ok: true, duplicates: await findImportDuplicates(parsed.data) };
}

/**
 * Saves an import: checks every row again (Zod), applies the names step's choices, leaves out
 * possible duplicates unless they were chosen, creates the new accounts and categories and
 * adds the rows, all in one database transaction. Rows get source «csv» and the importing
 * user as their creator.
 */
export async function importTransactions(
  input: unknown,
): Promise<ActionResult<never, { result: ImportResult }>> {
  const { user } = await requireWrite();
  const t = await getTranslations("importExport.import.saveErrors");
  const parsed = importPayloadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t("invalid") };
  const payload = parsed.data;

  const [book, { currency, timeZone }] = await Promise.all([
    listTransactionOptions(),
    getPreferences(),
  ]);
  // An IRR book needs to know whether the file's amounts are rials or tomans.
  if (currency === "IRR" && payload.rialUnit === null) {
    return { ok: false, error: t("invalid") };
  }
  const plan = planImport(
    payload.records,
    { amountMode: payload.amountMode, rialUnit: payload.rialUnit },
    { book, currency, today: todayIso(timeZone) },
    payload.matches,
  );

  const duplicates = await findImportDuplicates(duplicateQuery(plan.rows));
  const addAnyway = new Set(payload.addDuplicates);
  const skipped = new Set(
    duplicates
      .map((duplicate) => duplicate.line)
      .filter((line) => !addAnyway.has(line)),
  );
  const rows = plan.rows.filter((row) => !skipped.has(row.line));
  if (rows.length === 0) return { ok: false, error: t("nothing") };

  const created = usedNewItems(rows, plan.accounts, plan.categories);
  const saved = await saveImport(
    { rows, accounts: created.accounts, categories: created.categories },
    user.id,
  );
  if (saved === "taken") return { ok: false, error: t("taken") };

  refresh();
  return {
    ok: true,
    result: {
      added: rows.length,
      skipped: skipped.size,
      failed: plan.errors.length,
      created: {
        accounts: created.accounts.length,
        categories: created.categories.filter((c) => c.parent === null).length,
        subcategories: created.categories.filter((c) => c.parent !== null)
          .length,
      },
    },
  };
}
