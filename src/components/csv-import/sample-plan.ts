import {
  completeMatches,
  guessAmountMode,
  guessColumnMap,
  planImport,
  toImportRecords,
} from "@/helpers/csv-import";
import { sample } from "@/helpers/sample";
import type { CsvFile, ImportDuplicate } from "@/types/csv";

import { SAMPLE_IMPORT_BOOK, SAMPLE_IMPORT_FILE_FA } from "./sample-import";

/**
 * Stories: the sample file planned against the sample book, in tomans, today 2026-10-08. The
 * file and the book follow the language toolbar, so call it while rendering, not at module level.
 */
export function samplePlan(file: CsvFile = sample(SAMPLE_IMPORT_FILE_FA)) {
  const mapping = guessColumnMap(file.rows[0] ?? []);
  const format = {
    amountMode: guessAmountMode(mapping),
    rialUnit: "toman" as const,
  };
  const records = toImportRecords(file.rows, true, mapping, format.amountMode);
  const context = {
    book: sample(SAMPLE_IMPORT_BOOK),
    currency: "IRR" as const,
    today: "2026-10-08",
  };
  const { matches, names } = completeMatches(records, format, context, {});
  return {
    file,
    records,
    matches,
    names,
    plan: planImport(records, format, context, matches),
  };
}

/** Two of the ready rows as possible duplicates of stored transactions. */
export function sampleDuplicates(): ImportDuplicate[] {
  const { plan } = samplePlan();
  return plan.rows
    .filter((row) => row.account.kind === "existing")
    .slice(0, 2)
    .map((row) => ({
      line: row.line,
      date: row.date,
      accountId: row.account.kind === "existing" ? row.account.id : "",
      description: sample("خرید از فروشگاه"),
    }));
}
