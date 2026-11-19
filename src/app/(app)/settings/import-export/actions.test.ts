import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_TRANSACTION_OPTIONS } from "@/components/transaction-list/sample-transactions";
import { CSV_FIELDS } from "@/constants/csv";
import { findImportDuplicates, saveImport } from "@/db/import";
import { listTransactionOptions, transactionTotals } from "@/db/transactions";
import { t } from "@/test/messages";
import { outcome, resetServer, signInAs, TEST_USER_ID } from "@/test/server";
import type { CsvField } from "@/types/csv";

import {
  checkImportDuplicates,
  countExportTransactions,
  importTransactions,
} from "./actions";

vi.mock("@/auth", () => import("@/test/server"));
vi.mock("next/headers", () => import("@/test/server"));
vi.mock("next/navigation", () => import("@/test/server"));
vi.mock("next/cache", () => import("@/test/server"));
vi.mock("next-intl/server", () => import("@/test/server"));
vi.mock("@/i18n/preferences", () => import("@/test/server"));
vi.mock("@/db/import", () => ({
  findImportDuplicates: vi.fn(),
  saveImport: vi.fn(),
}));
vi.mock("@/db/transactions", () => ({
  listTransactionOptions: vi.fn(),
  transactionTotals: vi.fn(),
}));

/** A record as the browser sends it: the mapped cells in CSV_FIELDS order. */
function record(line: number, cells: Partial<Record<CsvField, string>>) {
  return { line, cells: CSV_FIELDS.map((field) => cells[field] ?? "") };
}

const ROWS = [
  record(2, {
    date: "1405/07/10",
    amount: "850000",
    type: "هزینه",
    account: "بانک ملی",
    category: "خوراک",
    subcategory: "سوپرمارکت",
  }),
  record(3, {
    date: "1405/07/12",
    amount: "120000",
    type: "هزینه",
    account: "بانک ملی",
    category: "خوراک",
  }),
  // No amount: an error row, never saved.
  record(4, { date: "1405/07/13", type: "هزینه", account: "بانک ملی" }),
];

const payload = {
  amountMode: "typed",
  rialUnit: "rial",
  records: ROWS,
  matches: {},
  addDuplicates: [],
};

beforeEach(() => {
  resetServer();
  // 28 Aban 1405 in Tehran.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-19T09:00:00Z"));
  vi.mocked(listTransactionOptions).mockResolvedValue(
    SAMPLE_TRANSACTION_OPTIONS,
  );
  vi.mocked(findImportDuplicates).mockResolvedValue([]);
  vi.mocked(saveImport).mockResolvedValue("saved" as never);
});
afterEach(() => vi.useRealTimers());

describe("importTransactions", () => {
  it("is refused to viewers", async () => {
    signInAs("viewer");
    expect(await outcome(() => importTransactions(payload))).toBe("notFound");
    expect(await outcome(() => checkImportDuplicates([]))).toBe("notFound");
    expect(saveImport).not.toHaveBeenCalled();
  });

  it("plans the rows again on the server and saves the good ones as the user", async () => {
    signInAs("editor");

    const result = await importTransactions(payload);

    expect(result).toEqual({
      ok: true,
      result: {
        added: 2,
        skipped: 0,
        failed: 1,
        created: { accounts: 0, categories: 0, subcategories: 0 },
      },
    });
    const [saved, actor] = vi.mocked(saveImport).mock.calls[0]!;
    expect(actor).toBe(TEST_USER_ID);
    expect(saved.rows.map((row) => row.line)).toEqual([2, 3]);
    expect(saved.rows[0]).toMatchObject({
      date: "2026-10-02",
      amount: 850_000,
    });
  });

  it("reads tomans when the user chose them", async () => {
    signInAs("editor");
    await importTransactions({ ...payload, rialUnit: "toman" });
    const [saved] = vi.mocked(saveImport).mock.calls[0]!;
    expect(saved.rows[0]).toMatchObject({ amount: 8_500_000 });
  });

  it("leaves out possible duplicates unless the user chose to add them", async () => {
    signInAs("editor");
    vi.mocked(findImportDuplicates).mockResolvedValue([{ line: 2 } as never]);

    const skipped = await importTransactions(payload);
    expect(skipped).toMatchObject({
      ok: true,
      result: { added: 1, skipped: 1 },
    });

    const added = await importTransactions({ ...payload, addDuplicates: [2] });
    expect(added).toMatchObject({ ok: true, result: { added: 2, skipped: 0 } });
  });

  it("refuses an IRR import that doesn't say rials or tomans", async () => {
    signInAs("editor");
    expect(await importTransactions({ ...payload, rialUnit: null })).toEqual({
      ok: false,
      error: t("importExport.import.saveErrors.invalid"),
    });
    expect(saveImport).not.toHaveBeenCalled();
  });

  it("refuses a payload that doesn't fit the schema", async () => {
    signInAs("editor");
    expect(
      await importTransactions({
        ...payload,
        records: [{ line: 1, cells: ["x"] }],
      }),
    ).toEqual({
      ok: false,
      error: t("importExport.import.saveErrors.invalid"),
    });
  });

  it("says when nothing is left to add", async () => {
    signInAs("editor");
    expect(
      await importTransactions({ ...payload, records: [ROWS[2]] }),
    ).toEqual({
      ok: false,
      error: t("importExport.import.saveErrors.nothing"),
    });
  });

  it("says when a name was taken in the meantime", async () => {
    signInAs("editor");
    vi.mocked(saveImport).mockResolvedValue("taken");
    expect(await importTransactions(payload)).toEqual({
      ok: false,
      error: t("importExport.import.saveErrors.taken"),
    });
  });
});

describe("countExportTransactions", () => {
  it("counts for every role, and counts nothing for a bad range", async () => {
    signInAs("viewer");
    vi.mocked(transactionTotals).mockResolvedValue({ count: 42 } as never);

    expect(
      await countExportTransactions({
        from: "2026-10-23",
        to: "2026-11-19",
        accountId: null,
      }),
    ).toBe(42);
    expect(
      await countExportTransactions({
        from: "yesterday",
        to: "today",
        accountId: null,
      }),
    ).toBe(0);
    expect(transactionTotals).toHaveBeenCalledTimes(1);
  });
});
